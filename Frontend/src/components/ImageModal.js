import React from 'react';
import './ImageModal.css';

function ImageModal({ imageUrl, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-modal-overlay" onClick={handleBackdropClick}>
      <div className="image-modal-content">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <img src={imageUrl} alt="Full size" className="modal-image" />
      </div>
    </div>
  );
}

export default ImageModal;