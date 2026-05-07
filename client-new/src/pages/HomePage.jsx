import React from 'react';
import { useNavigate } from 'react-router-dom';

// Özellik kartları için bir bileşen
const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-monster-turquoise text-white mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{children}</p>
  </div>
);

// "Nasıl Çalışır?" adımlarını gösterecek bileşen
const StepCard = ({ number, title, children }) => (
    <div className="text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white border-2 border-monster-purple text-monster-purple font-bold text-2xl mx-auto mb-4">
            {number}
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">{children}</p>
    </div>
);


export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* --- Ana Karşılama Alanı (Hero Section) --- */}
      <div className="relative min-h-screen flex items-center justify-center text-center text-white px-4">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            Talk&Learn
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
            Join a global community, practice languages with real people, and improve your skills through conversation.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-monster-turquoise hover:bg-teal-500 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-xl"
          >
            Start Practicing for Free
          </button>
        </div>
      </div>

      {/* --- Özellikler Alanı --- */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Why Talk&Learn?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>}
              title="Real Conversations"
            >
              Connect with native speakers and practice your skills in real-time, authentic conversations.
            </FeatureCard>
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.905 11A9 9 0 005.024 21M16.095 11A9 9 0 0118.976 21M12 21V11" /></svg>}
              title="Global Community"
            >
              Become part of a diverse community of language learners from all over the world.
            </FeatureCard>
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              title="Flexible & Fun"
            >
              Learn at your own pace in a fun, supportive, and engaging environment.
            </FeatureCard>
          </div>
        </div>
      </div>
      
      {/* "Nasıl Çalışır?" Bölümü */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-20">
              <StepCard number="1" title="Create Your Profile">
                  Tell us who you are, what languages you speak, and what you want to learn.
              </StepCard>
              <StepCard number="2" title="Find a Partner">
                  Browse our community to find the perfect partner based on language, level, and interests.
              </StepCard>
              <StepCard number="3" title="Start Talking!">
                  Connect via our real-time chat and start practicing. It's that simple!
              </StepCard>
          </div>
        </div>
      </div>

       {/* Footer (Alt Bilgi) */}
      <footer className="bg-gray-800 text-white p-6 text-center">
        <p>&copy; 2025 Talk&Learn. All rights reserved.</p>
      </footer>
    </div>
  );
}