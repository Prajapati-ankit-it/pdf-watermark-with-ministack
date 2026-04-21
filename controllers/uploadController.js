const { getUploadUrl } = require('../services/s3Service');
const { handleAwsError } = require('../services/errorService');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

exports.getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType, fileSize } = req.body;
    
    // Validate file size if provided
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: 'File size exceeds the maximum allowed limit of 5MB' 
      });
    }
    
    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${filename}`;

    const url = await getUploadUrl(key, contentType);

    res.json({ url, key });

  } catch (error) {
    const errorInfo = handleAwsError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
};
