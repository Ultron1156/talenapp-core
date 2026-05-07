import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Kullanıcı giriş yapmamışsa, login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı giriş yapmışsa, istenen sayfayı göster
  return children;
};

export default ProtectedRoute;