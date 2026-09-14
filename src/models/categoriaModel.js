const pool = require('../config/db');

// Obtener todas las categorías
const obtenerCategorias = async () => {
  const resultado = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
  return resultado.rows;
};

// Obtener una categoría por su id
const obtenerCategoriaPorId = async (id) => {
  const resultado = await pool.query(
    'SELECT * FROM categorias WHERE id = $1',
    [id]
  );
  return resultado.rows[0]; // undefined si no existe
};

// Crear una nueva categoría
const crearCategoria = async (nombre) => {
  const resultado = await pool.query(
    'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
    [nombre]
  );
  return resultado.rows[0];
};

// Actualizar una categoría existente
const actualizarCategoria = async (id, nombre) => {
  const resultado = await pool.query(
    'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
    [nombre, id]
  );
  return resultado.rows[0]; // undefined si el id no existía
};

// Eliminar una categoría
const eliminarCategoria = async (id) => {
  const resultado = await pool.query(
    'DELETE FROM categorias WHERE id = $1 RETURNING *',
    [id]
  );
  return resultado.rows[0]; // undefined si el id no existía
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};