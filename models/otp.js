import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  expireIn: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
