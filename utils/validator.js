const sanitizeFilename = (filename) => {
  // Remove path traversal attempts
  const sanitized = filename.replace(/\.\./g, '').replace(/[\\/]/g, '_');
  
  // Keep only safe characters (letters, numbers, dots, hyphens, underscores)
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const validatePdfRequest = (data) => {
  const { filename, contentType } = data;
  const errors = [];

  if (!filename || typeof filename !== 'string') {
    errors.push('filename is required and must be a string');
  } else {
    const sanitizedFilename = sanitizeFilename(filename);
    
    if (!sanitizedFilename.toLowerCase().endsWith('.pdf')) {
      errors.push('Only PDF files are allowed');
    }
    if (sanitizedFilename.length > 255) {
      errors.push('Filename too long (max 255 characters)');
    }
    if (sanitizedFilename !== filename) {
      errors.push('Filename contains invalid characters');
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

  // Additional security: prevent path traversal in keys
  if (key.includes('..') || key.includes('\\')) {
    return { isValid: false, error: 'Invalid key format' };
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

  // Optional fields validation - fix logic issue
  const optionalFields = { header, footer, watermark };
  for (const [field, value] of Object.entries(optionalFields)) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (value.length > 200) {
        errors.push(`${field} must be max 200 characters`);
      } else if (value.length === 0) {
        errors.push(`${field} cannot be empty string`);
      }
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
