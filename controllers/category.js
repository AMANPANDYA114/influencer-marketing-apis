import CustomCategory from "../models/customcategorys.js";
import cloudinary from '../utils/cloudinary.js';
import upload from '../middlewares/multer.js';
import User from '../models/user.js';
export const getCategory = async (req, res) => {
  try {
    const customCategories = await CustomCategory.find({});
  
    if (!customCategories || customCategories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }
    return res.status(200).json({ customCategories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
export const createCategory = async (req, res) => {

  const user = await User.findById(req.user.id);
  if (user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You are not authorized to create events' });
  }
  upload.array('image', 10)(req, res, async function (err) { 
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading files' });
    }

    const { name, description } = req.body;

    if (!name || !req.files || req.files.length === 0 || !description) {
      return res.status(400).json({ success: false, message: 'All fields (name, image, description) are required' });
    }

    try {
      
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        })
      );

      
      const newCategory = new CustomCategory({ name, image: imageUrls, description });
      await newCategory.save();

      res.status(201).json({ success: true, category: newCategory });
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ success: false, message: 'Error creating category' });
    }
  });
};


export const updateCategory = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You are not authorized to update events' });
  }
  upload.single('image')(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading files' });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || !name || !description) {
      return res.status(400).json({ success: false, message: 'All fields (id, name, image, description) are required' });
    }

    try {
      const category = await CustomCategory.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      let imageUrl = category.image;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = [result.secure_url];
      }

      category.name = name;
      category.description = description;
      category.image = imageUrl;

      await category.save();

      res.status(200).json({ success: true, category });
    } catch (err) {
      console.error('Error updating category:', err);
      res.status(500).json({ success: false, message: 'Error updating category' });
    }
  });
};
export const deleteCategory = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You are not authorized to delete events' });
  }
  const { id } = req.params;
  try {
    const category = await CustomCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Error deleting category' });
  }
};