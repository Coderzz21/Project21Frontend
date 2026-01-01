import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('user_online', currentUser.id);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      // Fetch all users and auto-select the other user
      fetch(`${BACKEND_URL}/api/users`)
        .then(res => res.json())
        .then(data => {
          const otherUsers = data.filter(u => u.id !== currentUser.id);
          if (otherUsers.length > 0) {
            setSelectedUser(otherUsers[0]); // Auto-select the first (and only) other user
          }
        })
        .catch(err => console.error('Error fetching users:', err));

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setCurrentUser(null);
    setSelectedUser(null);
    setSocket(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} backendUrl={BACKEND_URL} />;
  }

  if (!selectedUser) {
    return (
      <div className="app">
        <div className="loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        {/* Chat Area - Full Width */}
        <div className="chat-area full-width">
          <Chat
            socket={socket}
            currentUser={currentUser}
            selectedUser={selectedUser}
            onlineUsers={onlineUsers}
            backendUrl={BACKEND_URL}
            onBack={() => {}} // No-op since no back functionality
            isMobileView={isMobileView}
          />
        </div>
      </div>
    </div>
  );
}

export default App;