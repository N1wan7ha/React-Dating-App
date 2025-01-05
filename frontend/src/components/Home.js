import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Heart, RotateCcw} from 'lucide-react';
import Navbar from './Navbar';

const SWIPE_THRESHOLD = 100;
const ROTATION_ANGLE = 0.1;

const Card = ({ data, position, index, active, onSwipe }) => {
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  // Parse interests safely with multiple fallback approaches
  const interests = useMemo(() => {
    try {
      // If it's already an array, return it
      if (Array.isArray(data.interests)) return data.interests;
      
      // If it's a string, try to parse it
      if (typeof data.interests === 'string') {
        const parsed = JSON.parse(data.interests);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // If it's neither an array nor a valid JSON string, return empty array
      return [];
    } catch {
      return [];
    }
  }, [data.interests]);

  const handleStart = (clientX, clientY) => {
    if (!active) return;
    setIsDragging(true);
    dragRef.current = {
      startX: clientX - cardPosition.x,
      startY: clientY - cardPosition.y
    };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging || !active) return;
    const x = clientX - dragRef.current.startX;
    const y = clientY - dragRef.current.startY;
    setCardPosition({ x, y });
  };

  const handleEnd = () => {
    if (!active) return;
    setIsDragging(false);
    
    if (Math.abs(cardPosition.x) > SWIPE_THRESHOLD) {
      const direction = cardPosition.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    } else {
      setCardPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div 
      className={`absolute w-72 h-96 ${active ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: `
          translate(${position.x + cardPosition.x}px, ${position.y - index * 4}px) 
          rotate(${cardPosition.x * ROTATION_ANGLE}deg)
          scale(${1 - index * 0.05})
        `,
        zIndex: 1000 - index,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onMouseDown={(e) => handleStart(e.pageX, e.pageY)}
      onMouseMove={(e) => handleMove(e.pageX, e.pageY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative h-5/6">
          <img 
            src={data.image || "/api/placeholder/400/320"} 
            alt={data.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/api/placeholder/400/320";
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
            <h3 className="text-2xl font-bold">{data.name}, {data.age}</h3>
          </div>
        </div>
        <div className="p-1 space-y-2">
          <center><p className="text-gray-700 text-xs">{data.bio || ""}</p></center>  
          <div className="flex flex-wrap gap-2 justify-center">
            {interests.map((interest, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"> 
                {interest}
              </span>
            ))}
          </div>
        </div>

        {active && (
          <>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              cardPosition.x > 50 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="rotate-12 border-8 border-green-500 text-green-500 px-8 py-4 text-6xl font-bold rounded-lg">
                LIKE
              </div>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              cardPosition.x < -50 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="-rotate-12 border-8 border-red-500 text-red-500 px-8 py-4 text-6xl font-bold rounded-lg">
                NOPE
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TinderCard = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
      fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
      try {
          setIsLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/users/profiles', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (!response.ok) {
              throw new Error('Failed to fetch profiles');
          }

          const data = await response.json();
          setCards(data);
          setLastFetch(new Date());
          setError(null);
      } catch (err) {
          console.error('Error fetching profiles:', err);
          setError(err.message);
          setCards([]);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSwipe = async (direction) => {
      try {
          const token = localStorage.getItem('token');
          const currentCard = cards[0];
          
          const response = await fetch('http://localhost:5000/users/swipe', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  swipedId: currentCard.id,
                  action: direction === 'right' ? 'like' : 'dislike'
              })
          });

          if (!response.ok) {
              throw new Error('Failed to record swipe action');
          }

          const data = await response.json();
          
          if (data.isMatch) {
              alert(`It's a match with ${currentCard.name}!`);
          }
          
          setCards((prevCards) => prevCards.slice(1));
          
      } catch (error) {
          console.error('Error recording swipe:', error);
      }
  };

  const handleRefresh = () => {
      // Only allow refresh after 1 hour
      if (lastFetch && (new Date() - lastFetch) < 3600000) {
          const minutesLeft = Math.ceil((3600000 - (new Date() - lastFetch)) / 60000);
          alert(`Please wait ${minutesLeft} minutes before refreshing again.`);
          return;
      }
      fetchProfiles();
  };

  if (isLoading) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-white">Loading profiles...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-white">Error: {error}</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-400 via-purple-400 to-purple-300">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center mt-16">
            <div className="relative w-72 h-96 mb-8">
                {cards.map((card, index) => (
                    <Card
                        key={card.id}
                        data={card}
                        position={{ x: 0, y: 0 }}
                        index={index}
                        active={index === 0}
                        onSwipe={handleSwipe}
                    />
                ))}
                
                {cards.length === 0 && !isLoading && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl p-6 text-center">
                        <p className="text-2xl font-bold text-gray-500 mb-2">That's all for now!</p>
                        <p className="text-gray-400 mb-6">Come back later to discover new people</p>
                        <img 
                            src="/api/placeholder/200/200"
                            alt="No more profiles"
                            className="w-32 h-32 mb-4 opacity-50"
                        />
                        <p className="text-sm text-gray-400">
                            We'll notify you when new people join
                        </p>
                    </div>
                )}
            </div>

            <div className="flex gap-6 mb-8">
                <button
                    onClick={() => cards.length > 0 && handleSwipe('left')}
                    className={`p-4 bg-white rounded-full shadow-lg transition-transform hover:scale-110 
                        ${cards.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-red-500'}`}
                    disabled={cards.length === 0}
                >
                    <X className="w-8 h-8" />
                </button>

                {/* <button
                    onClick={handleUndo}
                    className={`p-4 bg-white rounded-full shadow-lg transition-transform hover:scale-110 
                        ${cards.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-purple-500'}`}
                    disabled={cards.length === 0}
                >
                    <RotateCcw className="w-8 h-8" />
                </button> */}

                <button
                    onClick={() => cards.length > 0 && handleSwipe('right')}
                    className={`p-4 bg-white rounded-full shadow-lg transition-transform hover:scale-110 
                        ${cards.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-green-500'}`}
                    disabled={cards.length === 0}
                >
                    <Heart className="w-8 h-8" />
                </button>
            </div>
        </div>
    </div>
);
};

export default TinderCard;