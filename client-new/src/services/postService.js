// Eski .env değişkenini tamamen sildik, sadece bu kalacak:
const API_URL = "http://localhost:8081/api/posts";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': token } : {};
};

const createPost = async (postData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(postData)
    });
    if (!response.ok) throw new Error('Failed to create post.');
    return response.json();
};

const getAllPosts = async (sortBy = 'foryou') => {
    const response = await fetch(`${API_URL}?sortBy=${sortBy}`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch posts.');
    return response.json();
};

const likePost = async (postId) => {
    const response = await fetch(`${API_URL}/${postId}/like`, { method: 'POST', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to like post.');
    return response.json();
};

const repostPost = async (postId, data) => {
    const response = await fetch(`${API_URL}/${postId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to repost.');
    return response.json();
};

const deletePost = async (postId) => {
    const response = await fetch(`${API_URL}/${postId}`, { method: 'DELETE', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to delete post.');
    return response.json();
};

// YENİ: POST DÜZENLEME (Beğenileri Gizleme)
const editPost = async (postId, updates) => {
    const response = await fetch(`${API_URL}/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to edit post.');
    return response.json();
};

const addComment = async (postId, content) => {
    const response = await fetch(`${API_URL}/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to add comment.');
    return response.json();
};

const editComment = async (postId, commentId, content) => {
    const response = await fetch(`${API_URL}/${postId}/comment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to edit comment.');
    return response.json();
};

const deleteComment = async (postId, commentId) => {
    const response = await fetch(`${API_URL}/${postId}/comment/${commentId}`, { method: 'DELETE', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to delete comment.');
    return response.json();
};

// YENİ: YORUM BEĞENME
const likeComment = async (postId, commentId) => {
    const response = await fetch(`${API_URL}/${postId}/comment/${commentId}/like`, { method: 'POST', headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to like comment.');
    return response.json();
};

const postService = {
    createPost, getAllPosts, likePost, repostPost, deletePost, editPost,
    addComment, editComment, deleteComment, likeComment
};

export default postService;