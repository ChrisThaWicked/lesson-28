import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Quizzes from './pages/Quizzes';
import MessageBoard from './components/MessageBoard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token on logout
    setToken('');
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-semibold mb-8 text-center">Welcome to Quiz App</h1>
        {/* Login component rendered outside Routes for simplicity */}
        <Login setToken={setToken} />
        <nav className="mt-4">
          <ul className="flex space-x-4">
            <li><Link to="/login" className="text-green-600 hover:text-green-800">Login</Link></li>
            <li><Link to="/quizzes" className="text-green-600 hover:text-green-800">Quizzes</Link></li>
            <li><Link to="/messages" className="text-green-600 hover:text-green-800">Message Board</Link></li>
          </ul>
        </nav>
      </div>
      <Routes>
        {/* Route for Login */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        
        {/* Route for Quizzes - only accessible if authenticated */}
        <Route path="/quizzes" element={isAuthenticated ? <Quizzes /> : <Navigate to="/login" />} />
        
        {/* Route for Message Board - only accessible if authenticated */}
        <Route path="/messages" element={isAuthenticated ? <MessageBoard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;