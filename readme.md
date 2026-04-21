# PDF Processing API - Production Ready
 
## Overview
 
A production-ready PDF processing service with S3 signed URLs, asynchronous processing, and job tracking. Built with Node.js, Express, AWS SDK v3, and optimized for scalability and performance.
 
This system demonstrates real-world backend architecture with clean separation of concerns, proper error handling, and comprehensive API documentation.
 
---
 
## Features
 
### Core Functionality
- **Direct S3 Upload**: Client uploads directly to S3 using signed URLs (no backend storage)
- **Async Processing**: Non-blocking PDF processing with real-time job tracking
- **PDF Modifications**: Header, footer, and watermark support with pdf-lib
- **Production Architecture**: Clean separation of concerns with proper error handling
 
### Production Features
- **Signed URLs**: Secure, time-limited upload/download URLs
- **Job Tracking**: In-memory job status monitoring with auto-cleanup
- **Structured Logging**: JSON logs with action tracking
- **Input Validation**: Centralized validation with detailed error messages
- **API Documentation**: Interactive Swagger UI with comprehensive docs
- **Error Handling**: Specific AWS error mapping and proper HTTP status codes
 
---
 
## Architecture
 
```
Client
  POST /api/upload-url
     GET signed URL
  PUT <signed-url>
     Direct upload to S3
  POST /api/process
     Async processing starts
  GET /api/job-status
     Check processing status
  GET /api/download-url
     Get download URL
```
 
### System Components
 
- **Controllers**: Thin HTTP handlers
- **Services**: Business logic and external integrations
- **Utils**: Reusable helpers (validation, logging)
- **Middleware**: Request validation and error handling
- **Lambda**: PDF processing with pdf-lib
 
---
 
## Tech Stack
 
### Backend
- **Node.js** (Express 5.x)
- **AWS SDK v3** (S3, S3 Request Presigner)
- **pdf-lib** (PDF manipulation)
- **dotenv** (Environment configuration)
 
### Development Tools
- **Swagger UI** (Interactive API documentation)
- **Ministack** (Local AWS S3 simulation)
- **Structured JSON logging**
 
### Dependencies
```json
{
  "express": "^5.2.1",
  "@aws-sdk/client-s3": "^3.1032.0",
  "@aws-sdk/s3-request-presigner": "^3.1032.0",
  "pdf-lib": "^1.17.1",
  "swagger-ui-express": "^5.0.0",
  "dotenv": "^16.0.0"
}
```
 
---
 
## Quick Start
 
### Prerequisites
- Node.js 18+
- Docker (for Ministack)
- Git
 
### 1. Clone Repository
 
```bash
git clone <your-repo-link>
cd pdf-lamda
```
 
### 2. Install Dependencies
 
```bash
npm install
```
 
### 3. Environment Setup
 
```bash
cp .env.example .env
# Edit .env with your configuration
```
 
### 4. Start Ministack (Docker)
 
```bash
docker run -d -p 4566:4566 --name ministack ministackorg/ministack
```
 
### 5. Create S3 Bucket
 
```bash
node createBucket.js
```
 
### 6. Start Server
 
```bash
npm start
```
 
### 7. Access Documentation
 
Open your browser and navigate to:
- **API Documentation**: http://localhost:3000/api-docs
- **Interactive Testing**: http://localhost:3000 (redirects to docs)
 
---
 
## API Endpoints
 
### Upload Operations
 
#### Generate Upload URL
```http
POST /api/upload-url
Content-Type: application/json
 
{
  "filename": "document.pdf",
  "contentType": "application/pdf"
}
```
 
**Response:**
```json
{
  "url": "http://localhost:4566/pdf-bucket/uploads/1640995200000-document.pdf?X-Amz-Algorithm=...",
  "key": "uploads/1640995200000-document.pdf"
}
```
 
### Processing Operations
 
#### Start PDF Processing
```http
POST /api/process
Content-Type: application/json
 
{
  "key": "uploads/1640995200000-document.pdf",
  "header": "CONFIDENTIAL",
  "footer": "Company Name",
  "watermark": "DRAFT"
}
```
 
**Response:**
```json
{
  "message": "Processing started",
  "jobId": "job_1640995200000_abc123def"
}
```
 
#### Check Job Status
```http
GET /api/job-status?jobId=job_1640995200000_abc123def
```
 
**Response States:**
- `processing`: Job is running
- `done`: Job completed successfully
- `failed`: Job failed with error
 
### Download Operations
 
#### Generate Download URL
```http
GET /api/download-url?key=processed-uploads/1640995200000-document.pdf
```
 
**Response:**
```json
{
  "url": "http://localhost:4566/pdf-bucket/processed-uploads/1640995200000-document.pdf?X-Amz-Algorithm=..."
}
```
 
---
 
## Complete Workflow Example
 
### Step 1: Get Upload URL
```bash
curl -X POST http://localhost:3000/api/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pdf","contentType":"application/pdf"}'
```
 
### Step 2: Upload File Directly to S3
```bash
curl -X PUT "http://localhost:4566/pdf-bucket/uploads/1640995200000-test.pdf?X-Amz-Algorithm=..." \
  -H "Content-Type: application/pdf" \
  --data-binary @test.pdf
```
 
### Step 3: Start Processing
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"key":"uploads/1640995200000-test.pdf","header":"CONFIDENTIAL","footer":"My Company","watermark":"DRAFT"}'
```
 
### Step 4: Check Processing Status
```bash
curl "http://localhost:3000/api/job-status?jobId=job_1640995200000_abc123def"
```
 
### Step 5: Download Processed File
```bash
curl "http://localhost:3000/api/download-url?key=processed-uploads/1640995200000-test.pdf"
```
 
---
 
## Environment Variables
 
```bash
# Server Configuration
PORT=3000
 
# AWS S3 Configuration
AWS_REGION=us-east-1
S3_BUCKET=pdf-bucket
AWS_ENDPOINT=http://localhost:4566
 
# URL Expiration (seconds)
UPLOAD_URL_EXPIRY=300      # 5 minutes
DOWNLOAD_URL_EXPIRY=3600   # 1 hour
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
   errorService.js         # Error handling and mapping
 
 middleware/
   validation.js           # Request validation middleware
 
 utils/
   validator.js            # Validation utilities
   logger.js               # Structured logging
 
 lambda/
   processPdf.js           # PDF processing logic
 
 routes/
   signedUrlRoutes.js      # API route definitions
 
 swagger.json              # OpenAPI specification
 API_DOCUMENTATION.md      # Detailed API guide
```
 
---
 
## Performance & Scalability
 
### Optimizations Implemented
- **Stream Handling**: Efficient S3 stream-to-buffer conversion
- **Memory Management**: Job auto-cleanup prevents memory leaks
- **Async Processing**: Non-blocking operations prevent server bottlenecks
- **Input Validation**: Centralized validation reduces code duplication
- **Error Handling**: Specific error mapping for better debugging
 
### Rate Limits & Security
- **Upload URLs**: 5-minute expiration
- **Download URLs**: 1-hour expiration
- **Job Cleanup**: Auto-removal after 1 hour
- **Input Validation**: Prevents injection attacks
- **Signed URLs**: Secure direct S3 access
 
---
 
## Monitoring & Logging
 
### Structured Logs
```json
{"action":"upload_url_generated","timestamp":"2024-01-01T12:00:00.000Z","key":"uploads/1640995200000-test.pdf"}
{"action":"processing_started","timestamp":"2024-01-01T12:00:00.000Z","key":"uploads/1640995200000-test.pdf","jobId":"job_1640995200000_abc123def"}
{"action":"pdf_processing_completed","timestamp":"2024-01-01T12:00:05.000Z","inputKey":"uploads/1640995200000-test.pdf","outputKey":"processed-uploads/1640995200000-test.pdf"}
```
 
### Available Actions
- `upload_url_generated` - Upload URL created
- `processing_started` - PDF processing initiated
- `pdf_processing_completed` - PDF processing finished
- `pdf_processing_failed` - PDF processing failed
- `job_created` - New job created
- `job_completed` - Job finished successfully
- `job_failed` - Job failed
- `download_url_generated` - Download URL created
 
---
 
## Error Handling
 
### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": ["filename is required", "contentType must be application/pdf"]
}
```
 
### AWS Service Errors
- **503**: Storage service unavailable (NoSuchBucket)
- **404**: File not found (NoSuchKey)
- **403**: Access denied
- **500**: Internal server error
 
### Processing Errors
- **400**: Invalid file format
- **500**: PDF processing failed
 
---
 
## Development
 
### Testing with Postman
Import the provided Postman collection from `API_DOCUMENTATION.md` for easy testing.
 
### Local Development
```bash
# Start with debug logs
DEBUG=true npm start
 
# Suppress logs for clean output
quiet=true npm start
```
 
### API Documentation
- **Interactive**: http://localhost:3000/api-docs
- **JSON Spec**: http://localhost:3000/swagger.json
- **Detailed Guide**: `API_DOCUMENTATION.md`
 
---
 
## Production Deployment
 
### Environment Setup
1. Set proper AWS credentials
2. Configure production S3 bucket
3. Set appropriate URL expiration times
4. Enable monitoring and logging
 
### Security Considerations
- Use HTTPS in production
- Implement API key authentication
- Set up proper CORS policies
- Monitor for unusual activity
 
### Scaling
- Stateless design supports horizontal scaling
- Consider Redis for distributed job tracking
- Add load balancer for high availability
 
---
 
## Contributing
 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
 
---
 
## License
 
MIT License - see LICENSE file for details
 
---
 
## Author
 
**Ankit Prajapati**
- GitHub: [Your GitHub Profile]
- Email: [Your Email]
 
---
 
## Acknowledgments
 
- **AWS SDK v3** for S3 operations
- **pdf-lib** for PDF manipulation
- **Express** for web framework
- **Swagger** for API documentation


C