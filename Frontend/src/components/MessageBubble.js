import React from 'react';
import { formatTimeIST } from '../utils/timeUtils';
import './MessageBubble.css';

function MessageBubble({ message, isOwn, onImageClick }) {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="media-content">
            <img
              src={message.content}
              alt="Shared"
              className="message-image"
              onClick={() => onImageClick(message.content)}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="media-content">
            <video
              src={message.content}
              controls
              className="message-video"
              preload="metadata"
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="file-content">
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
              download
            >
              <span className="file-icon">📄</span>
              <span className="file-name">{message.fileName || 'Download File'}</span>
            </a>
          </div>
        );
      
      default:
        return <p className="message-text">{message.content}</p>;
    }
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="bubble-content">
        {renderContent()}
        <span className="message-time">{formatTimeIST(message.timestamp)}</span>
      </div>
    </div>
  );
}

export default MessageBubble;