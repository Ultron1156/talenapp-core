const express = require('express');
const router = express.Router();
const WouldYouRather = require('../models/WouldYouRather');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/random', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        // 🔥 GÜNLÜK LİMİT KONTROLÜ (5 OYUN/GÜN) 🔥
        const today = new Date().toDateString();
        const lastGame = new Date(user.lastGameDate).toDateString();

        // Eğer yeni bir güne girildiyse, sayacı sıfırla
        if (today !== lastGame) {
            user.dailyGameCount = 0;
            user.lastGameDate = new Date();
        }

        // Eğer günlük limiti doldurduysa, hata fırlat
        if (user.dailyGameCount >= 5) {
            return res.status(403).json({ 
                message: "Daily limit reached! You can start 5 games per day. Come back tomorrow!",
                limitReached: true
            });
        }

        // Rastgele 1 Soru Seç
        const count = await WouldYouRather.countDocuments();
        if (count === 0) return res.status(404).json({ message: "No questions found in the database." });
        
        const random = Math.floor(Math.random() * count);
        const randomQuestion = await WouldYouRather.findOne().skip(random);

        // Kullanıcının oyun hakkını 1 düşür (sayacı artır) ve kaydet
        user.dailyGameCount += 1;
        user.lastGameDate = new Date();
        await user.save();

        res.json(randomQuestion);
    } catch (error) {
        console.error("Game fetch error:", error);
        res.status(500).json({ message: "Server error while fetching game." });
    }
});

module.exports = router;