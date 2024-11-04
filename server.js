


import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Message from './models/Message.js';
import UserProfile from './models/profile .js';
import User from './models/user.js';
import postRoutes from './routes/post.js';
import userRoutes from './routes/user.js';

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://192.168.0.103:8081'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    
    req.user = user; 
    next();
  });
};

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/userpost', postRoutes);

// Fetch users that the logged-in user is following
app.get('/api/users', authMiddleware, async (req, res) => {
  const userId = req.user.userId; // Get the logged-in user's ID
  try {
    const user = await User.findById(userId);
    const followingUsers = await User.find({ _id: { $in: user.following } }).exec();

    const usersWithProfilePics = await Promise.all(
      followingUsers.map(async (user) => {
        const userProfile = await UserProfile.findOne({ userId: user._id }).exec();
        return {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          profilePicUrl: userProfile ? userProfile.profilePicUrl : null,
        };
      })
    );

    res.json(usersWithProfilePics);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

  

// WebSocket Logic
let connectedUsers = {};

io.on('connection', async (socket) => {
  console.log('A user connected', socket.id);

  const userId = socket.handshake.query.userId;
  console.log('User ID:', userId);

  if (userId && userId !== 'undefined') {
    connectedUsers[userId] = socket.id;
    console.log('User socket data:', connectedUsers);

    const user = await User.findById(userId);
    if (user) {
      io.emit('user_online', { userId, username: user.username });
      console.log(`${user.username} is online`);
    }
  }

  socket.on('message', async ({ senderId, receiverId, message }) => {
    try {
      if (!senderId || !receiverId) {
        console.error('Both senderId and receiverId are required.');
        return;
      }

      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      
      if (!sender.following.includes(receiverId) || !receiver.followers.includes(senderId)) {
        console.error('Users are not connected to each other.');
        return;
      }

      console.log('Received message:', { senderId, receiverId, message });

      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content: message,
      });
      await newMessage.save();

      console.log('Message saved:', newMessage);

      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message', {
          senderId,
          message,
        });
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id);
    if (userId) {
      delete connectedUsers[userId];
      io.emit('user_offline', userId);
      console.log('A user disconnected', socket.id);
    }
  });
});

// Delete messages between two users
app.delete('/api/messages/:user1/:user2', authMiddleware, async (req, res) => {
  const { user1, user2 } = req.params;
  const userId = req.user.userId; 

  try {
    if (user1 !== userId && user2 !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete messages between these users' });
    }

    const result = await Message.deleteMany({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No messages found to delete' });
    }

    res.json({ success: true, message: 'Messages deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting messages' });
  }
});

// Fetch messages between two users
app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUser = decoded.userId;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ],
      hidden: false // Filter out hidden messages
    })
      .sort({ createdAt: 1 })
      .populate('sender', '_id username')
      .populate('receiver', '_id username');

    const formattedMessages = messages.map(message => ({
      ...message.toObject(),
      content: message.content.trim(),
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

