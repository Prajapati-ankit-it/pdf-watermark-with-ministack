const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'http://localhost:4566',
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

// Upload
exports.uploadFile = async (bucket, key, body) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body
    })
  );
};

// Get file
exports.getFile = async (bucket, key) => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  // convert stream → buffer
  return {
    Body: await streamToBuffer(response.Body)
  };
};

// Create bucket
exports.createBucket = async (bucket) => {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log("Bucket created");
  } catch (err) {
    console.log("Bucket may already exist");
  }
};

// helper
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};