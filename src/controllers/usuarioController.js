const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');

const SALT_ROUNDS = 10;

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.obtenerUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioModel.obtenerUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Hashear la contraseña ANTES de guardarla
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const nuevoUsuario = await usuarioModel.crearUsuario({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      rol,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    const usuarioActualizado = await usuarioModel.actualizarUsuario(id, { nombre, email, rol });

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioEliminado = await usuarioModel.eliminarUsuario(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario eliminado', usuario: usuarioEliminado });
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar: el usuario tiene pedidos asociados' });
    }

    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};