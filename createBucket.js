const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'http://localhost:4566',
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

async function createBucket() {
  const bucketName = 'pdf-bucket';

  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket "${bucketName}" created successfully`);
  } catch (err) {
    console.log('Bucket may already exist');
  }
}

createBucket();