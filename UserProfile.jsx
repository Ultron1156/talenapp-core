import React, { useEffect, useState } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT token
        const res = await fetch('${import.meta.env.VITE_API_URL}/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Profil verisi alınırken hata:', err);
      }
    };

    fetchUserProfile();
  }, []);

  if (!user) {
    return <div className="text-center mt-10 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Country:</strong> {user.country || 'Not specified'}</p>
      <p><strong>Languages Spoken:</strong> {user.languages?.join(', ') || 'Not specified'}</p>
      <p><strong>Languages Learning:</strong> {user.learningLanguages?.join(', ') || 'Not specified'}</p>
    </div>
  );
};

export default UserProfile;
