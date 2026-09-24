-- ============================================
-- Schema Ecommerce - Version corregida
-- 5 tablas: usuarios, categorias, productos, pedidos, pedido_items
-- ============================================

BEGIN;

-- Elimina las tablas anteriores (con los bugs de tipos) si existen
DROP TABLE IF EXISTS public.pedido_items CASCADE;
DROP TABLE IF EXISTS public.carrito_items CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;
DROP TABLE IF EXISTS public."categorias " CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE public.usuarios (
    usuario_id      SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    rol             VARCHAR(50)  NOT NULL DEFAULT 'cliente',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================
-- CATEGORIAS
-- ============================================
CREATE TABLE public.categorias (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- PRODUCTOS
-- ============================================
CREATE TABLE public.productos (
    producto_id     SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria_id    INTEGER NOT NULL,
    imagen_url      VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria_id) REFERENCES public.categorias (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================
-- PEDIDOS
-- ============================================
CREATE TABLE public.pedidos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL,
    total           NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    estado          VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios (usuario_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================
-- PEDIDO_ITEMS (detalle de cada pedido)
-- ============================================
CREATE TABLE public.pedido_items (
    id              SERIAL PRIMARY KEY,
    pedido_id       INTEGER NOT NULL,
    producto_id     INTEGER NOT NULL,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    CONSTRAINT fk_pedido_items_pedido
        FOREIGN KEY (pedido_id) REFERENCES public.pedidos (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pedido_items_producto
        FOREIGN KEY (producto_id) REFERENCES public.productos (producto_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMIT;
