const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Email OTP Template (English)
const getOtpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eaeaea; border-radius: 10px; text-align: center; background-color: #fcfcfc;">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to TALEN! 🚀</h2>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">You are just one step away from verifying your account. Please enter the 6-digit verification code below:</p>
      <div style="margin: 30px auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px; border: 2px dashed #ccc; display: inline-block;">
          <h1 style="font-size: 40px; color: #007bff; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="font-size: 14px; color: #777;">This code is valid for 10 minutes.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
      <p style="font-size: 12px; color: #aaa;">If you did not request this, please ignore this email.</p>
  </div>
`;

// Password Reset Template (English)
const getPasswordResetTemplate = (url) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; text-align: center; background-color: #fcfcfc;">
      <h2 style="color: #e74c3c; margin-bottom: 20px;">TALEN Password Reset 🔒</h2>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">You requested a password reset. Click the button below to set a new password:</p>
      <a href="${url}" style="display: inline-block; padding: 14px 28px; margin: 25px 0; background-color: #e74c3c; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 6px; font-weight: bold;">Reset My Password</a>
      <p style="font-size: 14px; color: #777;">If you did not request this, your account is safe and you can ignore this message.</p>
  </div>
`;

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

        const existingUser = await User.findOne({ email });
        
        if (existingUser && !existingUser.isVerified) {
            existingUser.emailVerificationToken = hashedOtp;
            existingUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
            const salt = await bcrypt.genSalt(10);
            existingUser.password = await bcrypt.hash(password, salt);
            existingUser.username = username;
            await existingUser.save();
            
            await sendEmail({ email: existingUser.email, subject: 'Your TALEN Verification Code', message: getOtpEmailTemplate(otpCode) });
            return res.status(200).json({ message: 'This email is already registered but not verified. A new verification code has been sent.' });
        }
        
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'This email address is already in use.' });
        }
        
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'This username is already taken.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        
        newUser.emailVerificationToken = hashedOtp;
        newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
        await newUser.save();
        
        await sendEmail({ email: newUser.email, subject: 'Your TALEN Verification Code', message: getOtpEmailTemplate(otpCode) });
        
        res.status(201).json({ message: 'Registration successful! Please enter the 6-digit verification code sent to your email.' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: 'Please provide both email and verification code.' });
        }

        const hashedCode = crypto.createHash('sha256').update(code.toString()).digest('hex');
        const user = await User.findOne({
            email: email,
            emailVerificationToken: hashedCode,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Your account has been successfully verified!' });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email address before logging in.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        
        res.json({ success: true, token: `Bearer ${token}` });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 🔥 NEW: GOOGLE LOGIN/REGISTER ROUTE 🔥
router.post('/google', async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email from Google is required.' });
        }

        let user = await User.findOne({ email });

        // If user doesn't exist, create an account automatically
        if (!user) {
            // Generate a secure random password since Mongoose schema requires it
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            
            // Generate a unique username if the Google name is taken
            let baseUsername = username ? username.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
            let finalUsername = baseUsername;
            let counter = 1;
            
            while (await User.findOne({ username: finalUsername })) {
                finalUsername = `${baseUsername}${counter}`;
                counter++;
            }

            user = new User({
                username: finalUsername,
                email: email,
                password: hashedPassword,
                isVerified: true // Google accounts are already verified
            });
            await user.save();
        } else {
            // If user exists but is not verified, verify them now since Google vouches for the email
            if (!user.isVerified) {
                user.isVerified = true;
                user.emailVerificationToken = undefined;
                user.emailVerificationExpires = undefined;
                await user.save();
            }
        }

        // Generate JWT Token
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ success: true, token: `Bearer ${token}` });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
    }
});

router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email address.' });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;
        await sendEmail({ email: user.email, subject: 'TALEN Password Reset', message: getPasswordResetTemplate(resetUrl) });
        
        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.put('/resetpassword/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Your password has been successfully updated.' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;