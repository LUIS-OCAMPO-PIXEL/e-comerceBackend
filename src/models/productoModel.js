const pool = require('../config/db');

const obtenerProductos = async () => {
  const resultado = await pool.query(
    `SELECT p.*, c.nombre AS categoria_nombre
     FROM productos p
     LEFT JOIN categorias c ON p.categoria_id = c.id
     ORDER BY p.producto_id ASC`
  );
  return resultado.rows;
};

const obtenerProductoPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT p.*, c.nombre AS categoria_nombre
     FROM productos p
     LEFT JOIN categorias c ON p.categoria_id = c.id
     WHERE p.producto_id = $1`,
    [id]
  );
  return resultado.rows[0];
};

const crearProducto = async ({ nombre, descripcion, precio, stock, categoria_id, imagen_url }) => {
  const resultado = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nombre, descripcion, precio, stock, categoria_id, imagen_url]
  );
  return resultado.rows[0];
};

const actualizarProducto = async (id, { nombre, descripcion, precio, stock, categoria_id, imagen_url }) => {
  const resultado = await pool.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria_id = $5, imagen_url = $6
     WHERE producto_id = $7
     RETURNING *`,
    [nombre, descripcion, precio, stock, categoria_id, imagen_url, id]
  );
  return resultado.rows[0];
};

const eliminarProducto = async (id) => {
  const resultado = await pool.query(
    'DELETE FROM productos WHERE producto_id = $1 RETURNING *',
    [id]
  );
  return resultado.rows[0];
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};