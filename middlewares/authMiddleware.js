import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user; 
    next(); 
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};


export default authMiddleware;


