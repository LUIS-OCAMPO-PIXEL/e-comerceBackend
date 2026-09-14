const categoriaModel = require('../models/categoriaModel');

// GET /categorias
const listarCategorias = async (req, res) => {
  try {
    const categorias = await categoriaModel.obtenerCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

// GET /categorias/:id
const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await categoriaModel.obtenerCategoriaPorId(id);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};

// POST /categorias
const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación de negocio: aquí, no en el modelo
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const nuevaCategoria = await categoriaModel.crearCategoria(nombre.trim());
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error(error);

    // Si la BD rechaza por nombre duplicado (UNIQUE), Postgres manda code '23505'
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// PUT /categorias/:id
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const categoriaActualizada = await categoriaModel.actualizarCategoria(id, nombre.trim());

    if (!categoriaActualizada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json(categoriaActualizada);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

// DELETE /categorias/:id
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaEliminada = await categoriaModel.eliminarCategoria(id);

    if (!categoriaEliminada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({ mensaje: 'Categoría eliminada', categoria: categoriaEliminada });
  } catch (error) {
    console.error(error);

    // Si tiene productos asociados, la FK con ON DELETE RESTRICT lo bloquea (code '23503')
    if (error.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar: tiene productos asociados' });
    }

    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};