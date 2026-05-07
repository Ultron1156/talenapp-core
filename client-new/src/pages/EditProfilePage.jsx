import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import EditProfileForm from '../components/EditProfileForm';
import ProfilePicCropper from '../components/ProfilePicCropper';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/solid';

const ProfilePictureUploader = ({ currentUser, onProfileUpdate }) => {
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // İNSTAGRAM TARZI VARSAYILAN GRİ SİLÜET
    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

    const handleSaveCroppedImage = async (blob) => {
        try {
            const file = new File([blob], "profile.png", { type: "image/png" });
            const updatedUser = await userService.uploadProfilePicture(file);
            onProfileUpdate(updatedUser);
            setIsCropperOpen(false);
        } catch (err) {
            console.error(err);
            alert("An error occurred while uploading the photo.");
        }
    };

    // YENİ: FOTOĞRAFI SİLME FONKSİYONU
    const handleRemoveImage = async () => {
        if(window.confirm("Are you sure you want to remove your profile picture?")) {
            try {
                const updatedUser = await userService.removeProfilePicture();
                onProfileUpdate(updatedUser);
            } catch (error) {
                console.error(error);
                alert("Could not remove profile picture.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                {/* PROFİL FOTOĞRAFI VEYA SİLÜET */}
                <img
                    src={currentUser.profilePic ? `${import.meta.env.VITE_API_URL}${currentUser.profilePic}` : defaultAvatar}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                
                {/* FOTOĞRAF DEĞİŞTİR / EKLE BUTONU (Sağ Alt) */}
                <button
                    onClick={() => setIsCropperOpen(true)}
                    title="Change Photo"
                    className="absolute bottom-0 right-0 bg-monster-turquoise hover:bg-teal-500 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                >
                    <CameraIcon className="h-5 w-5" />
                </button>

                {/* YENİ: FOTOĞRAFI SİL BUTONU (Sol Alt - Sadece fotoğraf varsa çıkar) */}
                {currentUser.profilePic && (
                    <button
                        onClick={handleRemoveImage}
                        title="Remove Photo"
                        className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {isCropperOpen && (
                <ProfilePicCropper
                    onClose={() => setIsCropperOpen(false)}
                    onSave={handleSaveCroppedImage}
                />
            )}
        </div>
    );
};

const EditProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getMyProfile();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) return <div className="text-center p-10 font-bold text-monster-purple animate-pulse dark:text-white">Loading Profile Settings...</div>;
  if (error) return <div className="text-center p-10 text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700">
          
          <h1 className="text-3xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-monster-purple to-blue-500">
             Edit Profile
          </h1>
          
          {user && <ProfilePictureUploader currentUser={user} onProfileUpdate={handleProfileUpdate} />}
          
          <div className="border-t border-gray-100 dark:border-gray-700/50 pt-8 mt-2">
             {user && <EditProfileForm currentUser={user} onProfileUpdate={handleProfileUpdate} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;