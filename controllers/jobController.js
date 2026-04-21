const { getJob } = require('../services/jobService');
const { log } = require('../utils/logger');

exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.query;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      outputKey: job.outputKey,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      failedAt: job.failedAt
    });

  } catch (error) {
    log('job_status_error', { jobId: req.query.jobId, error: error.message });
    res.status(500).json({ error: 'Failed to get job status' });
  }
};
