# Ecommerce Backend

API REST completa para una plataforma de ecommerce, construida con Node.js, Express y PostgreSQL, siguiendo arquitectura en capas, con manejo de transacciones, autenticación segura y suite de pruebas automatizadas.

## Características principales

- CRUD completo de categorías, productos, usuarios y pedidos
- Autenticación con contraseñas hasheadas (bcrypt)
- Creación de pedidos mediante **transacciones reales**: valida stock, calcula totales, descuenta inventario y revierte todo (`ROLLBACK`) si algo falla — con bloqueo de fila (`FOR UPDATE`) para evitar condiciones de carrera en compras simultáneas
- Arquitectura en capas (Model → Controller → Route) siguiendo el principio de responsabilidad única
- Validaciones de negocio y manejo de errores específicos de PostgreSQL (violación de llaves únicas y foráneas)
- 27 pruebas automatizadas con Jest, incluyendo mocks de base de datos, de librerías externas (bcrypt) y de transacciones completas
- Contenedores Docker con Docker Compose (backend + PostgreSQL) para levantar el proyecto completo con un solo comando
- Frontend en React (Vite) consumiendo la API: catálogo de productos, carrito de compras, autenticación y checkout

## Stack tecnológico

**Backend:** Node.js, Express, PostgreSQL, bcrypt, Jest + Supertest
**Frontend:** React, Vite, React Router, Axios, Context API
**Infraestructura:** Docker, Docker Compose

## Arquitectura

El backend sigue una separación en 3 capas:

```
Cliente (Postman / React)
        ↓
     Routes        → define qué URL y método HTTP dispara qué función
        ↓
   Controllers     → valida datos, maneja errores, arma la respuesta HTTP
        ↓
     Models        → ejecuta las consultas SQL contra PostgreSQL
```

Cada entidad (`categoria`, `producto`, `usuario`, `pedido`) tiene su propio archivo en cada capa, manteniendo el código aislado y fácil de testear.

### Modelo de datos

5 tablas relacionadas: `usuarios`, `categorias`, `productos`, `pedidos`, `pedido_items`.

- `productos.categoria_id → categorias.id`
- `pedidos.usuario_id → usuarios.usuario_id`
- `pedido_items.pedido_id → pedidos.id`
- `pedido_items.producto_id → productos.producto_id`

El script completo de creación está en [`ecommerce_schema.sql`](./ecommerce_schema.sql).

## Instalación

### Opción 1 — Con Docker (recomendada)

Requiere tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

```bash
git clone <url-del-repositorio>
cd ecomerce-backend
docker compose up --build
```

Esto levanta el backend en `http://localhost:3000` y PostgreSQL en el puerto `5433`, con las 5 tablas ya creadas automáticamente.

### Opción 2 — Instalación local

Requiere Node.js 20+ y PostgreSQL instalados localmente.

```bash
git clone <url-del-repositorio>
cd ecomerce-backend
npm install
```

Crea un archivo `.env` en la raíz con:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
```

Crea la base de datos y ejecuta el script `ecommerce_schema.sql` en PostgreSQL (por ejemplo, desde pgAdmin o `psql`).

```bash
npm run dev
```

## Ejecutar las pruebas

```bash
npm test
```

27 pruebas cubriendo controladores (categorías, productos, usuarios, pedidos) y el modelo de pedidos con su lógica de transacción (commit, rollback, condiciones de carrera).

## Endpoints de la API

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias` | Lista todas las categorías |
| GET | `/categorias/:id` | Obtiene una categoría por id |
| POST | `/categorias` | Crea una categoría |
| PUT | `/categorias/:id` | Actualiza una categoría |
| DELETE | `/categorias/:id` | Elimina una categoría |

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Lista todos los productos (con nombre de categoría) |
| GET | `/productos/:id` | Obtiene un producto por id |
| POST | `/productos` | Crea un producto |
| PUT | `/productos/:id` | Actualiza un producto |
| DELETE | `/productos/:id` | Elimina un producto |

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Lista todos los usuarios (sin exponer password) |
| GET | `/usuarios/:id` | Obtiene un usuario por id |
| POST | `/usuarios` | Registra un usuario nuevo |
| POST | `/usuarios/login` | Inicia sesión (email + password) |
| PUT | `/usuarios/:id` | Actualiza un usuario |
| DELETE | `/usuarios/:id` | Elimina un usuario |

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/pedidos` | Lista todos los pedidos |
| GET | `/pedidos/:id` | Obtiene un pedido con sus items |
| POST | `/pedidos` | Crea un pedido (transacción: valida stock, calcula total, descuenta inventario) |
| PUT | `/pedidos/:id/estado` | Actualiza el estado del pedido (`pendiente`, `pagado`, `enviado`, `cancelado`) |

**Ejemplo de creación de pedido:**

```json
POST /pedidos

{
  "usuario_id": 1,
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}
```

## Estructura del proyecto

```
ecomerce-backend/
├── src/
│   ├── config/          # Conexión a PostgreSQL
│   ├── models/          # Consultas SQL por entidad
│   ├── controllers/     # Lógica de negocio y validaciones
│   │   └── __tests__/   # Pruebas de controllers
│   ├── routes/          # Definición de endpoints
│   └── app.js           # Configuración de Express
├── index.js             # Punto de entrada del servidor
├── Dockerfile
├── docker-compose.yml
├── ecommerce_schema.sql
└── package.json
```

## Decisiones técnicas destacadas

- **Transacciones con `pool.connect()`**: la creación de pedidos usa una conexión dedicada (no el pool directo) para garantizar que `BEGIN`, las validaciones, los inserts y el `COMMIT`/`ROLLBACK` ocurran sobre la misma conexión física.
- **`FOR UPDATE`** en la consulta de stock: bloquea la fila del producto durante la transacción, evitando que dos compras simultáneas vendan el mismo stock dos veces.
- **Consultas parametrizadas (`$1`, `$2`...)** en todas las queries, previniendo SQL Injection.
- **Contraseñas nunca expuestas**: se excluyen explícitamente en los `SELECT`, y se comparan con `bcrypt.compare` en el login, nunca en texto plano.

## Autor 
luis alberto ocampo camacho


