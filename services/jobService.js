const { log } = require('../utils/logger');

// Simple in-memory job tracking
const jobs = new Map();

const createJob = () => {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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

// Cleanup old jobs (older than 2 hours)
const cleanupJobs = () => {
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
  
  for (const [jobId, job] of jobs.entries()) {
    const jobTime = new Date(job.createdAt).getTime();
    if (jobTime < twoHoursAgo) {
      jobs.delete(jobId);
    }
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
