


import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventType: String,
  eventCategory: String,
  eventSubcategory: String,
  venueName: String,
  venueAddress: String,
  date: Date,
  time: String,
  images: [String],
  description: String,
  fees: Number,
  interests: [String],
  createdBy: String,
  creatorProfilePic: String,
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Event = mongoose.model('Event', eventSchema);
export default Event;

