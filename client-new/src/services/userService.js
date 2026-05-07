import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

const API_URL = "https://talenapp-core.onrender.com/api/users";
const GAME_API_URL = "https://talenapp-core.onrender.com/api/games";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': token } : {};
};

const getMyProfile = async () => {
    const response = await fetch(`${API_URL}/me`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch profile information.');
    return response.json();
};

const updateUserProfile = async (updates) => {
    const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update profile.');
    return response.json();
};

const getUserProfile = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch user profile.');
    return response.json();
};

const sendFriendRequest = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}/request-friend`, { method: 'POST', headers: getAuthHeader() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send request.');
    return data;
};

const acceptFriendRequest = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}/accept-friend`, { method: 'POST', headers: getAuthHeader() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to accept request.');
    return data;
};

const rejectFriendRequest = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}/reject-friend`, { method: 'POST', headers: getAuthHeader() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reject request.');
    return data;
};

const removeFriend = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}/remove-friend`, { method: 'POST', headers: getAuthHeader() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to remove friend.');
    return data;
};

const toggleBlock = async (userId) => {
    const response = await fetch(`${API_URL}/${userId}/block`, { method: 'POST', headers: getAuthHeader() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Operation failed.');
    return data;
};

const updatePassword = async (passwordData) => {
    const response = await fetch(`${API_URL}/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(passwordData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update password.');
    return data;
};

const getUserSuggestions = async () => {
    const response = await fetch(`${API_URL}/suggestions`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch user suggestions.');
    return response.json();
};

const findUsers = async (filters) => {
    const params = new URLSearchParams();
    
    if (filters) {
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
    }
    
    const response = await fetch(`${API_URL}/search?${params.toString()}`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('An error occurred while searching.');
    return response.json();
};

const getFriendsList = async () => {
    const response = await fetch(`${API_URL}/friends`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch friends list.');
    return response.json();
};

const getNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch notifications.');
    return response.json();
};

const markNotificationsAsRead = async () => {
    const response = await fetch(`${API_URL}/notifications/read`, { method: 'PUT', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to mark notifications as read.');
    return response.json();
};

const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await fetch(`${API_URL}/upload-pfp`, { method: 'POST', headers: getAuthHeader(), body: formData });
    if (!response.ok) throw new Error('Failed to upload profile picture.');
    return response.json();
};

const removeProfilePicture = async () => {
    const response = await fetch(`${API_URL}/remove-pfp`, { method: 'PUT', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to remove profile picture.');
    return response.json();
};

const getRandomGame = async () => {
    const response = await fetch(`${GAME_API_URL}/wouldyourather/random`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch game question.');
    }
    return response.json();
};

// 🔥 FIREBASE CUSTOM AUTH: VIP Bileti Alıp Firebase'e Okutur 🔥
const authenticateWithFirebase = async () => {
    try {
        const response = await fetch(`${API_URL}/firebase-token`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Failed to fetch Firebase token.');
        const data = await response.json();

        if (data.firebaseToken) {
            await signInWithCustomToken(auth, data.firebaseToken);
            console.log("🔥 Firebase Auth Success: Gates are open!");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Firebase Authentication Error:", error);
        throw error;
    }
};

const userService = {
    getMyProfile, updateUserProfile, getUserProfile, 
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, toggleBlock, 
    updatePassword, getUserSuggestions, findUsers, getFriendsList, getNotifications, 
    markNotificationsAsRead, uploadProfilePicture, removeProfilePicture, getRandomGame,
    authenticateWithFirebase // Yeni fonksiyon dışarı aktarıldı
};

export default userService;