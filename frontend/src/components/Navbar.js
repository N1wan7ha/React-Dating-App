import React from 'react';
import { Home, Heart, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to leave LoveConnect?");

  if (confirmLogout) {
    // Clear session data (localStorage, sessionStorage, cookies)
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload(); 

    // Redirect to login page, forcing a new session
    navigate('/login');
  }
};
  

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </h1>
          </div>
          
          {/* For large screens, Matches icon stays at the top */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Home"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Matches"
            >
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={() => navigate('/edit-profile')} // Navigating to EditProfile page
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Profile"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={handleLogout} // Calling the logout logic with confirmation
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile layout: LoveConnect and Matches on top, Home/Profile/Logout at the bottom */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-lg">
          {/* LoveConnect on the left, Matches on the right */}
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </h1>
            <button 
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Matches"
            >
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bottom icons for Home, Profile, and Logout */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
          <div className="flex items-center justify-between px-4 py-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Home"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={() => navigate('/edit-profile')} // Navigating to EditProfile page
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Profile"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={handleLogout} // Calling the logout logic with confirmation
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
