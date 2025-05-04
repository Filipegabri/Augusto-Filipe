const mongoose = require('mongoose');
const validator = require('validator');

// Conexão com MongoDB (executada uma vez por instância da função)
let conn = null;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (conn == null) {
    console.log('Conectando ao MongoDB...');
    conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });
    console.log('Conectado ao MongoDB com sucesso!');
  }
  return conn;
};

// Schema do Contato
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Função serverless
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ajuste para domínios específicos em produção
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Lidar com requisições OPTIONS (pré-voo CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar método POST
  if (req.method !== 'POST') {
    console.log(`Método não permitido: ${req.method}`);
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  console.log('Requisição recebida em /api/contact:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Conectar ao MongoDB
  try {
    await connectDB();
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message, error.stack);
    return res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
  }

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

  // Salvar no MongoDB
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