const pool = require('../../config/db');
const { crearPedidoConItems } = require('../pedidoModel');

jest.mock('../../config/db');

describe('pedidoModel - crearPedidoConItems (transacción)', () => {
  let mockClient;

  beforeEach(() => {
    // Simulamos el objeto "client" que normalmente devuelve pool.connect()
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear el pedido, insertar items, descontar stock y hacer COMMIT', async () => {
    const productosDB = {
      1: { producto_id: 1, precio: 45000, stock: 10 },
      2: { producto_id: 2, precio: 35000, stock: 5 },
    };

    // En vez de responder siempre lo mismo, inspeccionamos QUÉ query se está ejecutando
    mockClient.query.mockImplementation((sql, params) => {
      if (sql === 'BEGIN' || sql === 'COMMIT') return Promise.resolve();
      if (sql.includes('FOR UPDATE')) {
        const producto = productosDB[params[0]];
        return Promise.resolve({ rows: producto ? [producto] : [] });
      }
      if (sql.includes('INSERT INTO pedidos')) {
        return Promise.resolve({
          rows: [{ id: 100, usuario_id: params[0], total: params[1], estado: 'pendiente' }],
        });
      }
      return Promise.resolve({ rows: [] }); // INSERT pedido_items, UPDATE productos
    });

    const items = [
      { producto_id: 1, cantidad: 2 },
      { producto_id: 2, cantidad: 1 },
    ];

    const resultado = await crearPedidoConItems(1, items);

    expect(resultado.id).toBe(100);
    expect(resultado.total).toBe(2 * 45000 + 1 * 35000); // 125000
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.query).not.toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledTimes(1); // siempre se libera
  });

  it('debe hacer ROLLBACK y no descontar stock si la cantidad supera el disponible', async () => {
    const productosDB = {
      1: { producto_id: 1, precio: 45000, stock: 1 }, // solo hay 1 disponible
    };

    mockClient.query.mockImplementation((sql, params) => {
      if (sql === 'BEGIN' || sql === 'ROLLBACK') return Promise.resolve();
      if (sql.includes('FOR UPDATE')) {
        const producto = productosDB[params[0]];
        return Promise.resolve({ rows: producto ? [producto] : [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const items = [{ producto_id: 1, cantidad: 5 }]; // pide más de lo que hay

    await expect(crearPedidoConItems(1, items)).rejects.toMatchObject({
      customError: true,
      status: 409,
    });

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    // Confirma que NUNCA se llegó a insertar el pedido
    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO pedidos'),
      expect.anything()
    );
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('debe hacer ROLLBACK si el producto no existe', async () => {
    mockClient.query.mockImplementation((sql) => {
      if (sql === 'BEGIN' || sql === 'ROLLBACK') return Promise.resolve();
      if (sql.includes('FOR UPDATE')) return Promise.resolve({ rows: [] }); // no encontrado
      return Promise.resolve({ rows: [] });
    });

    const items = [{ producto_id: 999, cantidad: 1 }];

    await expect(crearPedidoConItems(1, items)).rejects.toMatchObject({
      customError: true,
      status: 400,
    });

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('debe liberar el cliente incluso si ocurre un error inesperado de la base de datos', async () => {
    mockClient.query.mockImplementation((sql) => {
      if (sql === 'BEGIN') return Promise.resolve();
      if (sql.includes('FOR UPDATE')) return Promise.reject(new Error('Conexión perdida'));
      return Promise.resolve({ rows: [] });
    });

    const items = [{ producto_id: 1, cantidad: 1 }];

    await expect(crearPedidoConItems(1, items)).rejects.toThrow('Conexión perdida');

    // Este es el punto más importante del test: pase lo que pase, release() se llama
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});