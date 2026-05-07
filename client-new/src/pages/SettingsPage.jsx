import React, { useState, useEffect } from 'react';
import userService from '../services/userService';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      const response = await userService.updatePassword({ currentPassword, newPassword });
      setMessage(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Change Password</h2>
      {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</p>}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-monster-purple focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-monster-purple focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-monster-purple focus:outline-none"
          />
        </div>
        <button type="submit" className="w-full bg-monster-purple dark:bg-monster-dark-blue hover:bg-purple-700 dark:hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
          Save Password
        </button>
      </form>
    </div>
  );
};

const PrivacySettings = () => {
    const [isPublic, setIsPublic] = useState(true);
    const [onlyFriendsCanMessage, setOnlyFriendsCanMessage] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrivacySetting = async () => {
            try {
                const user = await userService.getMyProfile();
                setIsPublic(user.isProfilePublic !== false);
                setOnlyFriendsCanMessage(user.onlyFriendsCanMessage === true);
            } catch (error) {
                console.error("Failed to fetch privacy setting:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrivacySetting();
    }, []);

    const handlePublicToggle = async () => {
        const newIsPublic = !isPublic;
        setIsPublic(newIsPublic);
        try {
            await userService.updateUserProfile({ isProfilePublic: newIsPublic });
        } catch (error) {
            setIsPublic(!newIsPublic);
        }
    };

    const handleMessageToggle = async () => {
        const newValue = !onlyFriendsCanMessage;
        setOnlyFriendsCanMessage(newValue);
        try {
            await userService.updateUserProfile({ onlyFriendsCanMessage: newValue });
        } catch (error) {
            setOnlyFriendsCanMessage(!newValue);
        }
    };

    if (loading) {
        return <div className="dark:text-gray-300">Loading privacy settings...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Privacy Settings</h2>
            
            {/* Profil Görünürlüğü */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Make Profile Public</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">If disabled, other users cannot see your profile and posts.</p>
                </div>
                <button
                    type="button"
                    onClick={handlePublicToggle}
                    className={`${isPublic ? 'bg-monster-turquoise' : 'bg-gray-300'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none`}
                >
                    <span className={`${isPublic ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}/>
                </button>
            </div>

            {/* Sadece Arkadaşlar Mesaj Atabilir Ayarı */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Only Friends Can Message Me</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">If enabled, people who are not in your friend list cannot send you messages.</p>
                </div>
                <button
                    type="button"
                    onClick={handleMessageToggle}
                    className={`${onlyFriendsCanMessage ? 'bg-monster-purple' : 'bg-gray-300'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none`}
                >
                    <span className={`${onlyFriendsCanMessage ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}/>
                </button>
            </div>
        </div>
    );
};

const SettingsPage = () => {
  return (
    <div className="py-10">
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-white">Settings</h1>
        <div className="space-y-8">
          <PrivacySettings />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;