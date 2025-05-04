const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const validator = require('validator');
const helmet = require('helmet');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error('Erro: MONGO_URI não definido no arquivo .env');
  process.exit(1);
}

if (!process.env.MONGO_URI.startsWith('mongodb+srv://') && !process.env.MONGO_URI.startsWith('mongodb://')) {
  console.error('Erro: MONGO_URI inválida. Deve começar com "mongodb+srv://" ou "mongodb://"');
  process.exit(1);
}

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Middleware to set JSON content type
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'https://augusto-g-filipe.onrender.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(helmet());
app.use(bodyParser.json({ limit: '10kb' }));

// MongoDB connection
mongoose.set('debug', true);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true,
})
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message, err.stack);
    process.exit(1);
  });

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado!');
});
mongoose.connection.on('error', (err) => {
  console.error('Erro no MongoDB:', err.message, err.stack);
});

// Contact schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  console.log('Requisição recebida em /api/health');
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
    res.status(200).json({
      server: 'Online',
      mongodb: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na rota /api/health:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao verificar status do servidor.' });
  }
});

// Contact endpoint
app.post('/contact', async (req, res) => {
  console.log('Requisição recebida em /contact:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

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
});

// Serve index.html for the root
app.get('/', (req, res) => {
  console.log('Servindo index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Static files (after API routes)
app.use((req, res, next) => {
  console.log('Verificando arquivos estáticos:', req.url);
  express.static(path.join(__dirname, 'public'))(req, res, next);
});

// 404 handler
app.use((req, res) => {
  console.log('Rota não encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro global:', err.message, err.stack);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Start server after MongoDB connection
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});