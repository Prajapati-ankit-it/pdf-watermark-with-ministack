const validatePdfRequest = (data) => {
  const { filename, contentType } = data;
  const errors = [];

  if (!filename || typeof filename !== 'string') {
    errors.push('filename is required and must be a string');
  } else {
    if (!filename.toLowerCase().endsWith('.pdf')) {
      errors.push('Only PDF files are allowed');
    }
    if (filename.length > 255) {
      errors.push('Filename too long (max 255 characters)');
    }
  }

  if (!contentType || typeof contentType !== 'string') {
    errors.push('contentType is required and must be a string');
  } else if (contentType !== 'application/pdf') {
    errors.push('Content type must be application/pdf');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateS3Key = (key, requiredPrefix) => {
  if (!key || typeof key !== 'string') {
    return { isValid: false, error: 'Key is required and must be a string' };
  }

  if (!key.startsWith(requiredPrefix)) {
    return { isValid: false, error: `Key must start with ${requiredPrefix}` };
  }

  if (!key.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, error: 'Only PDF files are allowed' };
  }

  return { isValid: true };
};

const validateProcessRequest = (data) => {
  const { key, header, footer, watermark } = data;
  const errors = [];

  const keyValidation = validateS3Key(key, 'uploads/');
  if (!keyValidation.isValid) {
    errors.push(keyValidation.error);
  }

  // Optional fields validation
  const optionalFields = { header, footer, watermark };
  for (const [field, value] of Object.entries(optionalFields)) {
    if (value && (typeof value !== 'string' || value.length > 200)) {
      errors.push(`${field} must be a string with max 200 characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePdfRequest,
  validateS3Key,
  validateProcessRequest
};
