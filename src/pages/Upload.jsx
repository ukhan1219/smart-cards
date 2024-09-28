import React from 'react';
import axios from 'axios';
import { useState } from 'react';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('Upload successful!');
      console.log('Upload response:', response.data);
    } catch (error) {
      setUploadStatus('Upload failed. Check connection.');
      console.error('Upload error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="upload-container">
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px' }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={!selectedFile}>
        Upload Image
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};



export default Upload;