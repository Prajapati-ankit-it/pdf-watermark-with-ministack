const { handler } = require('../lambda/processPdf');
const { createJob, completeJob, failJob } = require('../services/jobService');
const { handleProcessingError } = require('../services/errorService');
const { log } = require('../utils/logger');

exports.processFile = async (req, res) => {
  try {
    const { key, header, footer, watermark, phone } = req.body;
    const bucket = process.env.S3_BUCKET;
    const jobId = createJob();

    // Start async processing
    processPdfAsync(bucket, key, { header, footer, watermark }, jobId, phone);

    log('processing_started', { key, jobId });
    res.json({ message: 'Processing started', jobId });

  } catch (error) {
    const { status, message } = handleProcessingError(error);
    log('processing_failed', { key: req.body.key, error: message });
    res.status(status).json({ error: message });
  }
};

async function processPdfAsync(bucket, key, config, jobId, phone) {
  try {
    const result = await handler({ bucket, key, config, phone });
    completeJob(jobId, result.outputKey);
  } catch (error) {
    failJob(jobId, error);
  }
}
