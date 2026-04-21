require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { uploadFile, getFile } = require('./services/s3Service');
const { handler } = require('./lambda/processPdf');
const { handler: renderUIHandler } = require('./lambda/renderUI');
const { log, logError } = require('./utils/logger');
const signedUrlRoutes = require('./routes/signedUrlRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const upload = multer();
app.use(express.json());

const BUCKET = 'pdf-bucket';

app.use('/api', signedUrlRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// UI route - calls renderUI Lambda handler
app.get('/ui', async (req, res) => {
  try {
    const result = await renderUIHandler();
    res.status(result.statusCode);
    
    // Set headers from Lambda response
    Object.entries(result.headers || {}).forEach(([key, value]) => {
      res.set(key, value);
    });
    
    res.send(result.body);
  } catch (error) {
    logError('ui_render_error', error);
    res.status(500).send('<h1>Service Unavailable</h1><p>The UI service is temporarily unavailable.</p>');
  }
});

// Redirect root to API documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
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
    logError('download_error', error, { key: req.query.key });
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

app.listen(3000, () => {
  log('server_started', { port: 3000 });
});