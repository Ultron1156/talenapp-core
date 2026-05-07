const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
        maxlength: 150
    },
    country: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: "Other"
    },
    spokenLanguages: {
        type: [String],
        default: []
    },
    learningLanguages: [{
        language: String,
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Native']
        }
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isProfilePublic: {
        type: Boolean,
        default: true
    },
    onlyFriendsCanMessage: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastActive: {
        type: Date,
        default: Date.now
    },
    // 🔥 YENİ: GÜNLÜK OYUN LİMİTİ KONTROLLERİ 🔥
    dailyGameCount: {
        type: Number,
        default: 0
    },
    lastGameDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);