const request = require('supertest');
const app = require('../../app');
const categoriaModel = require('../../models/categoriaModel');

// Le decimos a Jest: "reemplaza todo el módulo categoriaModel por versiones falsas"
jest.mock('../../models/categoriaModel');

describe('Categoria Controller', () => {
  // Limpia el historial de llamadas de los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /categorias', () => {
    it('debe devolver la lista de categorías con status 200', async () => {
      const categoriasFalsas = [
        { id: 2, nombre: 'Electrónica' },
        { id: 3, nombre: 'Ropa' },
      ];

      // Le decimos al mock: "cuando te llamen, responde con esto"
      categoriaModel.obtenerCategorias.mockResolvedValue(categoriasFalsas);

      const respuesta = await request(app).get('/categorias');

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual(categoriasFalsas);
      expect(categoriaModel.obtenerCategorias).toHaveBeenCalledTimes(1);
    });

    it('debe devolver status 500 si el modelo lanza un error', async () => {
      categoriaModel.obtenerCategorias.mockRejectedValue(new Error('DB caída'));

      const respuesta = await request(app).get('/categorias');

      expect(respuesta.status).toBe(500);
      expect(respuesta.body).toHaveProperty('error');
    });
  });

  describe('POST /categorias', () => {
    it('debe crear una categoría y devolver status 201', async () => {
      const nuevaCategoria = { id: 3, nombre: 'Hogar' };
      categoriaModel.crearCategoria.mockResolvedValue(nuevaCategoria);

      const respuesta = await request(app)
        .post('/categorias')
        .send({ nombre: 'Hogar' });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual(nuevaCategoria);
      expect(categoriaModel.crearCategoria).toHaveBeenCalledWith('Hogar');
    });

    it('debe devolver status 400 si el nombre viene vacío', async () => {
      const respuesta = await request(app)
        .post('/categorias')
        .send({ nombre: '' });

      expect(respuesta.status).toBe(400);
      // El modelo NUNCA debería haberse llamado, porque la validación lo frena antes
      expect(categoriaModel.crearCategoria).not.toHaveBeenCalled();
    });

    it('debe devolver status 409 si el nombre ya existe (violación UNIQUE)', async () => {
      const errorDuplicado = new Error('duplicate key');
      errorDuplicado.code = '23505';
      categoriaModel.crearCategoria.mockRejectedValue(errorDuplicado);

      const respuesta = await request(app)
        .post('/categorias')
        .send({ nombre: 'Electrónica' });

      expect(respuesta.status).toBe(409);
    });
  });

  describe('GET /categorias/:id', () => {
    it('debe devolver 404 si la categoría no existe', async () => {
      categoriaModel.obtenerCategoriaPorId.mockResolvedValue(undefined);

      const respuesta = await request(app).get('/categorias/999');

      expect(respuesta.status).toBe(404);
    });
  });
});