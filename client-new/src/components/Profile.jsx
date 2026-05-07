import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const Profile = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-400 font-bold mt-10">
        <p>Select a user to see their profile details.</p>
      </div>
    );
  }
  
  const getFlagEmoji = (countryCode) => { 
      return countryCode ? `🌍` : ''; 
  };

  const handleSendMessage = () => {
      // 🔥 Kullanıcıyı Chat sayfasına ışınlıyoruz 🔥
      navigate('/chat', { state: { selectedUserFromProfile: user } });
  };

  return (
    <div className="p-8 h-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto mt-6 transition-colors">
      <div className="flex flex-col items-center text-center">
        
        <div className="relative group">
            <img
            src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : `https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png`}
            alt={user.username}
            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-white dark:border-gray-700 shadow-lg transform transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-5 right-2 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
        </div>

        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user.username}</h3>
        <p className="text-sm font-extrabold text-monster-purple dark:text-purple-400 uppercase tracking-widest">{user.country} {getFlagEmoji(user.country)}</p>
        
        {/* 🔥 YENİ EKLENEN SOHBET BUTONU 🔥 */}
        <button 
            onClick={handleSendMessage}
            className="mt-6 flex items-center gap-2 bg-gradient-to-r from-monster-purple to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3.5 rounded-full font-extrabold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Send Message
        </button>

      </div>
      
      <hr className="my-8 border-gray-100 dark:border-gray-700/50" />
      
      <div className="space-y-6">
        <div>
          <h4 className="font-extrabold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wider">Speaks</h4>
          <div className="flex flex-wrap gap-2">
            {(user.spokenLanguages && user.spokenLanguages.length > 0)
              ? user.spokenLanguages.map(lang => <span key={lang} className="bg-purple-50 dark:bg-gray-700/50 text-monster-purple dark:text-gray-200 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-100 dark:border-gray-600 shadow-sm">{lang}</span>)
              : <span className="text-gray-400 text-sm font-medium italic">Not specified</span>
            }
          </div>
        </div>
        
        <div>
          <h4 className="font-extrabold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wider">Learning</h4>
          <div className="flex flex-wrap gap-2">
            {(user.learningLanguages && user.learningLanguages.length > 0)
              ? user.learningLanguages.map((lang, idx) => {
                  const langName = typeof lang === 'object' ? lang.language : lang;
                  const langLevel = typeof lang === 'object' ? lang.level : '';
                  
                  return (
                    <span key={idx} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30 shadow-sm">
                        {langName} <span className="opacity-70 ml-1">{langLevel}</span>
                    </span>
                  )
              })
              : <span className="text-gray-400 text-sm font-medium italic">Not specified</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;