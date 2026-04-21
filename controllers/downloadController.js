const { getDownloadUrl } = require('../services/s3Service');
const { handleAwsError } = require('../services/errorService');

exports.getDownloadUrl = async (req, res) => {
  try {
    const { key } = req.query;
    const url = await getDownloadUrl(key);
    
    res.json({ url });
    
  } catch (error) {
    const errorInfo = handleAwsError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
};
