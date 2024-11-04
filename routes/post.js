
import express from 'express';
import { addComment, createPost, createVideoPost, deleteComment, deletePost, getComments, getFeedPosts, getPost, getUserDetails, getUserPosts, getUserPostsById, getuservideos, getViewCount, incrementVideoView, likePost } from '../controllers/post.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/post/:id', authMiddleware, getPost); 
router.post('/video/view/:userid/:videoid', incrementVideoView);

router.put('/create-video',authMiddleware,createVideoPost)
router.post('/create-post',authMiddleware,createPost)

router.delete('/post/:id', authMiddleware, deletePost);
router.get('/feed', authMiddleware, getFeedPosts); 
router.get('/posts/:username', authMiddleware, getUserPosts); 
router.post('/like/:id',authMiddleware, likePost);
router.post('/post/:id/comment',authMiddleware, addComment);
router.get('/post/:id/comments',authMiddleware, getComments);
router.delete('/post/:postId/comments/:commentId', authMiddleware, deleteComment);
router.get('/getuserdetails/:id', getUserDetails);
router.get('/myposts/:id', authMiddleware, getUserPostsById);
router.get('/myvideos/:id', authMiddleware, getuservideos);
router.get('/video/views/:videoId', getViewCount);
export default router;
