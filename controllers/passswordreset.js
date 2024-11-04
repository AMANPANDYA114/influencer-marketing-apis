import bcrypt from 'bcrypt';
import User from '../models/user.js';

export const resetpassword= async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
  
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  
      await User.updateOne({ email }, { password: hashedPassword });
  
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error resetting password' });
    }
  }