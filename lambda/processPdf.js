const { getFile, uploadFile } = require('../services/s3Service');
const { modifyPDF } = require('../utils/pdfProcessor');


exports.handler = async (event) => {
  const { bucket, key, config } = event;

  const file = await getFile(bucket, key);

  const updatedPdf = await modifyPDF(file.Body, config);

  const outputKey = `processed-${key}`;

  await uploadFile(bucket, outputKey, updatedPdf);

  return { outputKey };
};