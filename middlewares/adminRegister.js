import jwt from 'jsonwebtoken';
import AdminRegister from '../models/adminregister.js';
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token is require' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminRegister.findById(decoded.userId);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default adminMiddleware;
