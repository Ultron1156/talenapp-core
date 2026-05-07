const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    // YENİ EKLENEN ALAN
    correction: {
        correctedText: { type: String },
        correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        isApproved: { type: Boolean, default: false } // Gelecekte, gönderenin düzeltmeyi onaylaması için
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);