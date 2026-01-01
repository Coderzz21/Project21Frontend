import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import EmojiPickerComponent from './EmojiPickerComponent';
import FileUpload from './FileUpload';
import ImageModal from './ImageModal';
import { formatDateIST } from '../utils/timeUtils';
import './Chat.css';

function Chat({ socket, currentUser, selectedUser, onlineUsers, backendUrl, onBack, isMobileView }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/messages/${currentUser.id}/${selectedUser.id}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [backendUrl, currentUser.id, selectedUser.id]);

  // Join chat room and listen for messages
  useEffect(() => {
    if (socket) {
      socket.emit('join_chat', {
        senderId: currentUser.id,
        receiverId: selectedUser.id
      });

      socket.on('receive_message', (message) => {
        if (
          (message.senderId === currentUser.id && message.receiverId === selectedUser.id) ||
          (message.senderId === selectedUser.id && message.receiverId === currentUser.id)
        ) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      });

      socket.on('user_typing', ({ senderId, isTyping }) => {
        if (senderId === selectedUser.id) {
          setPeerTyping(isTyping);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
      };
    }
  }, [socket, currentUser.id, selectedUser.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        isTyping: false
      });
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: newMessage.trim(),
      type: 'text'
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    socket.emit('typing', {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      isTyping: false
    });
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileUpload = (fileData) => {
    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: fileData.url,
      type: fileData.fileType,
      fileName: fileData.fileName
    };

    socket.emit('send_message', messageData);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDateIST(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="chat">
      {/* Chat Header */}
      <div className="chat-header">
        {isMobileView && (
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <div className="chat-user-info">
          <span className="chat-avatar">{selectedUser.avatar}</span>
          <div className="chat-user-details">
            <span className="chat-username">{selectedUser.displayName}</span>
            <span className="chat-status">
              {peerTyping 
                ? 'typing...' 
                : onlineUsers.includes(selectedUser.id) 
                  ? 'online' 
                  : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-separator">
              <span>{date}</span>
            </div>
            {msgs.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser.id}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <div className="input-actions">
          <EmojiPickerComponent
            showPicker={showEmojiPicker}
            setShowPicker={setShowEmojiPicker}
            onEmojiClick={handleEmojiClick}
          />
          <FileUpload backendUrl={backendUrl} onUploadComplete={handleFileUpload} />
        </div>
        <form onSubmit={sendMessage} className="message-form">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message"
            className="message-input"
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
            </svg>
          </button>
        </form>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default Chat;