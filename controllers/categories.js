import Categories from '../models/categories.js';

export const getCategories = async (req, res) => {
  try {

    const categories = await Categories.find({});

  
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }

    
    return res.status(200).json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ message: 'Error fetching categories' });
  }
};
