


import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import AdminRegister from '../models/adminregister.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import UserProfile from '../models/profile .js';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const userRegister = async (req, res) => {
  try {
    const { fullName, username, age, email, account, password, confirmPassword } = req.body;

    if (!fullName || !username || !age || !email || !account || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   
    const newUser = new User({
      fullName,
      username,
      age,
      email,
      account,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: 'user' 
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '4h'
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 4 * 60 * 60 * 1000 }).status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        age: newUser.age,
        email: newUser.email,
        account: newUser.account,
        role: newUser.role 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
};


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await AdminRegister.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '4h'
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 4 * 60 * 60 * 1000 }).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingUser = await AdminRegister.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminRegister({
      name,
      email,
      password: hashedPassword
    });
    await newAdmin.save();

    const token = jwt.sign({ userId: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: '4h'
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 4 * 60 * 60 * 1000 }).status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error registering admin' });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15d'
    });

    console.log(`User logged in: ${user.email}, ID: ${user._id}, Role: ${user.role}`);
    const userProfile = await UserProfile.findOne({ userId: user._id });
    res.cookie('token', token, {httpOnly: true,maxAge: 15 * 24 * 60 * 60 * 1000  }).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        age: user.age,
        email: user.email,
        account: user.account,
        profilePicUrl: userProfile ? userProfile.profilePicUrl : null,
        role: user.role 
      },
      token: token,
       expireIn: '15 days'

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
};

export const userLogout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token found' });
    }

    res.clearCookie('token').status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error logging out' });
  }
};

export const followUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const followUserId = req.params.userId;

    if (userId.toString() === followUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followUserId);

    if (!followUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.following.includes(followUserId)) {
      return res.status(400).json({ error: "Already following this user" });
    }

    user.following.push(followUserId);
    followUser.followers.push(userId);

    await user.save();
    await followUser.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const unfollowUserId = req.params.userId;

    console.log(`User ID: ${userId}`);
    console.log(`Unfollow User ID: ${unfollowUserId}`);

    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowUserId);

    if (!unfollowUser) {
      console.log('Unfollow user not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.following.includes(unfollowUserId)) {
      console.log('User is not following the specified user');
      return res.status(400).json({ error: 'Not following this user' });
    }

    
    await User.findByIdAndUpdate(userId, { $pull: { following: unfollowUserId } });

    
    await User.findByIdAndUpdate(unfollowUserId, { $pull: { followers: userId } });

    console.log(`User ${userId} unfollowed user ${unfollowUserId}`);

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};




export const suggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('following', 'username');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const followingUserIds = user.following.map(followedUser => followedUser._id);

    const suggestedUsers = await User.find({ 
      _id: { $ne: userId, $nin: followingUserIds }
    }).select('username fullName');

    const suggestedUsersWithProfilePic = await Promise.all(suggestedUsers.map(async (suggestedUser) => {
      const userProfile = await UserProfile.findOne({ userId: suggestedUser._id }).select('profilePicUrl');
      return {
        _id: suggestedUser._id,
        username: suggestedUser.username,
        fullName: suggestedUser.fullName,
        profilePicUrl: userProfile ? userProfile.profilePicUrl : null,
      };
    }));

    res.status(200).json({ success: true, suggestedUsers: suggestedUsersWithProfilePic });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



export const userAuth = [authMiddleware];