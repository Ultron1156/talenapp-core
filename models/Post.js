const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 280 },
    imageUrl: { type: String, default: '' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    // YENİ: Beğenileri gizleme ayarı
    hideLikes: { type: Boolean, default: false }, 
    
    comments: [
        {
            author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            content: { type: String, required: true, maxlength: 280 },
            createdAt: { type: Date, default: Date.now },
            isEdited: { type: Boolean, default: false },
            // YENİ: Yorum beğenileri
            likes: [{ type: Schema.Types.ObjectId, ref: 'User' }] 
        }
    ],
    originalPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    repostCount: { type: Number, default: 0 },
    privacy: { type: String, enum: ['public', 'friends'], default: 'public' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);