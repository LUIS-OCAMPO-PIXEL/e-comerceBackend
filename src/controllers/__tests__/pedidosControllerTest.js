const request = require('supertest');
const app = require('../../app');
const pedidoModel = require('../../models/pedidoModel');

jest.mock('../../models/pedidoModel');

describe('Pedido Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /pedidos', () => {
    it('debe crear un pedido y devolver status 201', async () => {
      const pedidoCreado = {
        id: 1,
        usuario_id: 1,
        total: 125000,
        estado: 'pendiente',
        items: [{ producto_id: 1, cantidad: 2, precio_unitario: 45000 }],
      };

      pedidoModel.crearPedidoConItems.mockResolvedValue(pedidoCreado);

      const respuesta = await request(app)
        .post('/pedidos')
        .send({ usuario_id: 1, items: [{ producto_id: 1, cantidad: 2 }] });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual(pedidoCreado);
    });

    it('debe devolver 400 si items viene vacío', async () => {
      const respuesta = await request(app)
        .post('/pedidos')
        .send({ usuario_id: 1, items: [] });

      expect(respuesta.status).toBe(400);
      expect(pedidoModel.crearPedidoConItems).not.toHaveBeenCalled();
    });

    it('debe devolver 400 si algún item no tiene cantidad válida', async () => {
      const respuesta = await request(app)
        .post('/pedidos')
        .send({ usuario_id: 1, items: [{ producto_id: 1, cantidad: 0 }] });

      expect(respuesta.status).toBe(400);
      expect(pedidoModel.crearPedidoConItems).not.toHaveBeenCalled();
    });

    it('debe devolver 409 si el modelo lanza error de stock insuficiente', async () => {
      const errorStock = { customError: true, status: 409, message: 'Stock insuficiente para el producto 1' };
      pedidoModel.crearPedidoConItems.mockRejectedValue(errorStock);

      const respuesta = await request(app)
        .post('/pedidos')
        .send({ usuario_id: 1, items: [{ producto_id: 1, cantidad: 999 }] });

      expect(respuesta.status).toBe(409);
      expect(respuesta.body.error).toBe('Stock insuficiente para el producto 1');
    });
  });

  describe('PUT /pedidos/:id/estado', () => {
    it('debe devolver 400 si el estado no es válido', async () => {
      const respuesta = await request(app)
        .put('/pedidos/1/estado')
        .send({ estado: 'volando' });

      expect(respuesta.status).toBe(400);
      expect(pedidoModel.actualizarEstadoPedido).not.toHaveBeenCalled();
    });

    it('debe actualizar el estado y devolver 200', async () => {
      const pedidoActualizado = { id: 1, estado: 'pagado' };
      pedidoModel.actualizarEstadoPedido.mockResolvedValue(pedidoActualizado);

      const respuesta = await request(app)
        .put('/pedidos/1/estado')
        .send({ estado: 'pagado' });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual(pedidoActualizado);
    });
  });
});