import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql';
import {} from 'dotenv/config';
import {addClient, getClients} from './client-operations.js';
import { validationClient } from './validation/client-validation.js';

String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  jwt.verify(token, process.env.jwt_secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token no válido.' });
    next();
  });
};

const connection = mysql.createConnection({
    host: process.env.mysql_host,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database,
    port: process.env.mysql_port
});

connection.connect((err) => {
    if(err)  throw err;
    console.log("Conectado a base datos");
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (process.env.jwt_username !== username) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    const hash = process.env.jwt_password.hashCode();  
    if (hash !== password) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }
    const token = jwt.sign(
      { username },
      process.env.jwt_secret,
      { expiresIn: '1h' }
    );
    
    return res.status(200).json({ token });
  });

app.get('/clients/get', authenticateJWT, (req, filters, res) => {
    res.send({
        users:[]
    });
});

app.get('/clients/getAll', authenticateJWT, (req, res) => {
    getClients(connection, (result) => {res.json(result)});
});

app.post('/clients/add', authenticateJWT, validationClient(), (req, res) => {
    const newClient = req.body
    addClient(connection, newClient, (result) => {res.json(result)});
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});

