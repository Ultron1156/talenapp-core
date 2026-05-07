import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { countryOptions } from '../data/options';
// 🔥 İKONLARI VE YÖNLENDİRİCİYİ İÇERİ ALIYORUZ 🔥
import { ArrowLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

// İNSTAGRAM TARZI VARSAYILAN GRİ SİLÜET
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const UserProfilePage = () => {
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { userId } = useParams();
    
    // 🔥 SAYFALAR ARASI GEÇİŞ MOTORUMUZ 🔥
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const [profileData, currentUserData] = await Promise.all([
                    userService.getUserProfile(userId),
                    userService.getMyProfile()
                ]);
                setUser(profileData);
                setCurrentUser(currentUserData);
            } catch (err) { setError(err.message); } 
            finally { setLoading(false); }
        };
        fetchUserData();
    }, [userId]);

    const handleSendRequest = async () => { try { const res = await userService.sendFriendRequest(userId); setCurrentUser(prev => ({ ...prev, sentRequests: [...(prev.sentRequests || []), userId] })); alert(res.message); } catch (err) { alert(err.message); } };
    const handleAcceptRequest = async () => { try { const res = await userService.acceptFriendRequest(userId); setCurrentUser(prev => ({ ...prev, friendRequests: prev.friendRequests.filter(id => id !== userId), friends: [...(prev.friends || []), userId] })); alert(res.message); } catch (err) { alert(err.message); } };
    const handleRejectOrCancel = async () => { try { const res = await userService.rejectFriendRequest(userId); setCurrentUser(prev => ({ ...prev, friendRequests: prev.friendRequests?.filter(id => id !== userId), sentRequests: prev.sentRequests?.filter(id => id !== userId) })); alert(res.message); } catch (err) { alert(err.message); } };
    const handleRemoveFriend = async () => { if(window.confirm("Are you sure you want to remove this user from your friends?")) { try { const res = await userService.removeFriend(userId); setCurrentUser(prev => ({ ...prev, friends: prev.friends?.filter(id => id !== userId) })); alert(res.message); } catch (err) { alert(err.message); } } };
    const handleToggleBlock = async () => { if (window.confirm("Are you sure you want to block/unblock this user?")) { try { const response = await userService.toggleBlock(userId); setCurrentUser(prevUser => ({ ...prevUser, blockedUsers: response.blockedUsers })); alert(response.message); } catch (err) { alert(err.message); } } };

    // 🔥 KULLANICIYI SOHBET ODASINA IŞINLAYAN FONKSİYON 🔥
    const handleSendMessage = () => {
        navigate('/chat', { state: { selectedUserFromProfile: user } });
    };

    if (loading) return <div className="text-center p-10 font-bold animate-pulse text-monster-purple">Loading profile...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!user) return <div className="text-center p-10 font-bold text-gray-500">User not found.</div>;

    const isMyOwnProfile = currentUser && user && String(currentUser._id) === String(user._id);
    const isFriend = currentUser?.friends?.includes(user._id);
    const isBlockedByMe = currentUser?.blockedUsers?.includes(user._id);
    const hasSentRequest = currentUser?.sentRequests?.includes(user._id);
    const hasReceivedRequest = currentUser?.friendRequests?.includes(user._id);
    const countryLabel = countryOptions.find(c => c.label.includes(user.country))?.label || user.country;

    return (
        <div className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto p-4 max-w-2xl relative">
                
                {/* 🔥 GERİ DÖN BUTONU 🔥 */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-monster-purple dark:hover:text-purple-400 transition-colors font-extrabold mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Results
                </button>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl relative border border-gray-100 dark:border-gray-700">
                    
                    {isMyOwnProfile && (
                        <Link to="/profile/edit" className="absolute top-6 right-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                            Edit Profile
                        </Link>
                    )}
                    
                    {!isMyOwnProfile && (
                        <button onClick={handleToggleBlock} className="absolute top-6 left-6 text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full transition-colors">
                            {isBlockedByMe ? 'Unblock User' : 'Block User'}
                        </button>
                    )}

                    <div className="text-center mt-6">
                        <img src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR} alt={user.username} className="w-36 h-36 rounded-full mx-auto mb-4 object-cover border-4 border-white dark:border-gray-700 shadow-xl" />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user.username}</h1>
                        <p className="text-monster-purple dark:text-purple-400 font-bold uppercase tracking-wider text-sm mt-1">{countryLabel}</p>
                        
                        {!isMyOwnProfile && !isBlockedByMe && (
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                
                                {/* 🔥 MESAJ AT BUTONU 🔥 */}
                                <button 
                                    onClick={handleSendMessage}
                                    className="px-6 py-2.5 rounded-full font-extrabold bg-gradient-to-r from-monster-purple to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg flex items-center gap-2 transform transition-transform hover:-translate-y-0.5"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" /> Send Message
                                </button>

                                {/* DİĞER ARKADAŞLIK BUTONLARI */}
                                {isFriend ? (
                                    <button onClick={handleRemoveFriend} className="px-6 py-2.5 rounded-full font-bold bg-red-500 hover:bg-red-600 text-white shadow-md">Remove Friend</button>
                                ) : hasReceivedRequest ? (
                                    <>
                                        <button onClick={handleAcceptRequest} className="px-6 py-2.5 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white shadow-md">Accept</button>
                                        <button onClick={handleRejectOrCancel} className="px-6 py-2.5 rounded-full font-bold bg-gray-200 hover:bg-gray-300 text-gray-800">Reject</button>
                                    </>
                                ) : hasSentRequest ? (
                                    <button onClick={handleRejectOrCancel} className="px-6 py-2.5 rounded-full font-bold bg-gray-200 hover:bg-gray-300 text-gray-600">Cancel Request</button>
                                ) : (
                                    <button onClick={handleSendRequest} className="px-6 py-2.5 rounded-full font-bold bg-monster-turquoise hover:bg-teal-500 text-white shadow-md transform transition-transform hover:-translate-y-0.5">Add Friend</button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {isBlockedByMe ? (
                        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center text-red-500 font-bold border border-red-100">You have blocked this user.</div>
                    ) : (
                        <div className="mt-10 border-t border-gray-100 dark:border-gray-700/50 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Spoken Languages</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(user.spokenLanguages || []).map(lang => (
                                            <span key={lang} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{lang}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Learning</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(user.learningLanguages || []).map(item => (
                                            <span key={item.language} className="bg-monster-purple/10 text-monster-purple dark:text-purple-300 border border-monster-purple/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                {item.language} <span className="opacity-70 ml-1">({item.level})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;