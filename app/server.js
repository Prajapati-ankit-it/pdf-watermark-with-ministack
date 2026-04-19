const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../services/s3Service');
const { handler } = require('../lambda/processPdf');
const { getFile } = require('../services/s3Service');

const app = express();
const upload = multer();

const BUCKET = 'pdf-bucket';

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }
  const { header, footer, watermark } = req.body;

  const key = `uploads/${Date.now()}-${file.originalname}`;

  await uploadFile(BUCKET, key, file.buffer);

  const result = await handler({
    bucket: BUCKET,
    key,
    config: { header, footer, watermark }
  });

  res.json({
    message: 'Uploaded & processed',
    output: result.outputKey
  });
});

// key looks like : processed-uploads/1776553257954-Ankit_Prajapati.pdf
app.get('/download', async (req, res) => {
  const key = req.query.key;
  console.log("KEY:", key);
  const file = await getFile(BUCKET, key);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(file.Body);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});