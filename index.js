

import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import Message from './models/Message.js';
import UserProfile from './models/profile .js';
import User from './models/user.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const PORT = 3000;


mongoose.connect('mongodb+srv://amanp114:UUr2tBfuGeTjHJxC@cluster0.tjlmotu.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


let connectedUsers = {};


io.on('connection', async (socket) => {
  console.log('A user connected', socket.id);

  
  const userId = socket.handshake.query.userId;

  console.log('userid', userId);


  if (userId && userId !== 'undefined') {
    connectedUsers[userId] = socket.id; 
    console.log('user socket data', connectedUsers);

 
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

      
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        console.error('Invalid senderId or receiverId');
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


app.get('/api/users', async (req, res) => {
  try {
    
    const users = await User.find({}).exec();

 
    const usersWithProfilePics = await Promise.all(
      users.map(async (user) => {
       
        const userProfile = await UserProfile.findOne({ userId: user._id }).exec();

       
        return {
          ...user.toObject(),
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


app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUser = decoded.userId; 

   
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
