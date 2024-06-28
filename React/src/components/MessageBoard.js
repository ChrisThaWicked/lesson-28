import React, { useState, useEffect, useCallback } from 'react';

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch messages from the server
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
    // Check if token is present in local storage
    const token = localStorage.getItem('token');
    if (!token) {

    } else {
      fetchMessages(); // Fetch messages on component mount
    }
  }, [fetchMessages]);

  // Function to handle form submission (posting a new message)
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
      // Update local state with the new message
      const message = await response.json();
      setMessages([...messages, message]); // Update messages state with the new message
      setNewMessage(''); // Clear the message input after posting
    } catch (error) {
      console.error('Post message error:', error.message);
      setError('Failed to post message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deleting a message
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
      // Update local state to remove the deleted message
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error('Delete message error:', error.message);
      setError('Failed to delete message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-semibold mb-4">Message Board</h1>
      <div className="max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {messages.map(message => (
          <div key={message.id} className="bg-gray-800 p-4 mb-4 rounded">
            <div className="flex justify-between items-center">
              <p className="text-gray-300">{message.user ? message.user.email : 'Anonymous'}</p>
              <button
                className="text-sm text-red-500 hover:text-red-200"
                onClick={() => handleDelete(message.id)}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
            <p className="text-gray-200 mt-2">{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg mt-4">
        <textarea
          rows="4"
          placeholder="Write your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          style={{ color: 'black' }} // Set text color to black
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post Message'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default MessageBoard;