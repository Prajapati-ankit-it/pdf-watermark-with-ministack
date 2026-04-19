const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-east-1'
});

exports.uploadFile = (bucket, key, body) =>
  s3.putObject({ Bucket: bucket, Key: key, Body: body }).promise();

exports.getFile = (bucket, key) =>
  s3.getObject({ Bucket: bucket, Key: key }).promise();