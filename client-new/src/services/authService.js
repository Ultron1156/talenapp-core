const API_URL = "http://https://talenapp-core.onrender.com/api/auth";

const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    return response.json();
};

const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response.json();
};

const resetPassword = async (token, password) => {
    const response = await fetch(`${API_URL}/resetpassword/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    return response.json();
};

// Eksik olan o hayati fonksiyonları da geri ekledik:
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,
    getCurrentUser
};

export default authService;