# PDF Processing API Documentation

## Overview

Production-ready PDF processing service with S3 signed URLs, async processing, and job tracking. Built with Node.js, Express, AWS SDK v3, and optimized for scalability.

## Features

- **Direct S3 Upload**: Client uploads directly to S3 using signed URLs
- **Async Processing**: Non-blocking PDF processing with job tracking
- **Scalable Architecture**: Clean separation of concerns with proper error handling
- **Production Ready**: Structured logging, validation, and monitoring
- **PDF Modifications**: Header, footer, and watermark support

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://api.example.com`

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON Spec**: `http://localhost:3000/swagger.json`

## Authentication

Currently no authentication is implemented. API key authentication can be added using the `X-API-Key` header.

## API Endpoints

### 1. Generate Upload URL

Create a presigned URL for direct file upload to S3.

```http
POST /api/upload-url
```

**Request Body:**
```json
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

**Usage:**
1. Call this endpoint to get upload URL
2. Use `PUT` method with the returned URL to upload file directly to S3
3. Set `Content-Type: application/pdf` header

### 2. Start PDF Processing

Begin asynchronous PDF processing with modifications.

```http
POST /api/process
```

**Request Body:**
```json
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

**Optional Fields:**
- `header`: Text added to top of each page (max 200 chars)
- `footer`: Text added to bottom of each page (max 200 chars)
- `watermark`: Diagonal watermark text (max 200 chars)

### 3. Check Job Status

Monitor the progress of PDF processing.

```http
GET /api/job-status?jobId=job_1640995200000_abc123def
```

**Response States:**

**Processing:**
```json
{
  "jobId": "job_1640995200000_abc123def",
  "status": "processing",
  "outputKey": null,
  "error": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "completedAt": null,
  "failedAt": null
}
```

**Completed:**
```json
{
  "jobId": "job_1640995200000_abc123def",
  "status": "done",
  "outputKey": "processed-uploads/1640995200000-document.pdf",
  "error": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "completedAt": "2024-01-01T12:00:05.000Z",
  "failedAt": null
}
```

**Failed:**
```json
{
  "jobId": "job_1640995200000_abc123def",
  "status": "failed",
  "outputKey": null,
  "error": "PDF processing failed: Invalid file format",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "completedAt": null,
  "failedAt": "2024-01-01T12:00:03.000Z"
}
```

### 4. Generate Download URL

Create a presigned URL for downloading processed PDF files.

```http
GET /api/download-url?key=processed-uploads/1640995200000-document.pdf
```

**Response:**
```json
{
  "url": "http://localhost:4566/pdf-bucket/processed-uploads/1640995200000-document.pdf?X-Amz-Algorithm=..."
}
```

## Complete Workflow

### Step 1: Get Upload URL
```bash
curl -X POST http://localhost:3000/api/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pdf","contentType":"application/pdf"}'
```

### Step 2: Upload File to S3
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

### Step 4: Check Status
```bash
curl "http://localhost:3000/api/job-status?jobId=job_1640995200000_abc123def"
```

### Step 5: Download Processed File
```bash
curl "http://localhost:3000/api/download-url?key=processed-uploads/1640995200000-test.pdf"
```

## Error Handling

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": ["filename is required", "contentType must be application/pdf"]
}
```

### File Not Found (404)
```json
{
  "error": "File not found"
}
```

### Server Errors (500)
```json
{
  "error": "Storage service unavailable"
}
```

## Rate Limits & Expiration

- **Upload URLs**: Expire in 5 minutes (300 seconds)
- **Download URLs**: Expire in 1 hour (3600 seconds)
- **Jobs**: Auto-cleanup after 1 hour

## Environment Variables

```bash
# Server Configuration
PORT=3000

# AWS S3 Configuration
AWS_REGION=us-east-1
S3_BUCKET=pdf-bucket
AWS_ENDPOINT=http://localhost:4566

# URL Expiration (seconds)
UPLOAD_URL_EXPIRY=300
DOWNLOAD_URL_EXPIRY=3600
```

## Monitoring & Logging

### Structured Logs
```json
{"action":"upload_url_generated","timestamp":"2024-01-01T12:00:00.000Z","key":"uploads/1640995200000-test.pdf"}
{"action":"processing_started","timestamp":"2024-01-01T12:00:00.000Z","key":"uploads/1640995200000-test.pdf","jobId":"job_1640995200000_abc123def"}
{"action":"pdf_processing_completed","timestamp":"2024-01-01T12:00:05.000Z","inputKey":"uploads/1640995200000-test.pdf","outputKey":"processed-uploads/1640995200000-test.pdf"}
```

### Log Actions
- `upload_url_generated`: Upload URL created
- `upload_url_requested`: Upload URL requested
- `processing_started`: PDF processing initiated
- `pdf_processing_completed`: PDF processing finished
- `pdf_processing_failed`: PDF processing failed
- `job_created`: New job created
- `job_completed`: Job finished successfully
- `job_failed`: Job failed
- `download_url_generated`: Download URL created

## Performance Considerations

### Memory Usage
- Stream-to-buffer conversion optimized for large files
- Jobs auto-cleanup to prevent memory leaks
- Efficient S3 operations with proper error handling

### Scalability
- Stateless design supports horizontal scaling
- Async processing prevents blocking
- Job tracking system handles concurrent operations

### Security
- Signed URLs prevent direct S3 access
- Input validation prevents injection attacks
- Error messages don't expose sensitive information

## Postman Collection

Import the following collection for easy testing:

```json
{
  "info": {
    "name": "PDF Processing API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Upload URL",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"filename\":\"test.pdf\",\"contentType\":\"application/pdf\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/upload-url",
          "host": ["{{baseUrl}}"],
          "path": ["api", "upload-url"]
        }
      }
    },
    {
      "name": "Process PDF",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"key\":\"uploads/1640995200000-test.pdf\",\"header\":\"CONFIDENTIAL\",\"footer\":\"Company Name\",\"watermark\":\"DRAFT\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/process",
          "host": ["{{baseUrl}}"],
          "path": ["api", "process"]
        }
      }
    },
    {
      "name": "Check Job Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/job-status?jobId={{jobId}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "job-status"],
          "query": [
            {
              "key": "jobId",
              "value": "{{jobId}}"
            }
          ]
        }
      }
    },
    {
      "name": "Get Download URL",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/download-url?key={{outputKey}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "download-url"],
          "query": [
            {
              "key": "key",
              "value": "{{outputKey}}"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "jobId",
      "value": ""
    },
    {
      "key": "outputKey",
      "value": ""
    }
  ]
}
```

## Support

For API support and questions:
- **Documentation**: `http://localhost:3000/api-docs`
- **Issues**: Create GitHub issue
- **Email**: support@example.com
