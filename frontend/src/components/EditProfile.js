import React, { useState, useEffect } from 'react';
import { Heart, UserCircle, Camera } from 'lucide-react';
import Navbar from './Navbar';

const INTERESTS = [
  "Travel 🌎", "Photography 📸", "Fitness 💪", "Cooking 👨‍🍳",
  "Music 🎵", "Gaming 🎮", "Reading 📚", "Art 🎨",
  "Dancing 💃", "Movies 🎬", "Yoga 🧘‍♀️", "Hiking 🏃‍♀️",
  "Coffee ☕", "Wine 🍷", "Pets 🐾"
];

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    email: '',
    bio: '',
    interests: [], 
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const ageOptions = Array.from({ length: 53 }, (_, i) => i + 18);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userData = await response.json();
      console.log('Received profile image:', userData.profile_image); // Debug log
  
      setFormData(prev => ({
        ...prev,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        age: userData.age || '',
        gender: userData.gender || '',
        email: userData.email || '',
        bio: userData.bio || '',
        interests: userData.interests || [],
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
  
      if (userData.profile_image) {
        setImagePreview(userData.profile_image);
        console.log('Set image preview to:', userData.profile_image); // Debug log
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (['newPassword', 'confirmNewPassword'].includes(name)) {
      setPasswordError('');
    }
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => {
      const updatedInterests = Array.isArray(prev.interests)
        ? prev.interests.includes(interest)
          ? prev.interests.filter(i => i !== interest)
          : prev.interests.length < 3
            ? [...prev.interests, interest]
            : prev.interests
        : [];
      return { ...prev, interests: updatedInterests };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const validatePasswords = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setPasswordError("New passwords don't match!");
      return false;
    }
    if (formData.newPassword && !formData.currentPassword) {
      setPasswordError("Current password is required to set new password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;
  
    try {
      // If password is being changed, validate it first
      if (formData.currentPassword && formData.newPassword) {
        const passwordResponse = await fetch('http://localhost:5000/profile/change-password', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });
  
        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          setPasswordError(data.error || 'Failed to update password');
          return;
        }
      }
  
      // Create FormData for profile update
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("age", formData.age);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("interests", JSON.stringify(formData.interests));
  
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }
  
      const profileResponse = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });
  
      if (profileResponse.ok) {
        alert('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        const data = await profileResponse.json();
        alert(data.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while updating your profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4 pt-20">
      <Navbar />
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Edit Profile
          </h2>

          <div className="mt-8 mb-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-pink-500 overflow-hidden flex items-center justify-center bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-2 cursor-pointer hover:bg-pink-600 transition-colors">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-4">
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Age</option>
              {ageOptions.map((age) => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <textarea
            name="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <div>
            <p className="text-sm text-gray-600 mb-2">Select up to 3 interests:</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestChange(interest)}
                  className={`px-3 py-1 rounded-full ${
                    formData.interests.includes(interest)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={
                    !formData.interests.includes(interest) &&
                    formData.interests.length >= 3
                  }
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3
              className="text-lg font-semibold text-gray-700 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              Change Password
            </h3>

            {isPasswordVisible && (
              <>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;