import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { auth } from '../firebase'; // Firebase bağlantısını ekledik
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Register = ({ onLogin }) => { // onLogin prop'unu ekledik ki Google ile girerse direkt siteye yollayalım
  // Aşama kontrolü: 1 = Kayıt Formu, 2 = Doğrulama Kodu Formu
  const [step, setStep] = useState(1);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState(''); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Yüklenme durumu için ekledik
  const navigate = useNavigate();

  // 1. Aşama: Kullanıcıyı Kaydet ve E-posta Gönder
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await authService.register(username, email, password);
      
      if (res.message.includes('successful') || res.message.includes('sent')) {
        // Kayıt başarılıysa veya kod tekrar gönderildiyse 2. aşamaya geç
        setStep(2);
      } else {
        setError(res.message || 'An error occurred.');
      }
    } catch (err) {
      setError('A server error occurred!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Aşama: Girilen 6 Haneli Kodu Backend'e Gönder ve Doğrula
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://talenapp-core.onrender.com'}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert('Verification successful! You can now log in.');
        navigate('/login');
      } else {
        setError(data.message || 'Invalid verification code.');
      }
    } catch (err) {
      setError('A server error occurred during verification!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 YENİ: Google ile Kayıt/Giriş 🔥
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
        // Eğer onLogin fonksiyonu tanımlıysa (App.jsx'ten geliyorsa) direkt içeri al
        if (onLogin) {
          onLogin(data.token);
        } else {
          // Aksi takdirde login sayfasına yönlendir (veya anasayfaya)
          navigate('/login');
        }
      } else {
        setError(data.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
         setError('Sign-up popup was closed.');
      } else {
         setError('An error occurred during Google Sign-Up.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 1. AŞAMA: KAYIT FORMU */}
      {step === 1 && (
        <form onSubmit={handleRegisterSubmit}>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Account</h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
          
          {/* 🔥 Google Butonu 🔥 */}
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
            {isSubmitting ? 'Connecting...' : 'Sign Up with Google'}
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-monster-purple"
            />
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-monster-purple"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-monster-purple"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-monster-turquoise hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-none disabled:opacity-70">
            {isSubmitting ? 'Processing...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/login" className="text-monster-purple hover:underline font-bold">Log In</Link>
          </p>
        </form>
      )}

      {/* 2. AŞAMA: 6 HANELİ KOD DOĞRULAMA EKRANI */}
      {step === 2 && (
        <form onSubmit={handleVerifySubmit}>
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Verify Email</h2>
          <p className="text-center text-gray-600 mb-8 text-sm">
            We've sent a 6-digit verification code to <br/>
            <span className="font-bold text-monster-purple">{email}</span>
          </p>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
          
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-bold mb-2 text-center" htmlFor="otpCode">
              Enter 6-Digit Code
            </label>
            <input
              id="otpCode"
              type="text"
              maxLength="6"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Sadece rakam
              required
              placeholder="123456"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-monster-purple text-center text-3xl tracking-[0.5em] font-bold"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-monster-purple hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-none disabled:opacity-70">
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6 cursor-pointer hover:underline" onClick={() => setStep(1)}>
            Wrong email address? Go back.
          </p>
        </form>
      )}
    </div>
  );
};

export default Register;