const express = require('express');
const rateLimit = require('express-rate-limit');
const mediaRoutes = require('./src/routes/mediaRoutes');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
require('dotenv').config();

const app = express();

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);

app.get('/', (req, res) => {
    res.status(200).send('OK');
});

app.use((req, res, next) => {
    console.log(`404 Error: No matching route for ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});