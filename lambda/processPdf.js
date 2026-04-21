const { getFile, uploadFile } = require('../services/s3Service');
const { modifyPDF } = require('../utils/pdfProcessor');
const { log, logError } = require('../utils/logger');

exports.handler = async (event) => {
  const { bucket, key, config } = event;

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
    
    return { outputKey };
    
  } catch (error) {
    logError('pdf_processing_failed', error, { bucket, key });
    throw error;
  }
};