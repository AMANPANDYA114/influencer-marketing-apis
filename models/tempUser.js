const { v4: uuidv4 } = require('uuid');

module.exports = function (Schema) {
  const TempUser = new Schema({
    _id: {
      type: String,
      default: uuidv4(),
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    emailOtp: {
      type: String,
    },
    isOtpSent: {
      type: Boolean,
      default: false,
    },
    otpExpiryDate: {
      type: Date,
    },
  }, { timestamps: true });

  return TempUser;
};
