const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Kıta ve ülke eşleştirmesi için basit bir veri yapısı
const continentCountryMap = {
    'EU': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Russia'],
    'AS': ['Turkey', 'Japan', 'South Korea', 'China', 'Russia'],
    'NA': ['United States'],
    'SA': ['Brazil'],
    // Diğer kıtalar eklenebilir
};


router.get('/', authMiddleware, async (req, res) => {
    try {
        const { country, language, continent } = req.query;
        
        let filter = {
            isProfilePublic: true,
            _id: { $ne: req.user.id }
        };

        if (continent && continentCountryMap[continent]) {
            filter.country = { $in: continentCountryMap[continent].map(c => new RegExp(c, 'i')) };
        }

        if (country) {
            filter.country = { $regex: new RegExp(country.split(' ')[1], 'i') };
        }

        if (language) {
            filter.$or = [
                { spokenLanguages: language },
                { 'learningLanguages.language': language }
            ];
        }
        
        const users = await User.find(filter).select('-password -friends -email');
        
        res.json(users);

    } catch (error) {
        console.error('Kullanıcı eşleştirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;