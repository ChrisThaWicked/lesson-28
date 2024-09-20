import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Quizzes from './pages/Quizzes';
import MessageBoard from './components/MessageBoard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const isAuthenticated = !!token;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/quizzes');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/login');
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-semibold mb-8 text-center">Welcome to Quiz App</h1>
        <nav className="mt-4">
          <ul className="flex space-x-4">
            {!isAuthenticated && (
              <li>
                <Link to="/login" className="text-green-600 hover:text-green-800">
                  Login
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/quizzes" className="text-green-600 hover:text-green-800">
                    Quizzes
                  </Link>
                </li>
                <li>
                  <Link to="/messages" className="text-green-600 hover:text-green-800">
                    Message Board
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route 
          path="/quizzes" 
          element={isAuthenticated ? <Quizzes /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/messages" 
          element={isAuthenticated ? <MessageBoard /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/quizzes" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;