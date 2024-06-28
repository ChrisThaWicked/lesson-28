/*require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const prisma = new PrismaClient();
const port = 4000;

app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).send({ error: "No token provided." });

    jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
        if (error) return res.status(401).send({ error: "Invalid token." });
        req.userId = decoded.userId;
        next();
    });
};

// Endpoint to get secret-sauce for authenticated users
app.get('/secret-sauce', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).send({ error: "User not found." });
        
        res.send({ secretSauce: "Smiling more.", email: user.email });
    } catch (error) {
        res.status(500).send({ error: "An error occurred." });
    }
});

// Endpoint to register a new user
app.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) return res.status(400).send({ error: "Empty fields." });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, fullName }
        });
        res.send({ success: `Account created with ${user.email}` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred. Try again later." });
    }
});

// Endpoint to login a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ error: "Empty fields." });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).send({ error: "Account with that email doesn't exist." });

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return res.status(401).send({ error: "Invalid password." });

        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.send({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred. Try again later." });
    }
});

// Start the server
app.listen(port, () => console.log("Server running on port", port));*/

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

// Start server on port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});