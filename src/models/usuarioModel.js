const pool = require('../config/db');

const obtenerUsuarios = async () => {
  // Nunca devolvemos la columna password, ni siquiera hasheada
  const resultado = await pool.query(
    'SELECT usuario_id, nombre, email, rol, created_at FROM usuarios ORDER BY usuario_id ASC'
  );
  return resultado.rows;
};

const obtenerUsuarioPorId = async (id) => {
  const resultado = await pool.query(
    'SELECT usuario_id, nombre, email, rol, created_at FROM usuarios WHERE usuario_id = $1',
    [id]
  );
  return resultado.rows[0];
};

// Este sí trae el password (hasheado), solo se usa internamente para login
const obtenerUsuarioPorEmail = async (email) => {
  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );
  return resultado.rows[0];
};

const crearUsuario = async ({ nombre, email, passwordHash, rol }) => {
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING usuario_id, nombre, email, rol, created_at`,
    [nombre, email, passwordHash, rol || 'cliente']
  );
  return resultado.rows[0];
};

const actualizarUsuario = async (id, { nombre, email, rol }) => {
  const resultado = await pool.query(
    `UPDATE usuarios SET nombre = $1, email = $2, rol = $3
     WHERE usuario_id = $4
     RETURNING usuario_id, nombre, email, rol, created_at`,
    [nombre, email, rol, id]
  );
  return resultado.rows[0];
};

const eliminarUsuario = async (id) => {
  const resultado = await pool.query(
    'DELETE FROM usuarios WHERE usuario_id = $1 RETURNING usuario_id, nombre, email',
    [id]
  );
  return resultado.rows[0];
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorEmail,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};