
import mongoose from 'mongoose';

const customcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: {
    type: [String], 
    required: true,
  },
  description: { type: String, required: true }
});

const CustomCategory = mongoose.model('CustomCategory', customcategorySchema );

export default CustomCategory;