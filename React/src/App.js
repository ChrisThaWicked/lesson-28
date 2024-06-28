import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import MessageBoard from './components/MessageBoard';

const App = () => {
  const [token, setToken] = useState(null);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Registration />} />
        <Route
          path="/messages"
          element={token ? <MessageBoard token={token} /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;