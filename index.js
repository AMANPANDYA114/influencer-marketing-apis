import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
const server = http.createServer(app);

const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://amanp114:UUr2tBfuGeTjHJxC@cluster0.tjlmotu.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
