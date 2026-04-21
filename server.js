require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { uploadFile, getFile } = require('./services/s3Service');
const { handler } = require('./lambda/processPdf');
const signedUrlRoutes = require('./routes/signedUrlRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const upload = multer();
app.use(express.json());

const BUCKET = 'pdf-bucket';

app.use('/api', signedUrlRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Redirect root to API documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// key looks like : processed-uploads/1776553257954-Ankit_Prajapati.pdf
app.get('/download', async (req, res) => {
  try {
    const key = req.query.key;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const file = await getFile(BUCKET, key);

    res.setHeader('Content-Type', 'application/pdf');
    res.send(file.Body);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});