import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Categories = mongoose.model('Categories', CategorySchema);
export default Categories;
