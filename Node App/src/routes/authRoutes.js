const express = require('express');
const { loginUser, registerUser} = require('../controllers/userController');
const router = express.Router();
const authenticate = require('../middleware/auth');


router.post('/login', loginUser); // Login
router.post('/register', registerUser); // Register



module.exports = router;