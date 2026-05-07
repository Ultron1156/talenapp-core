const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Bildirimi alan kişi
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Bildirimi gönderen (beğenen/yorum yapan) kişi
    type: { 
        type: String, 
        enum: ['like', 'comment', 'repost'], 
        required: true 
    }, // Bildirim türü
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post' 
    }, // İlgili gönderi
    isRead: { 
        type: Boolean, 
        default: false 
    } // Okundu mu?
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);