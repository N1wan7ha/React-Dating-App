import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare login data
    const loginData = {
      email,
      password,
    };

    try {
      // Send login request to the backend
      const response = await fetch('http://localhost:5000/login',  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token in localStorage after successful login
        localStorage.setItem('token', data.token);
        console.log('Login successful', data);

        // Redirect user to home page after login
        window.location.href = '/';  // Redirect to the home page ("/")
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred, please try again.');
    } finally {
      setLoading(false);
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
            LoveConnect
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back! Ready to find your perfect match?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          {error && <div className="text-red-500 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold"
          >
            {loading ? 'Logging in...' : 'Find Love'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-pink-500 hover:text-pink-600 font-semibold">
              Join now
            </a>
          </p>
          <a href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-600 block">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
