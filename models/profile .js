

import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profilePicUrl: {
    type: String,
    default: null,
  },
  userBio: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: ['creator', 'explorer'],
    required: true,
  },
  backgroundImage: {
    type: String,
    default: null,
  },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
