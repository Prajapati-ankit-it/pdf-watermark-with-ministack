// controllers/fileController.js
const { getUploadUrl, getDownloadUrl } = require('../services/s3Service');
const { handler } = require('../lambda/processPdf');

exports.generateUploadUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    if (!contentType.includes('pdf')) {
      return res.status(400).json({ error: 'Only PDF allowed' });
    }

    const key = `uploads/${Date.now()}-${filename}`;
    const url = await getUploadUrl(key, contentType);

    res.json({ url, key });
  } catch {
    res.status(500).json({ error: 'Failed to generate URL' });
  }
};

exports.processFile = async (req, res) => {
  try {
    const { key, header, footer, watermark } = req.body;

    // async simulation
    setImmediate(() => {
      handler({
        bucket: process.env.S3_BUCKET,
        key,
        config: { header, footer, watermark }
      }).catch(console.error);
    });

    res.json({ message: 'Processing started', key });
  } catch {
    res.status(500).json({ error: 'Processing failed' });
  }
};

exports.getDownloadUrl = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key.startsWith('processed-')) {
      return res.status(400).json({ error: 'Invalid key' });
    }

    const url = await getDownloadUrl(key);
    res.json({ url });
  } catch {
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};