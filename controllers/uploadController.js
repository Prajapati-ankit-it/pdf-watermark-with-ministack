const { getUploadUrl } = require('../services/s3Service');
const { log } = require('../utils/logger');

exports.getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${filename}`;

    const url = await getUploadUrl(key, contentType);

    log('upload_url_requested', { filename, key });
    res.json({ url, key });

  } catch (error) {
    const { status, message } = error;
    log('upload_url_failed', { filename: req.body.filename, error: message });
    res.status(status || 500).json({ error: message });
  }
};
