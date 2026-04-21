// lambda/renderUI.js
// Lambda-style function to render dynamic HTML UI


exports.handler = async (event) => {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Processing Service</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .form-section {
            padding: 40px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        }
        
        .file-input-wrapper {
            position: relative;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f9fafb;
        }
        
        .file-input-wrapper:hover {
            border-color: #4f46e5;
            background: #f3f4f6;
        }
        
        .file-input-wrapper.has-file {
            border-color: #10b981;
            background: #ecfdf5;
        }
        
        .file-input {
            display: none;
        }
        
        .file-icon {
            font-size: 48px;
            margin-bottom: 10px;
            color: #9ca3af;
        }
        
        .file-text {
            color: #6b7280;
            font-size: 14px;
        }
        
        .file-name {
            color: #10b981;
            font-weight: 500;
            margin-top: 10px;
        }
        
        .text-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .text-input:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .text-input::placeholder {
            color: #9ca3af;
        }
        
        .button {
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }
        
        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .status-section {
            padding: 0 40px 40px;
        }
        
        .status-card {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            display: none;
        }
        
        .status-card.active {
            display: block;
        }
        
        .status-card.uploading {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }
        
        .status-card.processing {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
        }
        
        .status-card.ready {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
        }
        
        .status-card.error {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
        }
        
        .status-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-icon {
            font-size: 20px;
        }
        
        .status-message {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .download-link {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .download-link:hover {
            background: #059669;
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 3px;
        }
        
        .error-details {
            margin-top: 10px;
            padding: 10px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PDF Processing Service</h1>
            <p>Upload your PDF and add custom header, footer, and watermark</p>
        </div>
        
        <div class="form-section">
            <form id="pdfForm">
                <div class="form-group">
                    <label for="pdfFile">Select PDF File</label>
                    <div class="file-input-wrapper" id="fileWrapper">
                        <input type="file" id="pdfFile" class="file-input" accept=".pdf">
                        <div class="file-icon">PDF</div>
                        <div class="file-text">Click to select PDF file or drag and drop</div>
                        <div class="file-name" id="fileName"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="header">Header Text (Optional)</label>
                    <input type="text" id="header" class="text-input" placeholder="e.g., CONFIDENTIAL" maxlength="200">
                </div>
                
                <div class="form-group">
                    <label for="footer">Footer Text (Optional)</label>
                    <input type="text" id="footer" class="text-input" placeholder="e.g., Company Name" maxlength="200">
                </div>
                
                <div class="form-group">
                    <label for="watermark">Watermark Text (Optional)</label>
                    <input type="text" id="watermark" class="text-input" placeholder="e.g., DRAFT" maxlength="200">
                </div>
                
                <button type="submit" class="button" id="submitBtn">Upload & Process PDF</button>
            </form>
        </div>
        
        <div class="status-section">
            <div class="status-card" id="uploadStatus">
                <div class="status-title">
                    <span class="status-icon">Upload</span>
                    Uploading File
                </div>
                <div class="status-message">Your file is being uploaded to secure storage...</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="uploadProgress"></div>
                </div>
            </div>
            
            <div class="status-card" id="processingStatus">
                <div class="status-title">
                    <span class="status-icon">Processing</span>
                    Processing PDF
                </div>
                <div class="status-message">Your PDF is being processed with the specified modifications...</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="processingProgress"></div>
                </div>
            </div>
            
            <div class="status-card" id="readyStatus">
                <div class="status-title">
                    <span class="status-icon">Ready</span>
                    Processing Complete
                </div>
                <div class="status-message">Your PDF has been processed successfully!</div>
                <a href="#" class="download-link" id="downloadLink" download>Download Processed PDF</a>
            </div>
            
            <div class="status-card" id="errorStatus">
                <div class="status-title">
                    <span class="status-icon">Error</span>
                    Processing Failed
                </div>
                <div class="status-message" id="errorMessage">An error occurred during processing.</div>
                <div class="error-details" id="errorDetails"></div>
            </div>
        </div>
    </div>

    <script>
        class PDFProcessor {
            constructor() {
                this.currentFile = null;
                this.uploadKey = null;
                this.jobId = null;
                this.statusCheckInterval = null;
                
                this.initializeEventListeners();
            }
            
            initializeEventListeners() {
                // File input
                const fileInput = document.getElementById('pdfFile');
                const fileWrapper = document.getElementById('fileWrapper');
                
                fileWrapper.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', (e) => {
                    this.handleFileSelect(e.target.files[0]);
                });
                
                // Drag and drop
                fileWrapper.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    fileWrapper.style.borderColor = '#4f46e5';
                    fileWrapper.style.background = '#f3f4f6';
                });
                
                fileWrapper.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    fileWrapper.style.borderColor = '#d1d5db';
                    fileWrapper.style.background = '#f9fafb';
                });
                
                fileWrapper.addEventListener('drop', (e) => {
                    e.preventDefault();
                    fileWrapper.style.borderColor = '#d1d5db';
                    fileWrapper.style.background = '#f9fafb';
                    
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === 'application/pdf') {
                        this.handleFileSelect(file);
                    }
                });
                
                // Form submission
                document.getElementById('pdfForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processPDF();
                });
            }
            
            handleFileSelect(file) {
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    this.showError('Please select a valid PDF file.');
                    return;
                }
                
                this.currentFile = file;
                
                // Update UI
                const fileWrapper = document.getElementById('fileWrapper');
                const fileName = document.getElementById('fileName');
                const fileText = document.querySelector('.file-text');
                
                fileWrapper.classList.add('has-file');
                fileName.textContent = file.name;
                fileText.textContent = 'Click to select different file';
            }
            
            async processPDF() {
                if (!this.currentFile) {
                    this.showError('Please select a PDF file first.');
                    return;
                }
                
                try {
                    // Reset UI and poll counter
                    this.hideAllStatus();
                    this.disableForm();
                    this.pollCount = 0;
                    
                    // Step 1: Get upload URL
                    this.showStatus('uploadStatus');
                    this.updateProgress('uploadProgress', 0);
                    
                    const uploadResponse = await this.fetchAPI('/api/upload-url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            filename: this.currentFile.name,
                            contentType: this.currentFile.type
                        })
                    });
                    
                    if (!uploadResponse.ok) {
                        throw new Error('Failed to get upload URL');
                    }
                    
                    const uploadData = await uploadResponse.json();
                    this.uploadKey = uploadData.key;
                    
                    // Step 2: Upload file to S3
                    this.updateProgress('uploadProgress', 25);
                    
                    const uploadResponseS3 = await fetch(uploadData.url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': this.currentFile.type
                        },
                        body: this.currentFile
                    });
                    
                    if (!uploadResponseS3.ok) {
                        throw new Error('Failed to upload file to storage');
                    }
                    
                    this.updateProgress('uploadProgress', 50);
                    
                    // Step 3: Start processing
                    this.hideStatus('uploadStatus');
                    this.showStatus('processingStatus');
                    this.updateProgress('processingProgress', 0);
                    
                    const header = document.getElementById('header').value.trim();
                    const footer = document.getElementById('footer').value.trim();
                    const watermark = document.getElementById('watermark').value.trim();
                    
                    const processResponse = await this.fetchAPI('/api/process', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            key: this.uploadKey,
                            header: header || undefined,
                            footer: footer || undefined,
                            watermark: watermark || undefined
                        })
                    });
                    
                    if (!processResponse.ok) {
                        throw new Error('Failed to start PDF processing');
                    }
                    
                    const processData = await processResponse.json();
                    this.jobId = processData.jobId;
                    
                    this.updateProgress('processingProgress', 25);
                    
                    // Step 4: Check job status
                    await this.checkJobStatus();
                    
                } catch (error) {
                    console.error('Processing error:', error);
                    this.showError(error.message || 'An unexpected error occurred.');
                    this.enableForm();
                }
            }
            
            async checkJobStatus() {
                if (!this.jobId) return;
                
                try {
                    const response = await this.fetchAPI('/api/job-status?jobId=' + this.jobId);
                    
                    if (!response.ok) {
                        throw new Error('Failed to check job status');
                    }
                    
                    const jobData = await response.json();
                    
                    this.updateProgress('processingProgress', 50);
                    
                    if (jobData.status === 'processing') {
                        // Continue checking with exponential backoff (3-5 seconds)
                        const delay = Math.min(3000 + (this.pollCount || 0) * 500, 5000);
                        this.pollCount = (this.pollCount || 0) + 1;
                        setTimeout(() => this.checkJobStatus(), delay);
                    } else if (jobData.status === 'done') {
                        this.updateProgress('processingProgress', 100);
                        await this.handleProcessingComplete(jobData.outputKey);
                    } else if (jobData.status === 'failed') {
                        throw new Error(jobData.error || 'Processing failed');
                    }
                    
                } catch (error) {
                    this.showError(error.message || 'Failed to check processing status.');
                    this.enableForm();
                }
            }
            
            async handleProcessingComplete(outputKey) {
                try {
                    this.hideStatus('processingStatus');
                    this.showStatus('readyStatus');
                    
                    // Get download URL
                    const response = await this.fetchAPI('/api/download-url?key=' + outputKey);
                    
                    if (!response.ok) {
                        throw new Error('Failed to get download URL');
                    }
                    
                    const downloadData = await response.json();
                    
                    // Set download link
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = downloadData.url;
                    downloadLink.download = outputKey.split('/').pop();
                    
                    this.enableForm();
                    
                } catch (error) {
                    this.showError(error.message || 'Failed to prepare download.');
                    this.enableForm();
                }
            }
            
            async fetchAPI(url, options = {}) {
                try {
                    const response = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers
                        }
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || 'HTTP ' + response.status + ': ' + response.statusText);
                    }
                    
                    return response;
                } catch (error) {
                    if (error.name === 'TypeError' && error.message.includes('fetch')) {
                        throw new Error('Network error. Please check your connection.');
                    }
                    throw error;
                }
            }
            
            showStatus(statusId) {
                document.getElementById(statusId).classList.add('active');
            }
            
            hideStatus(statusId) {
                document.getElementById(statusId).classList.remove('active');
            }
            
            hideAllStatus() {
                ['uploadStatus', 'processingStatus', 'readyStatus', 'errorStatus'].forEach(id => {
                    this.hideStatus(id);
                });
            }
            
            updateProgress(progressId, percentage) {
                document.getElementById(progressId).style.width = percentage + '%';
            }
            
            showError(message, details = null) {
                this.hideAllStatus();
                this.showStatus('errorStatus');
                
                document.getElementById('errorMessage').textContent = message;
                
                if (details) {
                    const errorDetails = document.getElementById('errorDetails');
                    errorDetails.textContent = details;
                    errorDetails.style.display = 'block';
                } else {
                    document.getElementById('errorDetails').style.display = 'none';
                }
            }
            
            disableForm() {
                document.getElementById('submitBtn').disabled = true;
                document.getElementById('pdfFile').disabled = true;
            }
            
            enableForm() {
                document.getElementById('submitBtn').disabled = false;
                document.getElementById('pdfFile').disabled = false;
            }
        }
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            new PDFProcessor();
        });
    </script>
</body>
</html>`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: html
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: `
<!DOCTYPE html>
<html>
<head>
    <title>Error - PDF Processing Service</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="error">
        <h1>Service Unavailable</h1>
        <p>The PDF processing service is temporarily unavailable. Please try again later.</p>
    </div>
</body>
</html>`
    };
  }
};
