const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // authMiddleware'i dahil et
const router = express.Router();

// Korumalı bir rota (örneğin: sadece giriş yapmış kullanıcılar ulaşabilir)
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Bu rota yalnızca giriş yapmış kullanıcılar için!' });
});

module.exports = router;
