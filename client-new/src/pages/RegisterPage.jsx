import React from 'react';
import Register from '../components/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-xl overflow-hidden my-4">
        {/* Sol Panel - Görsel/Mesaj */}
        <div className="hidden md:flex w-1/2 bg-monster-purple text-white p-12 flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-bold mb-3">Join Our Community</h2>
          <p>Create your account to start your language learning journey today.</p>
        </div>
        {/* Sağ Panel - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <Register />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;