require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// require('dotenv').config();
// const express = require('express');
// const pool = require('./src/config/db');
// const categoriaRoutes = require('./src/routes/categoriaRoutes');

// const app = express();
// app.use(express.json()); // permite que Express lea JSON del body de las peticiones

// app.get('/health', async (req, res) => {
//   try {
//     await pool.query('SELECT 1');
//     res.json({ status: 'ok', db: 'connected' });
//   } catch (error) {
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// });

// Todas las rutas de categoriaRoutes quedan "montadas" bajo /categorias
// app.use('/categorias', categoriaRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });
// const productoRoutes = require('./src/routes/productoRoutes'); // junto al require de categoriasRoutes

// app.use('/productos', productoRoutes); // junto al app.use de categorias
// const usuarioRoutes = require('./src/routes/usuarioRoutes');

// app.use('/usuarios', usuarioRoutes);
// const pedidoRoutes = require('./src/routes/pedidoRoutes');
// app.use('/pedidos', pedidoRoutes);