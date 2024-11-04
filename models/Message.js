


import mongoose from 'mongoose';

// Define the Message schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  , 
  hidden: { type: Boolean, default: false },
});

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

export default Message;

