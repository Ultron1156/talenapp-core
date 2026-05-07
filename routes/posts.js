const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// CREATE POST
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, imageUrl, privacy } = req.body;
        if (!content && !imageUrl) { return res.status(400).json({ message: 'Post content cannot be empty.' }); }
        const newPost = new Post({ content, imageUrl: imageUrl || '', author: req.user.id, privacy: privacy || 'public' });
        await newPost.save();
        const populatedPost = await newPost.populate('author', 'username profilePic country');
        res.status(201).json(populatedPost);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});
      
// GET ALL POSTS
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { sortBy } = req.query;
        const currentUser = await User.findById(req.user.id);
        const friendsList = currentUser.friends;

        const privacyFilter = {
            $or: [
                { privacy: 'public' },
                { privacy: { $exists: false } },
                { privacy: 'friends', author: { $in: [...friendsList, req.user.id] } }
            ]
        };

        const populateOptions = [
            { path: 'author', select: 'username profilePic country' },
            { path: 'originalPost', populate: { path: 'author', select: 'username profilePic country' } },
            { path: 'comments.author', select: 'username profilePic' },
            { path: 'likes', select: 'username profilePic country' }
        ];

        let posts;
        if (sortBy === 'popular') {
            posts = await Post.aggregate([
                { $match: privacyFilter },
                { $addFields: { popularityScore: { $add: [{ $size: "$likes" }, { $size: "$comments" }] } } },
                { $sort: { popularityScore: -1, createdAt: -1 } }
            ]);
            await Post.populate(posts, populateOptions);
        } else {
            posts = await Post.find(privacyFilter).sort({ createdAt: -1 }).populate(populateOptions);
        }
        res.json(posts);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// YENİ: POST DÜZENLEME (Beğenileri Gizle Ayarı İçin)
router.put('/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        if (post.author.toString() !== req.user.id) { return res.status(401).json({ message: 'Unauthorized.' }); }
        
        if (req.body.content !== undefined) post.content = req.body.content;
        if (req.body.hideLikes !== undefined) post.hideLikes = req.body.hideLikes;
        
        await post.save();
        const populatedPost = await post.populate([
            { path: 'author', select: 'username profilePic country' },
            { path: 'originalPost', populate: { path: 'author', select: 'username profilePic country' } },
            { path: 'comments.author', select: 'username profilePic' },
            { path: 'likes', select: 'username profilePic country' }
        ]);
        res.json(populatedPost);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// ADD COMMENT
router.post('/:postId/comment', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) { return res.status(400).json({ message: 'Comment content cannot be empty.' }); }
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        
        const newComment = { content, author: req.user.id, likes: [] };
        post.comments.unshift(newComment);
        await post.save();

        if (post.author.toString() !== req.user.id) {
            await new Notification({ recipient: post.author, sender: req.user.id, type: 'comment', post: post._id }).save();
        }

        const populatedPost = await post.populate('comments.author', 'username profilePic');
        res.status(201).json(populatedPost.comments[0]);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// EDIT COMMENT
router.put('/:postId/comment/:commentId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        const comment = post.comments.id(req.params.commentId);
        if (!comment) { return res.status(404).json({ message: 'Comment not found.' }); }
        if (comment.author.toString() !== req.user.id) { return res.status(401).json({ message: 'Unauthorized.' }); }
        
        comment.content = content;
        comment.isEdited = true;
        await post.save();
        
        const populatedPost = await post.populate('comments.author', 'username profilePic');
        res.json(populatedPost.comments.id(req.params.commentId));
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// YENİ: COMMENT LIKE
router.post('/:postId/comment/:commentId/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        const comment = post.comments.id(req.params.commentId);
        if (!comment) { return res.status(404).json({ message: 'Comment not found.' }); }
        
        const userId = req.user.id;
        const likeIndex = comment.likes.indexOf(userId);
        
        if (likeIndex === -1) {
            comment.likes.push(userId); // Beğen
        } else {
            comment.likes.splice(likeIndex, 1); // Geri al
        }
        await post.save();
        
        const populatedPost = await post.populate('comments.author', 'username profilePic');
        res.json(populatedPost.comments.id(req.params.commentId));
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE COMMENT
router.delete('/:postId/comment/:commentId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        
        const comment = post.comments.id(req.params.commentId);
        if (!comment) { return res.status(404).json({ message: 'Comment not found.' }); }
        
        if (comment.author.toString() !== req.user.id) { return res.status(401).json({ message: 'Unauthorized.' }); }
        
        post.comments.pull(req.params.commentId);
        await post.save();
        res.json({ message: 'Comment deleted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

// REPOST
router.post('/:postId/repost', authMiddleware, async (req, res) => {
    try {
        const originalPost = await Post.findById(req.params.postId);
        if (!originalPost) { return res.status(404).json({ message: 'Original post not found.' }); }
        
        const repost = new Post({ content: req.body.content || '', author: req.user.id, originalPost: originalPost._id, privacy: originalPost.privacy });
        await repost.save();
        
        originalPost.repostCount += 1;
        await originalPost.save();

        if (originalPost.author.toString() !== req.user.id) {
            await new Notification({ recipient: originalPost.author, sender: req.user.id, type: 'repost', post: originalPost._id }).save();
        }

        const populatedRepost = await repost.populate([
            { path: 'author', select: 'username profilePic country' },
            { path: 'originalPost', populate: { path: 'author', select: 'username profilePic country' } }
        ]);
        res.status(201).json(populatedRepost);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// TOGGLE LIKE POST
router.post('/:postId/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        
        const userId = req.user.id;
        const postIndex = post.likes.indexOf(userId);
        
        let isLiked = false;
        if (postIndex === -1) {
            post.likes.push(userId); 
            isLiked = true;
        } else {
            post.likes.splice(postIndex, 1); 
        }
        await post.save();

        if (isLiked && post.author.toString() !== userId) {
            await new Notification({ recipient: post.author, sender: userId, type: 'like', post: post._id }).save();
        } else if (!isLiked) {
            await Notification.findOneAndDelete({ recipient: post.author, sender: userId, type: 'like', post: post._id });
        }
        
        const populatedPost = await post.populate([
            { path: 'author', select: 'username profilePic country' },
            { path: 'originalPost', populate: { path: 'author', select: 'username profilePic country' } },
            { path: 'comments.author', select: 'username profilePic' },
            { path: 'likes', select: 'username profilePic country' }
        ]);
        res.status(200).json(populatedPost);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE POST
router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) { return res.status(404).json({ message: 'Post not found.' }); }
        if (post.author.toString() !== req.user.id) { return res.status(401).json({ message: 'Unauthorized.' }); }
        
        if (post.originalPost) { await Post.findByIdAndUpdate(post.originalPost, { $inc: { repostCount: -1 } }); }
        await Notification.deleteMany({ post: post._id });
        
        await post.deleteOne();
        res.json({ message: 'Post successfully deleted.' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;