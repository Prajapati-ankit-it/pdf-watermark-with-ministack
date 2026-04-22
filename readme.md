# PDF Processing Service

## Overview

A production-ready PDF processing service with S3 signed URLs, asynchronous processing, job tracking, and SMS notifications. Built with Node.js, Express, AWS SDK v3, and optimized for scalability and performance.

---

## Features

### Core Functionality
- **Direct S3 Upload**: Client uploads directly to S3 using signed URLs (no backend storage)
- **Async Processing**: Non-blocking PDF processing with real-time job tracking
- **PDF Modifications**: Header, footer, and watermark support with pdf-lib
- **SMS Notifications**: Twilio integration for processing completion alerts
- **Production Architecture**: Clean separation of concerns with proper error handling

### Production Features
- **Signed URLs**: Secure, time-limited upload/download URLs
- **Job Tracking**: In-memory job status monitoring with auto-cleanup
- **Structured Logging**: JSON logs with action tracking
- **Input Validation**: Centralized validation with detailed error messages
- **API Documentation**: Interactive Swagger UI with comprehensive docs
- **Error Handling**: Specific AWS error mapping and proper HTTP status codes

---

## Prerequisites

### Required Software
- **Node.js** 18+ 
- **Docker** (for Ministack local AWS simulation)
- **Git** (for version control)

### System Requirements
- **RAM**: 4GB minimum
- **Storage**: 2GB free space
- **Network**: Internet connection for package installation

---

## Step-by-Step Setup Guide

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <your-repo-link>

# Navigate to project directory
cd pdf-lamda

# Verify project structure
ls -la
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# Verify installation (should show package.json dependencies)
npm list --depth=0
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the environment file
notepad .env  # Windows
# or nano .env  # Linux/Mac
```

### Step 4: Configure Environment Variables

Edit `.env` file with the following configuration:

```bash
# Server Configuration
PORT=3000

# AWS S3 Configuration
AWS_REGION=us-east-1
S3_BUCKET=pdf-bucket
AWS_ENDPOINT=http://localhost:4566

# URL Expiration Times (seconds)
UPLOAD_URL_EXPIRY=300      # 5 minutes
DOWNLOAD_URL_EXPIRY=3600   # 1 hour

# Twilio Configuration (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_PHONE=+19785060463
PHONE="+918799047773"
```

### Step 5: Start Ministack (Local AWS S3)

```bash
# Pull and run Ministack Docker container
docker run -d -p 4566:4566 --name ministack ministackorg/ministack

# Verify container is running
docker ps | grep ministack

# Check Ministack health
curl http://localhost:4566
```

### Step 6: Create S3 Bucket

```bash
# Create the S3 bucket for PDF storage
node createBucket.js

# Verify bucket creation
docker exec ministack aws s3 ls
```

### Step 7: Start the Server

```bash
# Start the PDF processing server
npm start

# You should see output like:
# {"action":"server_started","timestamp":"2026-04-22T14:09:58.046Z","port":3000}
```

### Step 8: Verify Setup

Open your browser and navigate to:
- **Main UI**: http://localhost:3000/ui
- **API Documentation**: http://localhost:3000/api-docs
- **Swagger JSON**: http://localhost:3000/swagger.json

---

## Complete Workflow Example

### Step 1: Upload a PDF File

1. Open http://localhost:3000/ui in your browser
2. Click "Choose File" or drag & drop a PDF
3. Fill in optional fields (Header, Footer, Watermark)
4. Click "Upload & Process PDF"

### Step 2: Monitor Processing

The system will show:
- **Upload Progress**: File being uploaded to S3
- **Processing Progress**: PDF being modified
- **Completion**: Download link appears

### Step 3: Download Processed PDF

1. Wait for processing to complete
2. Click the "Download Processed PDF" link
3. The modified PDF will be downloaded

### Step 4: SMS Notification (Optional)

If Twilio is configured:
- You'll receive an SMS when processing completes
- Message format: "Your PDF is ready. Key: [outputKey]"

---

## API Usage Guide

### Upload URL Generation

```bash
curl -X POST http://localhost:3000/api/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pdf","contentType":"application/pdf"}'
```

**Response:**
```json
{
  "url": "http://localhost:4566/pdf-bucket/uploads/1640995200000-test.pdf?X-Amz-Algorithm=...",
  "key": "uploads/1640995200000-test.pdf"
}
```

### Start Processing

```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"key":"uploads/1640995200000-test.pdf","header":"CONFIDENTIAL","footer":"My Company","watermark":"DRAFT","phone":"+918799047773"}'
```

**Response:**
```json
{
  "message": "Processing started",
  "jobId": "job_1640995200000_abc123def"
}
```

### Check Job Status

```bash
curl "http://localhost:3000/api/job-status?jobId=job_1640995200000_abc123def"
```

**Response States:**
- `processing`: Job is running
- `done`: Job completed successfully  
- `failed`: Job failed with error

### Download Processed File

```bash
curl "http://localhost:3000/api/download-url?key=processed-uploads/1640995200000-test.pdf"
```

**Response:**
```json
{
  "url": "http://localhost:4566/pdf-bucket/processed-uploads/1640995200000-test.pdf?X-Amz-Algorithm=..."
}
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: S3 Bucket Not Found
**Error**: `NoSuchBucket` or bucket doesn't exist

**Solution**:
```bash
# Create the bucket
node createBucket.js

# Verify bucket exists
docker exec ministack aws s3 ls

# Restart server
npm start
```

#### Issue 2: Ministack Connection Failed
**Error**: Connection refused or timeout

**Solution**:
```bash
# Check if Ministack is running
docker ps | grep ministack

# Start Ministack if not running
docker run -d -p 4566:4566 --name ministack ministackorg/ministack

# Restart Ministack if needed
docker restart ministack

# Verify connection
curl http://localhost:4566
```

#### Issue 3: Environment Variables Not Loaded
**Error**: Missing configuration values

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check file contents
cat .env

# Ensure proper format (no spaces around =)
# Correct: PORT=3000
# Wrong: PORT = 3000

# Restart server after changes
npm start
```

#### Issue 4: Port Already in Use
**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux/Mac

# Kill the process (replace PID)
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Linux/Mac

# Or use different port
PORT=3001 npm start
```

#### Issue 5: PDF Processing Fails
**Error**: Invalid PDF format or processing error

**Solution**:
- Ensure uploaded file is a valid PDF
- Check file size (max 5MB)
- Verify PDF is not password protected
- Check server logs for detailed error

#### Issue 6: SMS Notifications Not Working
**Error**: Twilio authentication or country mismatch

**Solution**:
```bash
# Verify Twilio credentials in .env
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN

# Check phone number format
# Must include country code: +1234567890

# Test Twilio connection manually
# (Check server logs for SMS attempt details)
```

#### Issue 7: File Upload Fails
**Error**: Upload timeout or failed

**Solution**:
- Check internet connection
- Verify file size is under 5MB
- Ensure file is valid PDF format
- Check Ministack is running

---

## Debug Mode & Health Checks

### Enable Debug Logging

```bash
# Enable detailed debug logs
DEBUG=true npm start

# Suppress logs for clean output
quiet=true npm start
```

### System Health Check

```bash
# Check server health
curl http://localhost:3000/api-docs

# Check Ministack health
curl http://localhost:4566

# Test S3 connection
node createBucket.js

# Verify all services running
docker ps | grep ministack
netstat -ano | findstr :3000
```

---

## Quick Start (5-Minute Setup)

```bash
# 1. Clone and install
git clone <your-repo-link> && cd pdf-lamda
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Twilio credentials if needed

# 3. Start services
docker run -d -p 4566:4566 --name ministack ministackorg/ministack
node createBucket.js

# 4. Start server
npm start

# 5. Test
open http://localhost:3000
```

---

## Project Structure

```
pdf-lamda/
 controllers/
   uploadController.js      # Upload URL generation
   processController.js     # Processing orchestration
   downloadController.js   # Download URL generation
   jobController.js         # Job status tracking

 services/
   s3Service.js            # S3 operations and signed URLs
   jobService.js           # Job tracking and management
   twilioService.js        # SMS notification service
   errorService.js         # Error handling and mapping

 middleware/
   validation.js           # Request validation middleware

 utils/
   validator.js            # Validation utilities
   logger.js               # Structured logging

 lambda/
   processPdf.js           # PDF processing logic
   renderUI.js             # UI rendering
   twilioNotification.js   # SMS notification handler

 routes/
   signedUrlRoutes.js      # API route definitions

 server.js                 # Main server file
 createBucket.js           # S3 bucket creation
 package.json              # Dependencies
 .env.example              # Environment template
 swagger.json              # OpenAPI specification
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| AWS_REGION | Yes | us-east-1 | AWS region for S3 |
| S3_BUCKET | Yes | pdf-bucket | S3 bucket name |
| AWS_ENDPOINT | Yes | http://localhost:4566 | Local AWS endpoint |
| UPLOAD_URL_EXPIRY | No | 300 | Upload URL expiration (seconds) |
| DOWNLOAD_URL_EXPIRY | No | 3600 | Download URL expiration (seconds) |
| TWILIO_ACCOUNT_SID | No | - | Twilio account SID |
| TWILIO_AUTH_TOKEN | No | - | Twilio auth token |
| TWILIO_PHONE | No | - | Twilio phone number |
| PHONE | No | - | Default SMS recipient |

---

## Monitoring & Logging

### Log Actions
- `server_started` - Server initialized
- `upload_url_generated` - Upload URL created
- `processing_started` - PDF processing initiated
- `pdf_processing_completed` - PDF processing finished
- `pdf_processing_failed` - PDF processing failed
- `job_created` - New job created
- `job_completed` - Job finished successfully
- `job_failed` - Job failed
- `download_url_generated` - Download URL created
- `sms_sent` - SMS notification sent
- `sms_failed` - SMS notification failed

### Sample Log Output
```json
{"action":"server_started","timestamp":"2026-04-22T14:09:58.046Z","port":3000}
{"action":"job_created","timestamp":"2026-04-22T14:10:51.841Z","jobId":"job_1776867051841_qfcdb393y"}
{"action":"processing_started","timestamp":"2026-04-22T14:10:51.843Z","key":"uploads/1776867051725-file.pdf","jobId":"job_1776867051841_qfcdb393y"}
{"action":"job_completed","timestamp":"2026-04-22T14:10:52.041Z","jobId":"job_1776867051841_qfcdb393y","outputKey":"processed-uploads/1776867051725-file.pdf"}
{"action":"sms_sent","timestamp":"2026-04-22T14:10:53.304Z","to":"+918799047773","sid":"SM931dbbc794b03113ae7312ddf3c17686"}
```

---

## Production Deployment

### Environment Setup
1. Set proper AWS credentials in production
2. Configure production S3 bucket
3. Set appropriate URL expiration times
4. Enable monitoring and logging
5. Use HTTPS instead of HTTP

### Security Considerations
- Use HTTPS in production
- Implement API key authentication
- Set up proper CORS policies
- Monitor for unusual activity
- Keep Twilio credentials secure

### Scaling
- Stateless design supports horizontal scaling
- Consider Redis for distributed job tracking
- Add load balancer for high availability
- Use production-grade S3 instead of Ministack

---

## Author

**Ankit Prajapati**  
PDF Processing Service with S3 Integration and SMS Notifications

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the server logs for detailed error messages
3. Verify all environment variables are properly set
4. Ensure all services (Docker, Node.js) are running 
