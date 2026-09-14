const pedidoModel = require('../models/pedidoModel');

const listarPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoModel.obtenerPedidos();
    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

const obtenerPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidoModel.obtenerPedidoPorId(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

const crearPedido = async (req, res) => {
  try {
    const { usuario_id, items } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'El usuario_id es obligatorio' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un producto en items' });
    }
    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ error: 'Cada item debe tener producto_id y cantidad válidos' });
      }
    }

    const nuevoPedido = await pedidoModel.crearPedidoConItems(usuario_id, items);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    // Errores personalizados que lanzamos desde el modelo
    if (error.customError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error(error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'El usuario especificado no existe' });
    }

    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'pagado', 'enviado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Usa uno de: ${estadosValidos.join(', ')}` });
    }

    const pedidoActualizado = await pedidoModel.actualizarEstadoPedido(id, estado);

    if (!pedidoActualizado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json(pedidoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
  }
};

module.exports = {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarEstadoPedido,
};