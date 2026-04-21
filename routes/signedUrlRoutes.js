const express = require('express');
const router = express.Router();
const { getUploadUrl } = require('../controllers/uploadController');
const { processFile } = require('../controllers/processController');
const { getDownloadUrl } = require('../controllers/downloadController');
const { getJobStatus } = require('../controllers/jobController');
const { 
  validateUploadRequest, 
  validateProcessRequest, 
  validateDownloadRequest,
  validateJobStatusRequest 
} = require('../middleware/validation');

router.post('/upload-url', validateUploadRequest, getUploadUrl);
router.post('/process', validateProcessRequest, processFile);
router.get('/download-url', validateDownloadRequest, getDownloadUrl);
router.get('/job-status', validateJobStatusRequest, getJobStatus);

module.exports = router;
