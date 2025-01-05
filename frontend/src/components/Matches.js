// import React, { useState, useEffect } from 'react';
// import { MessageCircle, Heart, X } from 'lucide-react';
// import Navbar from './Navbar';
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";

// const MatchesPage = () => {
//   const [matches, setMatches] = useState([]);
//   const [likes, setLikes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchMatches();
//     fetchLikes();
//   }, []);

//   const fetchMatches = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/users/matches', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) throw new Error('Failed to fetch matches');
//       const data = await response.json();
//       setMatches(data);
//     } catch (err) {
//       setError('Error loading matches');
//       console.error('Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLikes = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/users/likes', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) throw new Error('Failed to fetch likes');
//       const data = await response.json();
//       setLikes(data);
//     } catch (err) {
//       setError('Error loading likes');
//       console.error('Error:', err);
//     }
//   };

//   const ProfileCard = ({ profile, type }) => (
//     <Card className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
//       <CardContent className="p-0">
//         <div className="relative">
//           <img
//             src={profile.image || "/api/placeholder/400/320"}
//             alt={profile.name}
//             className="w-full h-48 object-cover"
//             onError={(e) => {
//               e.target.onerror = null;
//               e.target.src = "/api/placeholder/400/320";
//             }}
//           />
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
//             <h3 className="text-xl font-bold text-white">{profile.name}, {profile.age}</h3>
//           </div>
//         </div>
        
//         <div className="p-4 space-y-3">
//           <p className="text-gray-600 text-sm">{profile.bio}</p>
          
//           <div className="flex flex-wrap gap-2">
//             {profile.interests?.map((interest, idx) => (
//               <span 
//                 key={idx} 
//                 className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full"
//               >
//                 {interest}
//               </span>
//             ))}
//           </div>

//           <div className="flex justify-between items-center pt-3">
//             {type === 'match' ? (
//               <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors">
//                 <MessageCircle size={18} />
//                 Message
//               </button>
//             ) : (
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Heart size={18} className="fill-current text-pink-500" />
//                 <span className="text-sm">Liked</span>
//               </div>
//             )}
//             <span className="text-xs text-gray-400">
//               {type === 'match' ? 'Matched!' : 'Waiting for response...'}
//             </span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-pink-400 via-purple-400 to-purple-300">
//         <Navbar />
//         <div className="flex justify-center items-center h-[calc(100vh-64px)]">
//           <div className="text-white text-xl">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-pink-400 via-purple-400 to-purple-300">
//         <Navbar />
//         <div className="flex justify-center items-center h-[calc(100vh-64px)]">
//           <div className="text-white text-xl">{error}</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-pink-400 via-purple-400 to-purple-300">
//       <Navbar />
      
//       <div className="container mx-auto px-4 py-8">
//         <Tabs defaultValue="matches" className="w-full">
//           <TabsList className="w-full max-w-md mx-auto mb-8">
//             <TabsTrigger value="matches" className="w-1/2">
//               <div className="flex items-center gap-2">
//                 <MessageCircle size={18} />
//                 Matches ({matches.length})
//               </div>
//             </TabsTrigger>
//             <TabsTrigger value="likes" className="w-1/2">
//               <div className="flex items-center gap-2">
//                 <Heart size={18} />
//                 Likes ({likes.length})
//               </div>
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="matches">
//             {matches.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
//                   <MessageCircle size={40} className="text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
//                 <p className="text-white/80">Keep swiping to find your match!</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {matches.map(match => (
//                   <ProfileCard key={match.id} profile={match} type="match" />
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           <TabsContent value="likes">
//             {likes.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
//                   <Heart size={40} className="text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-white mb-2">No likes yet</h3>
//                 <p className="text-white/80">Your likes will appear here</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {likes.map(like => (
//                   <ProfileCard key={like.id} profile={like} type="like" />
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default MatchesPage;