const request = require('supertest');
const app = require('../../app');
const productoModel = require('../../models/productoModel');

jest.mock('../../models/productoModel');

describe('Producto Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /productos', () => {
    it('debe devolver la lista de productos con status 200', async () => {
      // 1. Define un array falso de productos
      const productosFalsos =[
  
  {
    id: 1,
    nombre: "Mouse inalámbrico",
    descripcion: "Mouse óptico inalámbrico, 2.4GHz, USB",
    precio: 45000.00,
    stock: 17,
    imagen_url: "https://ejemplo.com/mouse.jpg",
    created_at: "2026-09-03T01:57:36.601Z",
    categoria: "Tecnología"
  },
  {
    id: 2,
    nombre: "Teclado mecánico",
    descripcion: "Teclado mecánico switches azules, retroiluminado RGB",
    precio: 189000.00,
    stock: 12,
    imagen_url: "https://ejemplo.com/teclado.jpg",
    created_at: "2026-09-03T01:58:10.204Z",
    categoria: "Tecnología"
  },
  {
    id: 3,
    nombre: "Monitor 24 pulgadas",
    descripcion: "Monitor Full HD 24\", panel IPS, 75Hz",
    precio: 620000.00,
    stock: 8,
    imagen_url: "https://ejemplo.com/monitor.jpg",
    created_at: "2026-09-03T01:59:02.117Z",
    categoria: "Tecnología"
  },
  {
    id: 4,
    nombre: "Audífonos Bluetooth",
    descripcion: "Audífonos over-ear con cancelación de ruido activa",
    precio: 250000.00,
    stock: 20,
    imagen_url: "https://ejemplo.com/audifonos.jpg",
    created_at: "2026-09-03T02:00:45.331Z",
    categoria: "Tecnología"
  },
  {
    id: 5,
    nombre: "Webcam Full HD",
    descripcion: "Cámara web 1080p con micrófono integrado",
    precio: 98000.00,
    stock: 25,
    imagen_url: "https://ejemplo.com/webcam.jpg",
    created_at: "2026-09-03T02:01:23.884Z",
    categoria: "Tecnología"
  },
  {
    id: 6,
    nombre: "Disco duro externo 1TB",
    descripcion: "Disco duro portátil USB 3.0, 1TB de almacenamiento",
    precio: 175000.00,
    stock: 15,
    imagen_url: "https://ejemplo.com/disco.jpg",
    created_at: "2026-09-03T02:02:58.502Z",
    categoria: "Tecnología"
  },
  {
    id: 7,
    nombre: "Memoria USB 64GB",
    descripcion: "Memoria USB 3.1 de alta velocidad, 64GB",
    precio: 32000.00,
    stock: 40,
    imagen_url: "https://ejemplo.com/usb.jpg",
    created_at: "2026-09-03T02:03:40.019Z",
    categoria: "Tecnología"
  },
  {
    id: 8,
    nombre: "Cargador rápido USB-C",
    descripcion: "Cargador de pared 30W, carga rápida USB-C",
    precio: 55000.00,
    stock: 30,
    imagen_url: "https://ejemplo.com/cargador.jpg",
    created_at: "2026-09-03T02:04:15.276Z",
    categoria: "Tecnología"
  },
  {
    id: 9,
    nombre: "Tablet 10 pulgadas",
    descripcion: "Tablet Android, pantalla 10\", 64GB, WiFi",
    precio: 780000.00,
    stock: 6,
    imagen_url: "https://ejemplo.com/tablet.jpg",
    created_at: "2026-09-03T02:05:52.640Z",
    categoria: "Tecnología"
  },
  {
    id: 10,
    nombre: "Altavoz Bluetooth portátil",
    descripcion: "Parlante inalámbrico resistente al agua, 12h de batería",
    precio: 145000.00,
    stock: 18,
    imagen_url: "https://ejemplo.com/altavoz.jpg",
    created_at: "2026-09-03T02:06:37.918Z",
    categoria: "Tecnología"
  }

]
      // 2. productoModel.obtenerProductos.mockResolvedValue(...)
     productoModel.obtenerProductos.mockResolvedValue(productosFalsos);
     // 3. Haz la petición con request(app).get('/productos')
    const respuesta = await request(app).get('/productos');
    // 4. Verifica status 200 y que el body coincida

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual(productosFalsos);
      expect(productoModel.obtenerProductos).toHaveBeenCalledTimes(1);

    });
  });

  describe('POST /productos', () => {
    it('debe crear un producto y devolver status 201',async () => {
      // Similar al de categorías, pero con más campos (nombre, precio, stock, categoria_id)
                
            const productoEnviado={
          nombre: "Altavoz Bluetooth portátil",
          descripcion: "Parlante inalámbrico resistente al agua, 12h de batería",
          precio: 145000.00,
          stock: 18,
          imagen_url: "https://ejemplo.com/altavoz.jpg",
          categoria_id: 1
            }
            const productoCreado = {
                  producto_id: 1,
                  ...productoEnviado,
                  imagen_url: null,
            };
            productoModel.crearProducto.mockResolvedValue(productoCreado)
            const respuesta = await request(app)
              .post('/productos')
              .send( productoEnviado );

           expect(respuesta.status).toBe(201);
          expect(respuesta.body).toEqual(productoCreado);
          expect(productoModel.crearProducto).toHaveBeenCalledWith({
            nombre: 'Altavoz Bluetooth portátil',
            descripcion: 'Parlante inalámbrico resistente al agua, 12h de batería',
            precio: 145000.00,
            stock: 18,
            imagen_url: "https://ejemplo.com/altavoz.jpg",
            categoria_id: 1,
          });
    });

    it('debe devolver 400 si el precio es negativo', async() => {
      // Aquí no necesitas mockear nada exitoso, porque la validación
      // debe frenar ANTES de llamar al modelo
      
      const respuesta = await request(app)
        .post('/productos')
        .send({ nombre: 'Teclado mecánico', precio: -100, categoria_id: 1 });

      expect(respuesta.status).toBe(400);
      // El modelo NUNCA debería haberse llamado, porque la validación lo frena antes
      expect(productoModel.crearProducto).not.toHaveBeenCalled();
    
    });

    it('debe devolver 400 si la categoría no existe (error 23503)',async () => {
      // Pista: mockRejectedValue con un error que tenga error.code = '23503'
      const errorNoCategoria = new Error('not exist');
            errorNoCategoria.code = '23503';
            productoModel.crearProducto.mockRejectedValue(errorNoCategoria);
            const respuesta = await request(app)
        .post('/productos')
        .send({  nombre: 'Teclado mecánico', precio: 189000.00, categoria_id: 999 });

      expect(respuesta.status).toBe(400);
    });
  });

  describe('GET /productos/:id', () => {
    it('debe devolver 404 si el producto no existe', async() => {
      // Pista: mockResolvedValue(undefined)
      productoModel.obtenerProductoPorId.mockResolvedValue    (undefined);

           const respuesta = await request(app).get('/productos/999');

           expect(respuesta.status).toBe(404);
         });
  });
});