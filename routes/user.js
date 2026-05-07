const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// 🔥 FIREBASE ADMIN BAŞLATMA (VAKKO GÜVENLİĞİ) 🔥
const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// 🔥 FIREBASE CUSTOM AUTH: Kullanıcıya Askeri Bilet (Token) Basar 🔥
router.get('/firebase-token', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const customToken = await admin.auth().createCustomToken(userId);
        res.json({ firebaseToken: customToken });
    } catch (error) {
        console.error("Firebase token error:", error);
        res.status(500).json({ error: 'Failed to generate Firebase token.' });
    }
});

// 🔥 HAYALET AVCISI: Kullanıcı siteye girdiğinde son aktifliğini günceller 🔥
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
        req.user.id, 
        { lastActive: new Date() }, 
        { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch user information.' }); }
});

router.get('/friends', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username profilePic country _id');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user.friends);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/suggestions', authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const excludedUsers = [
            req.user.id, 
            ...currentUser.friends,
            ...(currentUser.blockedUsers || []),
            ...(currentUser.sentRequests || []),
            ...(currentUser.friendRequests || [])
        ].map(id => new mongoose.Types.ObjectId(id)); 
        
        const suggestions = await User.aggregate([
            { $match: { _id: { $nin: excludedUsers } } },
            { $sample: { size: 5 } },
            { $project: { password: 0, email: 0, friends: 0 } }
        ]);
        res.json(suggestions);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/upload-pfp', authMiddleware, upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please select a file.' });
        const filePath = `/uploads/${req.file.filename}`;
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { profilePic: filePath }, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.put('/remove-pfp', authMiddleware, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { profilePic: '' }, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.put('/update', authMiddleware, async (req, res) => {
  const allowedUpdates = ['username', 'profilePic', 'country', 'spokenLanguages', 'learningLanguages', 'gender', 'isProfilePublic', 'onlyFriendsCanMessage'];
  const updates = {};
  Object.keys(req.body).forEach(key => { if (allowedUpdates.includes(key)) updates[key] = req.body[key]; });
  
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'An error occurred during update.' }); }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { username, country, language } = req.query;
    const currentUser = await User.findById(req.user.id);
    const excludedUsers = [
        req.user.id, 
        ...(currentUser.blockedUsers || [])
    ].map(id => new mongoose.Types.ObjectId(id));

    let query = { _id: { $nin: excludedUsers } };
    const andConditions = [];

    if (username) andConditions.push({ username: { $regex: new RegExp(username, 'i') } });
    
    if (country) {
        const cleanStr = decodeURIComponent(country).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|\uFE0F/g, '');
        const countriesArray = cleanStr.split(',').filter(c => c.trim() !== '').map(c => new RegExp(c.trim(), 'i'));
        andConditions.push({ country: { $in: countriesArray } });
    }
    
    if (language) {
        const cleanLangStr = decodeURIComponent(language).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|\uFE0F/g, '');
        const langArray = cleanLangStr.split(',').filter(l => l.trim() !== '').map(l => new RegExp(l.trim(), 'i'));
        andConditions.push({
            $or: [
                { spokenLanguages: { $in: langArray } },
                { 'learningLanguages.language': { $in: langArray } }
            ]
        });
    }

    if (andConditions.length > 0) query.$and = andConditions;

    const users = await User.aggregate([
        { $match: query },
        { $sample: { size: 40 } }, 
        { $project: { password: 0, email: 0, notifications: 0 } }
    ]);
    res.json(users);
  } catch (err) { 
      res.status(500).json({ error: 'An error occurred while searching.' }); 
  }
});

// 🔥 BİLDİRİM ALGORİTMASI GÜNCELLENDİ (LİMİT 200 VE KESİN SIRALAMA) 🔥
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 }) // En yeni en üstte olacak şekilde sıralar
            .limit(200) // Eski 30 limiti 200'e çıkarıldı (Sonsuz hafıza hissi verir, sunucuyu yormaz)
            .populate('sender', 'username profilePic');
        res.json(notifications);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.put('/notifications/read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false }, 
            { $set: { isRead: true } }
        );
        res.json({ message: 'Notifications marked as read.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/:userId/request-friend', authMiddleware, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const currentUserId = req.user.id;
        if (targetId === currentUserId) return res.status(400).json({ message: "You cannot add yourself." });
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });
        if (currentUser.friends.includes(targetId)) return res.status(400).json({ message: "You are already friends." });
        if (targetUser.friendRequests.includes(currentUserId)) return res.status(400).json({ message: "Request already sent." });
        if (currentUser.blockedUsers.includes(targetId)) return res.status(400).json({ message: "Unblock user first to send a request." });
        targetUser.friendRequests.push(currentUserId);
        currentUser.sentRequests.push(targetId);
        await targetUser.save();
        await currentUser.save();
        res.json({ message: "Friend request sent!" });
    } catch (error) { res.status(500).json({ message: "Server error." }); }
});

router.post('/:userId/accept-friend', authMiddleware, async (req, res) => {
    try {
        const requesterId = req.params.userId;
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);
        const requesterUser = await User.findById(requesterId);
        if (!currentUser.friendRequests.includes(requesterId)) return res.status(400).json({ message: "No request found." });
        currentUser.friendRequests.pull(requesterId);
        requesterUser.sentRequests.pull(currentUserId);
        currentUser.friends.push(requesterId);
        requesterUser.friends.push(currentUserId);
        await currentUser.save();
        await requesterUser.save();
        res.json({ message: "Friend request accepted!" });
    } catch (error) { res.status(500).json({ message: "Server error." }); }
});

router.post('/:userId/reject-friend', authMiddleware, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetId);
        currentUser.friendRequests.pull(targetId);
        currentUser.sentRequests.pull(targetId);
        if (targetUser) {
            targetUser.sentRequests.pull(currentUserId);
            targetUser.friendRequests.pull(currentUserId);
            await targetUser.save();
        }
        await currentUser.save();
        res.json({ message: "Request rejected/cancelled." });
    } catch (error) { res.status(500).json({ message: "Server error." }); }
});

router.post('/:userId/remove-friend', authMiddleware, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetId);
        currentUser.friends.pull(targetId);
        if (targetUser) {
            targetUser.friends.pull(currentUserId);
            await targetUser.save();
        }
        await currentUser.save();
        res.json({ message: "Removed from friends." });
    } catch (error) { res.status(500).json({ message: "Server error." }); }
});

router.post('/:userId/block', authMiddleware, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const currentUserId = req.user.id;
        if (targetId === currentUserId) return res.status(400).json({ message: "You cannot block yourself." });
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });
        const isBlocked = currentUser.blockedUsers && currentUser.blockedUsers.includes(targetId);
        if (isBlocked) {
            currentUser.blockedUsers.pull(targetId);
            await currentUser.save();
            return res.json({ message: "User unblocked successfully.", blockedUsers: currentUser.blockedUsers });
        } else {
            if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
            currentUser.blockedUsers.push(targetId);
            currentUser.friends.pull(targetId);
            currentUser.friendRequests.pull(targetId);
            currentUser.sentRequests.pull(targetId);
            if (targetUser) {
                targetUser.friends.pull(currentUserId);
                targetUser.friendRequests.pull(currentUserId);
                targetUser.sentRequests.pull(currentUserId);
                await targetUser.save();
            }
            await currentUser.save();
            return res.json({ message: "User blocked successfully.", blockedUsers: currentUser.blockedUsers });
        }
    } catch (error) { res.status(500).json({ message: "Server error." }); }
});

router.put('/update-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Please fill in all fields.' });
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;