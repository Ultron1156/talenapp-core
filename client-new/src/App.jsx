import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import userService from './services/userService';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import EditProfilePage from './pages/EditProfilePage';
import FeedPage from './pages/FeedPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import DiscoverPage from './pages/DiscoverPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 1. Önce kullanıcının kendi veritabanımızdaki profilini çek
          const userData = await userService.getMyProfile();
          setCurrentUser(userData);
          
          // 🔥 2. FIREBASE KİLİDİNİ AÇ: Bizim adamımız olduğunu anladığımız an Firebase biletini okut! 🔥
          try {
              await userService.authenticateWithFirebase();
          } catch (firebaseErr) {
              console.error("Firebase authentication failed. Chat might not work:", firebaseErr);
          }
          
        } catch (error) {
          console.error("Oturum doğrulanırken hata:", error);
          localStorage.clear(); // Geçersiz token'ı temizle
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    // Token'dan temel bilgileri alıp state'i hemen güncelleyebiliriz
    // Ama tam veri için sayfa yenilemesi veya yeni bir API isteği gerekir.
    // Şimdilik en sağlam yöntem, sayfayı yeniden yükleterek useEffect'in tam veriyi çekmesini sağlamak.
    window.location.href = '/feed';
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    navigate('/login');
  };
  
  if (loading) {
    return <div className="h-screen w-full bg-gray-100 dark:bg-gray-900"></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          
          {/* Artık currentUser'ı prop olarak gönderiyoruz */}
          <Route path="/feed" element={ <ProtectedRoute><FeedPage currentUser={currentUser} /></ProtectedRoute> } />
          <Route path="/chat" element={ <ProtectedRoute><ChatPage currentUser={currentUser} /></ProtectedRoute> } />
          <Route path="/discover" element={ <ProtectedRoute><DiscoverPage /></ProtectedRoute> } />
          <Route path="/profile/edit" element={ <ProtectedRoute><EditProfilePage /></ProtectedRoute> } />
          <Route path="/profile/:userId" element={ <ProtectedRoute><UserProfilePage /></ProtectedRoute> } />
          <Route path="/settings" element={ <ProtectedRoute><SettingsPage /></ProtectedRoute> } />
        </Routes>
      </main>
    </div>
  );
}

export default App;