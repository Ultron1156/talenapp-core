import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { auth } from '../firebase'; // Firebase bağlantısı (Doğru yolda olduğundan emin ol)
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Standart E-Posta / Şifre Girişi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await authService.login(email, password);
      if (data.success && data.token) {
        onLogin(data.token);
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch (err) {
      setError('A server error occurred!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 YENİ: Google ile Giriş 🔥
  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Google'dan dönen verileri Backend'e yolla
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://talenapp-core.onrender.com'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.displayName,
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
         setError('Sign-in popup was closed.');
      } else {
         setError('An error occurred during Google Sign-In.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center h-full">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">Log In</h2>
        <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-pulse">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Google Butonu */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 mb-6 shadow-sm disabled:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isSubmitting ? 'Connecting...' : 'Continue with Google'}
      </button>

      <div className="flex items-center mb-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col">
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onInvalid={(e) => e.target.setCustomValidity("Please enter a valid email address.")}
            onInput={(e) => e.target.setCustomValidity('')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-monster-purple focus:bg-white transition-all duration-200"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-monster-purple hover:text-purple-700 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            onInvalid={(e) => e.target.setCustomValidity("Please fill out this field.")}
            onInput={(e) => e.target.setCustomValidity('')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-monster-purple focus:bg-white transition-all duration-200"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-monster-purple to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account? <Link to="/register" className="text-monster-turquoise hover:text-teal-600 font-bold transition-colors">Sign up for free</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;