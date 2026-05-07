const API_URL = '${import.meta.env.VITE_API_URL}/api/messages';

const getToken = () => localStorage.getItem('token');

const getMessageHistory = async (otherUserId) => {
    const response = await fetch(`${API_URL}/history/${otherUserId}`, {
        headers: { 'Authorization': getToken() }
    });
    if (!response.ok) throw new Error('Sohbet geçmişi yüklenemedi.');
    return response.json();
};

const editMessage = async (messageId, content) => {
    const response = await fetch(`${API_URL}/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': getToken() },
        body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Mesaj düzenlenemedi.');
    return response.json();
};

// YENİ FONKSİYON
const correctMessage = async (messageId, correctedText) => {
    const response = await fetch(`${API_URL}/${messageId}/correct`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': getToken() },
        body: JSON.stringify({ correctedText })
    });
    if (!response.ok) throw new Error('Mesaj düzeltilemedi.');
    return response.json();
};

const messageService = {
    getMessageHistory,
    editMessage,
    correctMessage // Yeni fonksiyonu export'a ekliyoruz
};

export default messageService;