require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let db;

async function connectToMongo() {
 if (!client) {
 console.log('Inicializando nova conexão com MongoDB...');
 client = new MongoClient(process.env.MONGO_URI, {
 serverApi: {
 version: ServerApiVersion.v1,
 strict: true,
 deprecationErrors: true,
 },
 });
 await client.connect();
 db = client.db('FormularioDB');
 console.log('Conexão com MongoDB estabelecida.');
 }
 return db;
}

exports.handler = async (event, context) => {
 if (event.httpMethod !== 'POST') {
 return {
 statusCode: 405,
 body: JSON.stringify({ error: 'Method Not Allowed' }),
 headers: {
 'Content-Type': 'application/json',
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'POST',
 },
 };
 }

 let formData;
 try {
 console.log('Corpo da requisição:', event.body);
 formData = JSON.parse(event.body);
 } catch (error) {
 console.error('Erro ao parsear JSON:', error);
 return {
 statusCode: 400,
 body: JSON.stringify({ error: 'Invalid JSON payload' }),
 headers: {
 'Content-Type': 'application/json',
 'Access-Control-Allow-Origin': '*',
 },
 };
 }

 if (!formData.name || !formData.email || !formData.message) {
 return {
 statusCode: 400,
 body: JSON.stringify({ error: 'Missing required fields: name, email, or message' }),
 headers: {
 'Content-Type': 'application/json',
 'Access-Control-Allow-Origin': '*',
 },
 };
 }

 try {
 const db = await connectToMongo();
 const collection = db.collection('contacts');

 const result = await collection.insertOne({
 name: formData.name,
 email: formData.email,
 message: formData.message,
 createdAt: new Date(),
 });

 console.log('Documento inserido:', result.insertedId);
 return {
 statusCode: 200,
 body: JSON.stringify({ message: 'Form submitted successfully', id: result.insertedId }),
 headers: {
 'Content-Type': 'application/json',
 'Access-Control-Allow-Origin': '*',
 },
 };
 } catch (error) {
 console.error('Erro ao salvar no MongoDB:', error);
 return {
 statusCode: 500,
 body: JSON.stringify({ error: 'Failed to save form data: ' + error.message }),
 headers: {
 'Content-Type': 'application/json',
 'Access-Control-Allow-Origin': '*',
 },
 };
 }
};