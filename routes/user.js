

import express from 'express';


import { userRegister, userLogin, userLogout ,followUser,unfollowUser,suggestedUsers} from '../controllers/user.js';
import { resetpassword } from '../controllers/passswordreset.js';
import { otpGenerate, varifyotp } from '../controllers/otp.js';
import { getCategories } from '../controllers/categories.js';
import { uploadProfilePic, getUserProfile, updateUserProfile, uploadBackgroundImage } from '../controllers/profile.js';
import authMiddleware from '../middlewares/authMiddleware.js';

import { getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/category.js';
import { getEvents,createEvent ,getEventsSubcategory,deleteEvent} from '../controllers/events.js';

const router = express.Router();

router.post('/register', userRegister);

router.post('/login', userLogin);

router.get('/logout', userLogout);
router.post('/reset-password', resetpassword);
router.post('/generate-otp', otpGenerate);
router.post('/verify-otp', varifyotp);
router.get('/v1/categories', getCategories);
router.put('/profile/update', authMiddleware, updateUserProfile);
router.get('/profile', authMiddleware, getUserProfile);
router.post('/profile/upload', authMiddleware, uploadProfilePic);
router.post('/profile/cover', authMiddleware, uploadBackgroundImage);
router.get('/getcategory', getCategory); 
router.post('/createcategory', authMiddleware, createCategory);
router.put('/updatecategory/:id', authMiddleware, updateCategory);
router.delete('/deletecategory/:id', authMiddleware, deleteCategory);
router.post('/follow/:userId', authMiddleware, followUser);
router.put('/unfollow/:userId', authMiddleware, unfollowUser);
router.get('/suggested-users', authMiddleware, suggestedUsers);

router.get('/getevents', getEvents);
router.get('/getsub-events', getEventsSubcategory);

router.post('/create-events', authMiddleware, createEvent);
router.delete('/events/:eventId',authMiddleware, deleteEvent);


export default router;