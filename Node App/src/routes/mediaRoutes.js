const express = require('express');
const { generatePresignedUrls } = require('../controllers/mediaController');
const router = express.Router();
const { getMediaBySection } = require('../controllers/mediaController');
const { saveMediaMetadata } = require('../controllers/mediaController');
const { deleteMedia } = require('../controllers/mediaController');

// Generate pre-signed URLs for uploading files to S3 so it doenst go through the server
router.post('/presigned-urls', generatePresignedUrls);



// Define the route to get media by section
router.get('/section', getMediaBySection);

// Save metadata for uploaded media
router.post('/metadata', saveMediaMetadata);

//  the route to delete media
router.post('/delete', deleteMedia);



module.exports = router;
