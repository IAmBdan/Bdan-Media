const express = require('express');
const { getUserProfileByUsername, getAllUsers, updateUser, getUserContent, addFollower, removeFollower, getFollowers } = require('../controllers/userController');
const router = express.Router();

router.get('/profile/:username', getUserProfileByUsername); // Get user profile by username
router.get('/', getAllUsers); // Get all users
router.put('/:id', updateUser); // Update user profile
router.get('/:id/content', getUserContent); // Get user's uploaded media

router.post('/:id/followers', addFollower); // Add follower
router.delete('/:id/followers/:followerId', removeFollower); // Remove follower
router.get('/:id/followers', getFollowers); // Get followers
module.exports = router;
