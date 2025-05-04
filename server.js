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

// Validar variáveis de ambiente
if (!process.env.MONGO_URI) {
  console.error('Erro: MONGO_URI não definido no arquivo .env');
  process.exit(1);
}

// Middleware para garantir respostas JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Configuração de CORS para múltiplos origens
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
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com MongoDB
mongoose.set('debug', true); // Logs de depuração
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
})
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message, err.stack);
    process.exit(1);
  });

// Monitorar conexão com MongoDB
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado!');
});
mongoose.connection.on('error', (err) => {
  console.error('Erro no MongoDB:', err.message, err.stack);
});

// Schema do Contato
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Rota para a raiz (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Contato
app.post('/contact', async (req, res) => {
  console.log('Requisição recebida em /contact:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  const { name, email, message } = req.body;

  // Validação
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

// Middleware para tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('Erro global:', err.message, err.stack);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Iniciar servidor apenas após conexão com MongoDB
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});