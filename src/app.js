const express = require('express');
const cors = require('cors'); 

const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/categorias', categoriaRoutes);
app.use('/productos', productoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/pedidos', pedidoRoutes);

module.exports = app;