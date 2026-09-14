const request = require('supertest');
const app = require('../../app');
const usuarioModel = require('../../models/usuarioModel');
const bcrypt = require('bcrypt');

jest.mock('../../models/usuarioModel');
jest.mock('bcrypt');

describe('Usuario Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /usuarios', () => {
    it('debe devolver la lista de usuarios sin exponer password', async () => {
      const usuariosFalsos = [
        { usuario_id: 1, nombre: 'Ana', email: 'ana@test.com', rol: 'cliente' },
      ];

      usuarioModel.obtenerUsuarios.mockResolvedValue(usuariosFalsos);

      const respuesta = await request(app).get('/usuarios');

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual(usuariosFalsos);
      // Verificación extra: confirmamos que NINGÚN usuario trae password
      respuesta.body.forEach((usuario) => {
        expect(usuario).not.toHaveProperty('password');
      });
    });
  });

  describe('POST /usuarios', () => {
    it('debe crear un usuario, hashear el password y devolver 201', async () => {
      const datosEnviados = {
        nombre: 'Carlos',
        email: 'carlos@test.com',
        password: '123456',
        rol: 'cliente',
      };

      const hashSimulado = '$2b$10$hashFalsoDeEjemplo';
      const usuarioCreado = {
        usuario_id: 5,
        nombre: 'Carlos',
        email: 'carlos@test.com',
        rol: 'cliente',
        created_at: '2026-09-10T00:00:00.000Z',
      };

      // Simulamos que bcrypt.hash devuelve un hash falso, sin calcularlo de verdad
      bcrypt.hash.mockResolvedValue(hashSimulado);
      usuarioModel.crearUsuario.mockResolvedValue(usuarioCreado);

      const respuesta = await request(app)
        .post('/usuarios')
        .send(datosEnviados);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual(usuarioCreado);

      // Verificamos que bcrypt.hash fue llamado con la contraseña ORIGINAL (sin hashear aún)
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);

      // Verificamos que al modelo le llegó el HASH, nunca la contraseña en texto plano
      expect(usuarioModel.crearUsuario).toHaveBeenCalledWith({
        nombre: 'Carlos',
        email: 'carlos@test.com',
        passwordHash: hashSimulado,
        rol: 'cliente',
      });

      // La respuesta al cliente NUNCA debe traer el password
      expect(respuesta.body).not.toHaveProperty('password');
    });

    it('debe devolver 400 si el password tiene menos de 6 caracteres', async () => {
      const respuesta = await request(app)
        .post('/usuarios')
        .send({ nombre: 'Ana', email: 'ana@test.com', password: '123' });

      expect(respuesta.status).toBe(400);
      // bcrypt.hash NUNCA debería llamarse si la validación frena antes
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usuarioModel.crearUsuario).not.toHaveBeenCalled();
    });

    it('debe devolver 400 si el email es inválido', async () => {
      const respuesta = await request(app)
        .post('/usuarios')
        .send({ nombre: 'Ana', email: 'no-es-un-email', password: '123456' });

      expect(respuesta.status).toBe(400);
      expect(usuarioModel.crearUsuario).not.toHaveBeenCalled();
    });

    it('debe devolver 409 si el email ya existe (violación UNIQUE)', async () => {
      const errorDuplicado = new Error('duplicate key');
      errorDuplicado.code = '23505';

      bcrypt.hash.mockResolvedValue('$2b$10$hashFalso');
      usuarioModel.crearUsuario.mockRejectedValue(errorDuplicado);

      const respuesta = await request(app)
        .post('/usuarios')
        .send({ nombre: 'Ana', email: 'ana@test.com', password: '123456' });

      expect(respuesta.status).toBe(409);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('debe devolver 404 si el usuario no existe', async () => {
      usuarioModel.obtenerUsuarioPorId.mockResolvedValue(undefined);

      const respuesta = await request(app).get('/usuarios/999');

      expect(respuesta.status).toBe(404);
    });
  });
});