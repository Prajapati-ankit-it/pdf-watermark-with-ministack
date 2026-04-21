const { getFile, uploadFile } = require('../services/s3Service');
const { modifyPDF } = require('../utils/pdfProcessor');
const { log, logError } = require('../utils/logger');

exports.handler = async (event) => {
  const { bucket, key, config } = event;

  try {
    log('pdf_processing_started', { bucket, key, config });
    
    const file = await getFile(bucket, key);
    const updatedPdf = await modifyPDF(file.Body, config);
    const outputKey = `processed-${key}`;
    
    await uploadFile(bucket, outputKey, updatedPdf);
    
    log('pdf_processing_completed', { inputKey: key, outputKey });
    return { outputKey };
    
  } catch (error) {
    logError('pdf_processing_failed', error, { bucket, key });
    throw error;
  }
};