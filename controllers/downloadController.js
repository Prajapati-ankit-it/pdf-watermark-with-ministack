const { getDownloadUrl } = require('../services/s3Service');
const { log } = require('../utils/logger');

exports.getDownloadUrl = async (req, res) => {
  try {
    const { key } = req.query;
    const url = await getDownloadUrl(key);

    log('download_url_requested', { key });
    res.json({ url });

  } catch (error) {
    const { status, message } = error;
    log('download_url_failed', { key: req.query.key, error: message });
    res.status(status || 500).json({ error: message });
  }
};
