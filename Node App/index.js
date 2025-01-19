const express = require('express');
const mediaRoutes = require('./src/routes/mediaRoutes');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);

app.use((req, res, next) => {
    console.log(`404 Error: No matching route for ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});



// Starts the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
