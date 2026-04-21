// services/s3Service.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { handleAwsError } = require('./errorService');
const { log } = require('../utils/logger');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
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
    log('upload_url_generated', { key });
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
    log('download_url_generated', { key });
    return url;
  } catch (error) {
    throw handleAwsError(error);
  }
};

exports.uploadBuffer = async (key, body) => {
  try {
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body
    });
    await s3.send(cmd);
    log('file_uploaded', { key });
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
    
    log('file_retrieved', { key, size: buffer.length });
    return {
      ...response,
      Body: buffer
    };
  } catch (error) {
    throw handleAwsError(error);
  }
};

exports.uploadFile = async (bucket, key, body) => {
  try {
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body
    });
    await s3.send(cmd);
    log('file_uploaded', { key });
  } catch (error) {
    throw handleAwsError(error);
  }
};