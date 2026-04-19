# PDF Watermark with Ministack

## Overview

This project demonstrates a backend service for processing PDF files using a production-style architecture. Users can upload a PDF and apply dynamic modifications such as header, footer, and watermark.

The system uses a local AWS simulation (Ministack) to store and process files.

---

## Features

* Upload PDF via API
* Add dynamic header, footer, and watermark
* Store files in S3 (Ministack)
* Process files using a Lambda-style handler
* Download processed PDF via API

---

## Architecture

Client → Express API → S3 (Ministack) → Lambda Handler → S3 → Download API

---

## Tech Stack

* Node.js (Express)
* pdf-lib
* AWS SDK (S3)
* Ministack (local AWS simulation)
* Multer (file upload)

---

## Setup

### 1. Clone repository

git clone <your-repo-link>

cd pdf-watermark-ministack

---

### 2. Install dependencies

npm install

---

### 3. Start Ministack (Docker)

docker run -d -p 4566:4566 --name ministack ministackorg/ministack

---

### 4. Create S3 bucket (via script)

node createBucket.js

---

### 5. Start server

npm run start

---

## API Endpoints

### Upload & Process PDF

POST /upload

Form-data:

* file (PDF)
* header (optional)
* footer (optional)
* watermark (optional)

Response:
{
"output": "processed-uploads/file.pdf"
}

---

### Download Processed PDF

GET /download?key=processed-uploads/file.pdf

---

## Notes

* Lambda is simulated locally by invoking the handler function
* In real AWS, S3 events would automatically trigger Lambda
* Ministack is used to emulate S3 behavior

---

## Future Improvements

* Add async processing using queue
* Add presigned URL for upload/download
* Add validation and error handling
* Support custom font, position, and styling

---

## Author

Ankit Prajapati
