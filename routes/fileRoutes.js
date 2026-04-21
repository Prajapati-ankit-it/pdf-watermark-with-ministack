// routes/fileRoutes.js
const router = require('express').Router();
const controller = require('../controllers/fileController');

router.post('/upload-url', controller.generateUploadUrl);
router.post('/process', controller.processFile);
router.get('/download-url', controller.getDownloadUrl);

module.exports = router;