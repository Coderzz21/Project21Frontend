import React, { useRef, useState } from 'react';
import './FileUpload.css';

function FileUpload({ backendUrl, onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onload = function() {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            onUploadComplete(data);
          }
        } else {
          console.error('Upload failed');
          alert('Upload failed. Please try again.');
        }
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = function() {
        console.error('Upload error');
        alert('Upload error. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', `${backendUrl}/api/upload`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    fileInputRef.current.value = '';
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        hidden
      />
      <button
        type="button"
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="upload-progress">
            <div 
              className="progress-ring"
              style={{ '--progress': uploadProgress }}
            >
              <span>{uploadProgress}%</span>
            </div>
          </div>
        ) : (
          <span className="attach-icon">📎</span>
        )}
      </button>
    </div>
  );
}

export default FileUpload;