const db = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For token generation

// Get user profile by username
const getUserProfileByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await db.query(
            `SELECT id, username, email, role, created_at, followers, following 
             FROM users WHERE LOWER(username) = LOWER($1)`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // For anonymous users, hide sensitive info
        

        // Fetch data for followers and following
        const followers = await db.query(
            `SELECT id, username FROM users WHERE id = ANY($1::int[])`,
            [user.followers]
        );

        const following = await db.query(
            `SELECT id, username FROM users WHERE id = ANY($1::int[])`,
            [user.following]
        );

        res.status(200).json({
            ...user,
            followers: followers.rows,
            following: following.rows,
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
};


// Get all users (for browsing users)
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(`SELECT id, username, role FROM users`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, followers, following } = req.body;

    try {
        const query = `
            UPDATE users SET
                username = COALESCE($1, username),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                followers = COALESCE($4, followers),
                following = COALESCE($5, following)
            WHERE id = $6 RETURNING id, username, email, role, followers, following, created_at
        `;
        const values = [username, email, password, followers, following, id];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Fetch associated media for a user
const getUserContent = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT id, s3_key, type, width, height, tags, uploaded_at 
             FROM media 
             WHERE uploaded_by = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No media found for this user' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user content:', error.message);
        res.status(500).json({ error: 'Failed to fetch user content' });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (userResult.rows.length === 0) {
            // Send response and return to avoid further processing
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Check plain text password for demonstration (change to hashed comparison for production)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send successful response
        return res.status(200).json({ token, user });
    } catch (error) {
        console.error('Error during login:', error);
        // Ensure only one response is sent in the case of an error
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to login' });
        }
    }
};

// Register User
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if username or email already exists
        const existingUser = await db.query(
            `SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)`,
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const result = await db.query(
            `INSERT INTO users (username, email, password, role, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, role, created_at`,
            [username, email, hashedPassword, 'user'] // Default role is 'user'
        );

        // Generate a JWT token (optional)
        const token = jwt.sign(
            { id: result.rows[0].id, username: result.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User registered successfully.', user: result.rows[0], token });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const addFollower = async (req, res) => {
    const { username } = req.body; // Username of the follower to add
    const { id } = req.params; // ID of the logged-in user

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Find the user to follow
        const userToFollow = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);

        if (userToFollow.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const followerId = userToFollow.rows[0].id;

        // Add to the followers list of the current user
        await db.query(
            `UPDATE users SET followers = array_append(followers, $1) WHERE id = $2`,
            [followerId, id]
        );

        // Add to the following list of the other user
        await db.query(
            `UPDATE users SET following = array_append(following, $1) WHERE id = $2`,
            [id, followerId]
        );

        res.status(200).json({ message: 'Follower added successfully', followerId });
    } catch (error) {
        console.error('Error adding follower:', error);
        res.status(500).json({ error: 'Failed to add follower' });
    }
};

const removeFollower = async (req, res) => {
    const { followerId } = req.params; // ID of the follower to remove
    const { id } = req.params; // ID of the logged-in user

    try {
        // Remove from the followers list of the current user
        await db.query(
            `UPDATE users SET followers = array_remove(followers, $1) WHERE id = $2`,
            [followerId, id]
        );

        // Remove from the following list of the other user
        await db.query(
            `UPDATE users SET following = array_remove(following, $1) WHERE id = $2`,
            [id, followerId]
        );

        res.status(200).json({ message: 'Follower removed successfully' });
    } catch (error) {
        console.error('Error removing follower:', error);
        res.status(500).json({ error: 'Failed to remove follower' });
    }
};

const getFollowers = async (req, res) => {
    const { id } = req.params;

    try {
        const followers = await db.query(
            `SELECT id, username FROM users WHERE id = ANY((SELECT followers FROM users WHERE id = $1)::int[])`,
            [id]
        );

        res.status(200).json(followers.rows);
    } catch (error) {
        console.error('Error fetching followers:', error.message);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
};




module.exports = { getUserProfileByUsername, getAllUsers, updateUser, getUserContent, loginUser, registerUser, addFollower, removeFollower, getFollowers };
