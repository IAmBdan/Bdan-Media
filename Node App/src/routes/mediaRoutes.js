const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  generatePresignedUrls,
  getMediaBySection,
  saveMediaMetadata,
  deleteMedia,
  deleteAllMediaInSection,
} = require('../controllers/mediaController');

router.post('/presigned-urls', generatePresignedUrls);
router.get('/section',         getMediaBySection);
router.post('/metadata',       saveMediaMetadata);
router.post('/delete',         deleteMedia);
router.post('/delete-all',     authenticate, deleteAllMediaInSection);

module.exports = router;