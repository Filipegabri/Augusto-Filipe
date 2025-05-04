const mongoose = require('mongoose');
const validator = require('validator');

// MongoDB connection (reused across function invocations)
let conn = null;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (conn == null) {
    console.log('Conectando ao MongoDB...');
    try {
      conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true,
      });
      console.log('Conectado ao MongoDB com sucesso!');
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error.message);
      throw error;
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://augusto-g-filipe.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate method
  if (req.method !== 'POST') {
    console.log(`Método não permitido: ${req.method}`);
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  console.log('Requisição recebida em /api/contact:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Connect to MongoDB
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
  }

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    console.log('Erro: Campos obrigatórios ausentes', { name, email, message });
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  if (!validator.isEmail(email)) {
    console.log('Erro: E-mail inválido:', email);
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  if (message.length < 10) {
    console.log('Erro: Mensagem curta:', message.length);
    return res.status(400).json({ error: 'A mensagem deve ter pelo menos 10 caracteres.' });
  }

  // Save to MongoDB
  try {
    const newContact = new Contact({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      message: validator.escape(message),
    });
    await newContact.save();
    console.log('Mensagem salva com sucesso:', newContact);
    return res.status(200).json({ message: 'Mensagem salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error.message, error.stack);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};