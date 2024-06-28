import React, { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from './ConfirmationModal';

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await fetch('http://localhost:4000/messages', {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error.message);
      setError('Failed to fetch messages. Please try again.');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMessages();
    }
  }, [fetchMessages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await fetch('http://localhost:4000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ text: newMessage }),
      });
      if (!response.ok) {
        throw new Error('Failed to post message');
      }
      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Post message error:', error.message);
      setError('Failed to post message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await fetch(`http://localhost:4000/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error('Delete message error:', error.message);
      setError('Failed to delete message. Please try again.');
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const confirmDelete = (id) => {
    setMessageToDelete(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setMessageToDelete(null);
  };

  const confirmModal = () => {
    if (messageToDelete) {
      handleDelete(messageToDelete);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-semibold mb-6 text-center text-white">Message Board</h1>
        <div className="max-w-lg mx-auto">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {messages.map(message => (
            <div key={message.id} className="bg-gray-700 p-4 mb-4 rounded">
              <div className="flex justify-between items-center">
                <p className="text-gray-300">{message.user ? message.user.email : 'Anonymous'}</p>
                <button
                  className="text-sm text-red-500 hover:text-red-200"
                  onClick={() => confirmDelete(message.id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-200 mt-2">{message.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <textarea
            rows="4"
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className={`bg-green-500 text-white py-2 px-4 rounded w-full hover:bg-green-600 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Posting...' : 'Post Message'}
          </button>
        </form>
        <ConfirmationModal
          show={showModal}
          onClose={closeModal}
          onConfirm={confirmModal}
        />
      </div>
    </div>
  );
};

export default MessageBoard;