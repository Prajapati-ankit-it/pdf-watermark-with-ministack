const { validatePdfRequest, validateProcessRequest: validateProcessData, validateS3Key } = require('../utils/validator');

const validateUploadRequest = (req, res, next) => {
  const validation = validatePdfRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validation.errors 
    });
  }
  next();
};

const validateProcessRequest = (req, res, next) => {
  const validation = validateProcessData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validation.errors 
    });
  }
  next();
};

const validateDownloadRequest = (req, res, next) => {
  const { key } = req.query;
  const validation = validateS3Key(key, 'processed-uploads/');
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: [validation.error] 
    });
  }
  next();
};

const validateJobStatusRequest = (req, res, next) => {
  const { jobId } = req.query;
  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: ['jobId is required and must be a string'] 
    });
  }
  
  // Validate jobId format: job_timestamp_randomstring
  const jobIdPattern = /^job_[0-9]+_[a-z0-9]+$/;
  if (!jobIdPattern.test(jobId)) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: ['Invalid jobId format'] 
    });
  }
  
  next();
};

module.exports = {
  validateUploadRequest,
  validateProcessRequest,
  validateDownloadRequest,
  validateJobStatusRequest
};
