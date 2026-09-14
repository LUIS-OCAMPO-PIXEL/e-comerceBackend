const productoModel = require('../models/productoModel');

const listarProductos = async (req, res) => {
  try {
    const productos = await productoModel.obtenerProductos();
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoModel.obtenerProductoPorId(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria_id, imagen_url } = req.body;

    // Validaciones de negocio
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (precio === undefined || precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a 0' });
    }
    if (!categoria_id) {
      return res.status(400).json({ error: 'La categoría es obligatoria' });
    }

    const nuevoProducto = await productoModel.crearProducto({
      nombre: nombre.trim(),
      descripcion,
      precio,
      stock: stock || 0,
      categoria_id,
      imagen_url,
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);

    // Código 23503 = viola foreign key → la categoría no existe
    if (error.code === '23503') {
      return res.status(400).json({ error: 'La categoría especificada no existe' });
    }

    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id, imagen_url } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (precio === undefined || precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a 0' });
    }

    const productoActualizado = await productoModel.actualizarProducto(id, {
      nombre: nombre.trim(),
      descripcion,
      precio,
      stock,
      categoria_id,
      imagen_url,
    });

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'La categoría especificada no existe' });
    }

    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await productoModel.eliminarProducto(id);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado', producto: productoEliminado });
  } catch (error) {
    console.error(error);

    // Si el producto ya está referenciado en pedido_items (ON DELETE RESTRICT)
    if (error.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar: el producto tiene pedidos asociados' });
    }

    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};