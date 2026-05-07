const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Modeller
const Message = require('./models/Message');
const User = require('./models/User');
// Rotalar
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const postRoutes = require('./routes/posts');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- GÜNCELLENEN VIP GÜVENLİK LİSTESİ (CORS) ---
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8081',
    'https://talenapp.com',
    'https://www.talenapp.com',
    'https://talenapp-core.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// -----------------------------------------------

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlandı.'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/games', gameRoutes);

const { isSameDay, isYesterday } = require('./utils/helpers');

const clients = new Map();
wss.on('connection', ws => {
  let userId = null;
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'init':
          userId = data.userID;
          clients.set(userId, ws);
          console.log(`${userId} bağlandı.`);
          break;

        case 'message':
          const { targetUserID, message: messageText } = data;
          const senderId = userId;
          const receiverId = targetUserID;

          if (!senderId || !receiverId || !messageText) return;

          try {
              const user = await User.findById(senderId);
              if (user) {
                  const today = new Date();
                  if (!user.lastActivity || !isSameDay(user.lastActivity, today)) {
                      if (user.lastActivity && isYesterday(user.lastActivity, today)) {
                          user.streak += 1;
                      } else {
                          user.streak = 1;
                      }
                      user.lastActivity = today;
                      await user.save();
                      console.log(`${user.username} için seri güncellendi: ${user.streak}`);
                  }
              }
          } catch (streakError) {
              console.error("Streak güncellenirken hata oluştu:", streakError);
          }

          const conversationId = [senderId, receiverId].sort().join('_');
          const newMessage = new Message({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            message: messageText
          });
          await newMessage.save();
          const receiverSocket = clients.get(receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(JSON.stringify({
              type: 'message',
              sender: senderId,
              message: messageText,
              createdAt: newMessage.createdAt
            }));
          }
          break;
      }
    } catch (e) {
      console.error("Mesaj işlenirken hata oluştu:", e);
    }
  });
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`${userId} bağlantısı kesildi.`);
    }
  });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));