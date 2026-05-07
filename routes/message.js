const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// İki kullanıcı arasındaki sohbet geçmişini getirir
router.get('/history/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const conversationId = [currentUserId, otherUserId].sort().join('_');

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 'asc' })
            .populate('sender', 'username profilePic')
            .populate('receiver', 'username profilePic');

        res.json(messages);

    } catch (error) {
        console.error('Mesaj geçmişi alınırken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// BİR MESAJI DÜZENLEME
router.put('/:messageId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı.' });
        }

        if (message.sender.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Yetkisiz işlem.' });
        }

        message.message = content;
        message.isEdited = true;
        await message.save();
        
        res.json(message);

    } catch (error) {
        console.error('Mesaj düzenleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// BİR MESAJA DÜZELTME EKLEME (YENİ EKLENDİ)
// PUT /api/messages/:messageId/correct
router.put('/:messageId/correct', authMiddleware, async (req, res) => {
    try {
        const { correctedText } = req.body;
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı.' });
        }

        // Kullanıcı kendi mesajını düzeltemez
        if (message.sender.toString() === req.user.id) {
            return res.status(400).json({ message: 'Kendi mesajınıza düzeltme öneremezsiniz.' });
        }

        message.correction = {
            correctedText: correctedText,
            correctedBy: req.user.id
        };

        await message.save();
        
        // Düzeltilen mesajı, gönderen ve düzelten bilgileriyle birlikte geri döndür
        const populatedMessage = await message.populate([
            { path: 'sender', select: 'username' },
            { path: 'correction.correctedBy', select: 'username' }
        ]);

        res.json(populatedMessage);

    } catch (error) {
        console.error('Mesaj düzeltme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;