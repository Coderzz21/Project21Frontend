import React, { useState, useEffect } from 'react';
import './UserList.css';

function UserList({ users, onlineUsers, selectedUser, onSelectUser, currentUser, socket }) {
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    if (socket) {
      socket.on('new_message_notification', (message) => {
        if (message.senderId !== currentUser.id && 
            (!selectedUser || message.senderId !== selectedUser.id)) {
          setUnreadMessages(prev => ({
            ...prev,
            [message.senderId]: (prev[message.senderId] || 0) + 1
          }));
        }
      });

      return () => {
        socket.off('new_message_notification');
      };
    }
  }, [socket, currentUser, selectedUser]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setUnreadMessages(prev => ({
      ...prev,
      [user.id]: 0
    }));
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Chats</h3>
      </div>
      <div className="users">
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="user-avatar-container">
              <span className="avatar">{user.avatar}</span>
              {onlineUsers.includes(user.id) && (
                <span className="online-indicator"></span>
              )}
            </div>
            <div className="user-details">
              <span className="name">{user.displayName}</span>
              <span className="status">
                {onlineUsers.includes(user.id) ? 'Online' : 'Offline'}
              </span>
            </div>
            {unreadMessages[user.id] > 0 && (
              <span className="unread-badge">{unreadMessages[user.id]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;