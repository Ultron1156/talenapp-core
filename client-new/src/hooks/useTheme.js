import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // Sayfa ilk yüklendiğinde kullanıcının eski seçimini veya sistem tercihini al
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Varsayılan olarak koyu mod ile başla
            return 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return [theme, toggleTheme];
};