// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    handleLogout();
  };

  return (
    <nav className="bg-gray-800 p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-white text-xl font-semibold">
            Home
          </Link>
        </div>
        <div>
          {isAuthenticated ? (
            <ul className="flex space-x-4">
              <li>
                <Link to="/quizzes" className="text-white hover:text-gray-300">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-white hover:text-gray-300">
                  Message Board
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="text-white hover:text-gray-300"
                >
                  Log Out
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4">
              <li>
                <Link to="/login" className="text-white hover:text-gray-300">
                  Login
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;