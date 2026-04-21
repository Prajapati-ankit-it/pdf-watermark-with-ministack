const { log } = require('../utils/logger');

// Simple in-memory job tracking
const jobs = new Map();

const createJob = () => {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id: jobId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    outputKey: null,
    error: null
  };
  
  jobs.set(jobId, job);
  log('job_created', { jobId });
  
  return jobId;
};

const completeJob = (jobId, outputKey) => {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'done';
    job.outputKey = outputKey;
    job.completedAt = new Date().toISOString();
    log('job_completed', { jobId, outputKey });
  }
  return job;
};

const failJob = (jobId, error) => {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'failed';
    job.error = error.message;
    job.failedAt = new Date().toISOString();
    log('job_failed', { jobId, error: error.message });
  }
  return job;
};

const getJob = (jobId) => {
  return jobs.get(jobId);
};

// Cleanup old jobs (older than 1 hour)
const cleanupJobs = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  let cleaned = 0;
  
  for (const [jobId, job] of jobs.entries()) {
    const jobTime = new Date(job.createdAt).getTime();
    if (jobTime < oneHourAgo) {
      jobs.delete(jobId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    log('jobs_cleaned', { count: cleaned });
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupJobs, 30 * 60 * 1000);

module.exports = {
  createJob,
  completeJob,
  failJob,
  getJob
};
