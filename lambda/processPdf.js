const { getFile, uploadFile } = require('../services/s3Service');
const { modifyPDF } = require('../utils/pdfProcessor');
const { log, logError } = require('../utils/logger');
const { sendSMS } = require('../services/twilioService');

exports.handler = async (event) => {
  const { bucket, key, config} = event;
  let phone = event.phone; // Optional phone number for SMS notification
  try {
    // Validate inputs
    if (!bucket || !key) {
      throw new Error('Missing required parameters: bucket and key');
    }
    
    const file = await getFile(bucket, key);
    
    if (!file || !file.Body) {
      throw new Error('Failed to retrieve file from S3');
    }
    
    const updatedPdf = await modifyPDF(file.Body, config);
    
    if (!updatedPdf) {
      throw new Error('PDF modification failed - no output');
    }
    
    const outputKey = `processed-${key}`;
    await uploadFile(outputKey, updatedPdf);
    
    // Send SMS notification if phone number provided (non-blocking)
    phone = process.env.PHONE; // Override with environment variable for testing
    if (phone) {
      setImmediate(() => {
        sendSMS(phone, `Your PDF is ready. Key: ${outputKey}`);
      });
    }
    
    return { outputKey };
    
  } catch (error) {
    logError('pdf_processing_failed', error, { bucket, key });
    throw error;
  }
};