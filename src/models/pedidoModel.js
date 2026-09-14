const pool = require('../config/db');

const obtenerPedidos = async () => {
  const resultado = await pool.query(
    `SELECT p.*, u.nombre AS usuario_nombre
     FROM pedidos p
     LEFT JOIN usuarios u ON p.usuario_id = u.usuario_id
     ORDER BY p.id DESC`
  );
  return resultado.rows;
};

const obtenerPedidoPorId = async (id) => {
  const pedido = await pool.query(
    `SELECT p.*, u.nombre AS usuario_nombre
     FROM pedidos p
     LEFT JOIN usuarios u ON p.usuario_id = u.usuario_id
     WHERE p.id = $1`,
    [id]
  );

  if (!pedido.rows[0]) return null;

  const items = await pool.query(
    `SELECT pi.*, pr.nombre AS producto_nombre
     FROM pedido_items pi
     LEFT JOIN productos pr ON pi.producto_id = pr.producto_id
     WHERE pi.pedido_id = $1`,
    [id]
  );

  return { ...pedido.rows[0], items: items.rows };
};

// La función clave: crea el pedido completo dentro de una transacción
const crearPedidoConItems = async (usuario_id, items) => {
  // Sacamos un cliente dedicado del pool, para que todos los queries
  // de esta transacción usen la MISMA conexión
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let total = 0;
    const itemsConPrecio = [];

    // 1. Validar stock y precio de cada producto ANTES de insertar nada
    for (const item of items) {
      // FOR UPDATE bloquea la fila para que otra transacción simultánea
      // no pueda leer/modificar este mismo producto hasta que terminemos
      const productoResult = await client.query(
        'SELECT producto_id, precio, stock FROM productos WHERE producto_id = $1 FOR UPDATE',
        [item.producto_id]
      );

      const producto = productoResult.rows[0];

      if (!producto) {
        throw { customError: true, status: 400, message: `El producto ${item.producto_id} no existe` };
      }

      if (producto.stock < item.cantidad) {
        throw {
          customError: true,
          status: 409,
          message: `Stock insuficiente para el producto ${item.producto_id} (disponible: ${producto.stock})`,
        };
      }

      total += producto.precio * item.cantidad;
      itemsConPrecio.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
      });
    }

    // 2. Crear el pedido con el total ya calculado
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (usuario_id, total, estado)
       VALUES ($1, $2, 'pendiente')
       RETURNING *`,
      [usuario_id, total]
    );
    const pedido = pedidoResult.rows[0];

    // 3. Insertar cada item y descontar el stock correspondiente
    for (const item of itemsConPrecio) {
      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.producto_id, item.cantidad, item.precio_unitario]
      );

      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE producto_id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    // 4. Si llegamos aquí, todo salió bien: confirmar de forma permanente
    await client.query('COMMIT');

    return { ...pedido, items: itemsConPrecio };
  } catch (error) {
    // Si algo falló en cualquier punto, deshacer TODO
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Devolver el cliente al pool, sin importar si hubo éxito o error
    client.release();
  }
};

const actualizarEstadoPedido = async (id, estado) => {
  const resultado = await pool.query(
    'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  );
  return resultado.rows[0];
};

module.exports = {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedidoConItems,
  actualizarEstadoPedido,
};