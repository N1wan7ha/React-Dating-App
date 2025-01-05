import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, UserCircle, Camera } from 'lucide-react';

const INTERESTS = [
  "Travel 🌎",
  "Photography 📸",
  "Fitness 💪",
  "Cooking 👨‍🍳",
  "Music 🎵",
  "Gaming 🎮",
  "Reading 📚",
  "Art 🎨",
  "Dancing 💃",
  "Movies 🎬",
  "Yoga 🧘‍♀️",
  "Hiking 🏃‍♀️",
  "Coffee ☕",
  "Wine 🍷",
  "Pets 🐾"
];

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    interests: []
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Generate age options from 18 to 70
  const ageOptions = Array.from({ length: 53 }, (_, i) => i + 18);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      const updatedInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 3
        ? [...prev.interests, interest]
        : prev.interests;

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

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("interests", JSON.stringify(formData.interests));
  
    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account created successfully!');
        navigate('/');
      } else {
        alert(data.error || 'Failed to create account.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating your account.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Join LoveConnect
          </h2>

          {/* Profile Picture Upload Section */}
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
            <p className="text-sm text-gray-500 mt-2">Add your best photo</p>
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

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-pink-500 hover:text-pink-600 font-semibold">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;