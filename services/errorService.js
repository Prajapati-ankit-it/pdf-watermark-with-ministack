const { logError } = require('../utils/logger');

const handleAwsError = (error) => {
  const errorMap = {
    'NoSuchBucket': {
      status: 503,
      message: 'Storage service unavailable'
    },
    'NoSuchKey': {
      status: 404,
      message: 'File not found'
    },
    'AccessDenied': {
      status: 403,
      message: 'Access denied'
    },
    'InvalidBucketName': {
      status: 400,
      message: 'Invalid bucket configuration'
    },
    'NetworkingError': {
      status: 503,
      message: 'Network connectivity issue'
    }
  };

  const errorInfo = errorMap[error.name] || {
    status: 500,
    message: 'Internal server error'
  };

  logError('aws_error', error, { errorName: error.name });

  return errorInfo;
};

const handleValidationError = (errors) => {
  logError('validation_error', new Error('Validation failed'), { errors });
  return {
    status: 400,
    message: 'Validation failed',
    details: errors
  };
};

const handleProcessingError = (error) => {
  logError('processing_error', error);
  
  if (error.message.includes('must be of type')) {
    return {
      status: 400,
      message: 'Invalid file format'
    };
  }
  
  return {
    status: 500,
    message: 'Processing failed'
  };
};

module.exports = {
  handleAwsError,
  handleValidationError,
  handleProcessingError
};
