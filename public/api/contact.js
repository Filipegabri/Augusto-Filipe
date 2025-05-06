const { MongoClient, ServerApiVersion } = require('mongodb');
const validator = require('validator');

// Configuração do MongoDB
let client = null;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('Erro: MONGO_URI não definido');
    throw new Error('MONGO_URI não definido');
  }
  if (!client) {
    console.log('Conectando ao MongoDB...');
    try {
      client = new MongoClient(MONGO_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 3000, // Timeout curto para Vercel
        maxPoolSize: 5,
      });
      await client.connect();
      console.log('Conectado ao MongoDB com sucesso!');
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', {
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        uri: MONGO_URI.replace(/:([^@]+)@/, ':<hidden>@'),
      });
      throw new Error('Falha ao conectar ao banco de dados');
    }
  }
  return client;
};

// Função serverless
module.exports = async (req, res) => {
  // Configurar cabeçalhos CORS
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

  // Lidar com requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validar método
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
  let dbClient;
  try {
    dbClient = await connectDB();
  } catch (error) {
    console.error('Erro de conexão com o banco de dados:', error.message);
    return res.status(500).json({ error: 'Falha ao conectar ao banco de dados.' });
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
    const db = dbClient.db('FormularioDB'); // Nome do banco
    const collection = db.collection('contacts'); // Nome da coleção
    const newContact = {
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      message: validator.escape(message),
      createdAt: new Date(),
    };
    await collection.insertOne(newContact);
    console.log('Mensagem salva com sucesso:', newContact);
    return res.status(200).json({ message: 'Mensagem salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error.message, error.stack);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};