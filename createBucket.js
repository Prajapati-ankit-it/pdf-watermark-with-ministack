const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-east-1'
});

async function createBucket() {
  const bucketName = 'pdf-bucket';

  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket "${bucketName}" created successfully`);
  } catch (err) {
    if (err.code === 'BucketAlreadyOwnedByYou') {
      console.log('Bucket already exists');
    } else {
      console.error('Error creating bucket:', err.message);
    }
  }
}
createBucket();