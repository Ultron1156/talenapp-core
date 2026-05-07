import React, { useState } from 'react';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await authService.forgotPassword(email);
      if (response.message.includes('not found')) {
        setError(response.message);
      } else {
        setMessage(response.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Reset Your Password</h2>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center text-sm">{message}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <p className="text-center text-sm text-gray-600 mb-4">
            Enter the email address associated with your account, and we will send you a link to reset your password.
          </p>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-monster-purple"
            />
          </div>
          <button type="submit" className="w-full bg-monster-turquoise hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl transition duration-300">
            Send Reset Link
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-monster-purple hover:underline font-bold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;