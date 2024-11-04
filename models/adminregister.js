import mongoose from 'mongoose';

const adminRegisterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const AdminRegister = mongoose.model('AdminRegister', adminRegisterSchema);

export default AdminRegister;