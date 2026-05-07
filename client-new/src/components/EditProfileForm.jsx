import React, { useState } from 'react';
import userService from '../services/userService';
import Select from 'react-select';
import { countryOptions, languageOptions } from '../data/options';

const EditProfileForm = ({ currentUser, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: currentUser.username || '',
  });
  
  const [country, setCountry] = useState(countryOptions.find(c => c.label.includes(currentUser.country)));
  const [spokenLanguages, setSpokenLanguages] = useState(
    (currentUser.spokenLanguages || []).map(lang => languageOptions.find(l => l.value === lang))
  );
  const [learningLanguages, setLearningLanguages] = useState(
    (currentUser.learningLanguages || []).map(item => ({
      ...item,
      language: languageOptions.find(l => l.value === item.language)
    }))
  );
  
  // Sadece Arkadaşlar Mesaj Atsın ayarı kaldı, Profil Gizliliği UI'dan silindi
  const [onlyFriendsCanMessage, setOnlyFriendsCanMessage] = useState(currentUser.onlyFriendsCanMessage === true);
  
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const updateData = {
      username: formData.username,
      country: country ? country.label.split(' ')[1] : '',
      spokenLanguages: spokenLanguages.map(lang => lang.value),
      learningLanguages: learningLanguages
        .filter(item => item.language)
        .map(item => ({
          language: item.language.value,
          level: item.level
        })),
      // Arka planda herkesi zorunlu olarak "Public" (Herkese Açık) yapıyoruz
      isProfilePublic: true, 
      onlyFriendsCanMessage: onlyFriendsCanMessage,
    };
    try {
      const updatedUser = await userService.updateUserProfile(updateData);
      setMessage('Profile updated successfully!');
      onProfileUpdate(updatedUser);
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  const customStyles = { 
    control: (provided, state) => ({ 
        ...provided, 
        borderRadius: '0.75rem',
        padding: '2px',
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        borderColor: state.isFocused ? '#8b5cf6' : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'),
        boxShadow: state.isFocused ? '0 0 0 1px #8b5cf6' : 'none',
        '&:hover': { borderColor: '#8b5cf6' }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        zIndex: 50
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused 
            ? (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6') 
            : 'transparent',
        color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
        cursor: 'pointer',
        '&:active': { backgroundColor: '#8b5cf6', color: 'white' }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        borderRadius: '0.5rem'
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#374151'
    }),
    input: (provided) => ({
        ...provided,
        color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
    })
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div>
        <label htmlFor="username" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">Username</label>
        <input 
            type="text" 
            name="username" 
            id="username" 
            value={formData.username} 
            onChange={handleChange} 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-monster-purple transition-all shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="country" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">Country</label>
        <Select
          inputId="country" 
          styles={customStyles}
          options={countryOptions}
          value={country}
          onChange={setCountry}
          isClearable
          placeholder="Select a country..."
          className="text-sm shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="spokenLanguages" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">Spoken Languages</label>
        <Select
          inputId="spokenLanguages" 
          isMulti
          styles={customStyles}
          options={languageOptions}
          value={spokenLanguages}
          onChange={setSpokenLanguages}
          placeholder="Select languages..."
          className="text-sm shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">Learning Languages</label>
        {learningLanguages.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 mt-3">
            <div className="w-1/2">
              <Select
                styles={customStyles}
                options={languageOptions}
                value={item.language}
                onChange={(selectedOption) => {
                    const newLangs = [...learningLanguages];
                    newLangs[index].language = selectedOption;
                    setLearningLanguages(newLangs);
                }}
                placeholder="Select language..."
                className="text-sm shadow-sm"
              />
            </div>
            
            <select
              value={item.level}
              onChange={(e) => {
                  const newLangs = [...learningLanguages];
                  newLangs[index].level = e.target.value;
                  setLearningLanguages(newLangs);
              }}
              className="w-1/3 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-monster-purple transition-colors cursor-pointer text-sm font-medium"
            >
              {languageLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            
            <button 
                type="button" 
                onClick={() => {
                    const newLangs = [...learningLanguages];
                    newLangs.splice(index, 1);
                    setLearningLanguages(newLangs);
                }} 
                className="p-3 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white dark:bg-gray-700 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white rounded-xl transition-all shadow-sm group"
                title="Remove Language"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        ))}
        
        <button 
            type="button" 
            onClick={() => setLearningLanguages([...learningLanguages, { language: null, level: 'A1' }])} 
            className="mt-4 px-5 py-2.5 bg-green-100 hover:bg-green-500 text-green-700 hover:text-white dark:bg-gray-800 dark:hover:bg-green-600 dark:text-green-400 dark:hover:text-white rounded-xl transition-all shadow-sm font-bold text-sm flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Add Language
        </button>
      </div>
      
      {/* SADECE "SADECE ARKADAŞLAR MESAJ ATSIN" AYARI KALDI */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700/50 space-y-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Privacy Settings</h3>
        
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-extrabold text-gray-800 dark:text-gray-200">Friends-Only Messaging</p>
            <p className="text-xs font-medium text-gray-500 mt-1">If enabled, strangers cannot send you messages.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setOnlyFriendsCanMessage(!onlyFriendsCanMessage)} 
            className={`${onlyFriendsCanMessage ? 'bg-monster-turquoise' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-monster-turquoise dark:focus:ring-offset-gray-900 shadow-inner`}
          >
            <span className={`${onlyFriendsCanMessage ? 'translate-x-8' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}/>
          </button>
        </div>
      </div>
      
      <button 
        type="submit" 
        className="w-full mt-8 bg-gradient-to-r from-monster-purple to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-black text-lg py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
      >
        Save Changes
      </button>
      
      {message && (
        <div className={`text-center mt-6 p-4 rounded-xl font-bold text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
            {message}
        </div>
      )}
    </form>
  );
};

export default EditProfileForm;