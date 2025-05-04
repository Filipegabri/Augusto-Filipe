// Handle form submission
const mongoose = require('mongoose');
const validator = require('validator');

// MongoDB connection
let conn = null;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined');
    throw new Error('MONGO_URI is not defined');
  }
  if (conn == null) {
    console.log('Connecting to MongoDB...');
    try {
      conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 3000, // Faster timeout
        maxPoolSize: 5,
        retryWrites: true,
        retryReads: true,
      });
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', {
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        uri: MONGO_URI.replace(/:([^@]+)@/, ':<hidden>@'), // Hide password
        stack: error.stack,
      });
      throw new Error('Failed to connect to MongoDB');
    }
  }
  return conn;
};

// Contact schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Serverless function
module.exports = async (req, res) => {
  // CORS headers
  const allowedOrigins = [
    'https://augusto-g-filipe.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate method
  if (req.method !== 'POST') {
    console.log(`Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  console.log('Received request at /api/contact:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Connect to MongoDB
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error.message);
    return res.status(500).json({ error: 'Failed to connect to the database.' });
  }

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    console.log('Error: Missing required fields', { name, email, message });
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!validator.isEmail(email)) {
    console.log('Error: Invalid email:', email);
    return res.status(400).json({ error: 'Invalid email.' });
  }
  if (message.length < 10) {
    console.log('Error: Message too short:', message.length);
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  // Save to MongoDB
  try {
    const newContact = new Contact({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      message: validator.escape(message),
    });
    await newContact.save();
    console.log('Message saved successfully:', newContact);
    return res.status(200).json({ message: 'Message saved successfully!' });
  } catch (error) {
    console.error('Error saving message:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};