const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const validator = require('validator');
const helmet = require('helmet');
require('dotenv').config();
const path = require('path'); // Adicionado para manipular caminhos

const app = express();
const port = process.env.PORT || 3000;

// Validar variáveis de ambiente
if (!process.env.MONGO_URI) {
  console.error('Erro: MONGO_URI não definido no arquivo .env');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500' }));
app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta public

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// Monitorar conexão com MongoDB
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado!');
});
mongoose.connection.on('error', (err) => {
  console.error('Erro no MongoDB:', err);
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
  console.log('Requisição recebida:', req.body); // Log para depuração
  const { name, email, message } = req.body;

  // Validação
  if (!name || !email || !message) {
    console.log('Erro: Campos obrigatórios ausentes');
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  if (!validator.isEmail(email)) {
    console.log('Erro: E-mail inválido:', email);
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  if (message.length < 10) {
    console.log('Erro: Mensagem curta:', message.length);
    return res.status(400).json({ error: 'A mensagem deve ter pelo menos  подроб: A mensagem deve ter pelo menos 10 caracteres.' });
  }

  try {
    const newContact = new Contact({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      message: validator.escape(message),
    });
    await newContact.save();
    console.log('Mensagem salva:', newContact);
    res.status(200).json({ message: 'Mensagem salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error.message, error.stack);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});