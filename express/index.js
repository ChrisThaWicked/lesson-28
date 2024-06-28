require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Endpoint for user registration
app.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  try {
    // Check if user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: fullName,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });

    // Return success response with token
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare plain text password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user.id }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch all messages
app.get('/messages', authenticateToken, async (req, res) => {
  try {
    // Fetch messages including related User information
    const messages = await prisma.message.findMany({
      include: {
        user: true // Include the related User object
      }
    });
    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to post new message
app.post('/messages', authenticateToken, async (req, res) => {
  const { text } = req.body;
  try {
    // Create message in database
    const message = await prisma.message.create({
      data: {
        text,
        userId: req.user.id,
      },
    });
    res.json(message);
  } catch (error) {
    console.error('Post message error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to delete a message
app.delete('/messages/:id', authenticateToken, async (req, res) => {
  const messageId = req.params.id;
  try {
    // Delete message from database
    await prisma.message.delete({ where: { id: parseInt(messageId) } });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch all quizzes
app.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: true,
      },
    });

    // Check if quizzes array is empty
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ error: 'No quizzes found' });
    }

    res.json(quizzes);
  } catch (error) {
    console.error('Fetch quizzes error:', error.message);
    res.status(500).json({ error: 'An error occurred. Try again later.' });
  }
});

// Endpoint to submit quiz answers
app.post('/submit-answer', authenticateToken, async (req, res) => {
  const { quizId, answer } = req.body;
  if (!quizId || !answer) {
    return res.status(400).json({ error: 'Empty fields.' });
  }

  try {
    // Implement logic to store submitted answers (example)
    // For demonstration purposes, assume answers are stored in database
    // Replace with your own logic based on quiz and answer schema
    // const submittedAnswer = await prisma.answer.create({ data: { quizId, userId: req.user.id, answer } });
    
    res.json({ message: 'Answer submitted successfully.' });
  } catch (error) {
    console.error('Submit answer error:', error.message);
    res.status(500).json({ error: 'An error occurred. Try again later.' });
  }
});

// Start server on port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});