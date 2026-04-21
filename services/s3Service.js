// services/s3Service.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { handleAwsError } = require('./errorService');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY 
    ? { 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
      }
    : { accessKeyId: 'test', secretAccessKey: 'test' } // fallback for local development
});

const UPLOAD_URL_EXPIRY = parseInt(process.env.UPLOAD_URL_EXPIRY) || 300;
const DOWNLOAD_URL_EXPIRY = parseInt(process.env.DOWNLOAD_URL_EXPIRY) || 3600;

exports.getUploadUrl = async (key, contentType) => {
  try {
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType
    });
    
    const url = await getSignedUrl(s3, cmd, { expiresIn: UPLOAD_URL_EXPIRY });
    return url;
  } catch (error) {
    throw handleAwsError(error);
  }
};

exports.getDownloadUrl = async (key) => {
  try {
    const cmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });
    
    const url = await getSignedUrl(s3, cmd, { expiresIn: DOWNLOAD_URL_EXPIRY });
    return url;
  } catch (error) {
    throw handleAwsError(error);
  }
};

exports.uploadFile = async (key, body) => {
  try {
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body
    });
    await s3.send(cmd);
  } catch (error) {
    throw handleAwsError(error);
  }
};

exports.getFile = async (bucket, key) => {
  try {
    const cmd = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    const response = await s3.send(cmd);
    
    // Convert stream to buffer manually (reliable method)
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    return {
      ...response,
      Body: buffer
    };
  } catch (error) {
    throw handleAwsError(error);
  }
};