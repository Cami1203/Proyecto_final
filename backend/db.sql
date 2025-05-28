-- Tabla para mensajes de clientes
DROP TABLE IF EXISTS mensajes_clientes CASCADE;

-- Eliminar cualquier clave foránea existente si aún existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mensajes_clientes_pedido_referencia_id_fkey1') THEN
        ALTER TABLE mensajes_clientes DROP CONSTRAINT mensajes_clientes_pedido_referencia_id_fkey1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mensajes_clientes_pedido_referencia_id_fkey') THEN
        ALTER TABLE mensajes_clientes DROP CONSTRAINT mensajes_clientes_pedido_referencia_id_fkey;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS mensajes_clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    asunto VARCHAR(50) NOT NULL,
    motivo VARCHAR(50) NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'pendiente',
    pedido_normal_id INTEGER NULL REFERENCES pedidos(id) ON DELETE SET NULL,
    pedido_personalizado_id INTEGER NULL REFERENCES pedidos_personalizados(id) ON DELETE SET NULL,
    tipo_pedido_referencia VARCHAR(20) NULL CHECK (tipo_pedido_referencia IN ('normal', 'personalizado', NULL)),
    CONSTRAINT check_tipo_pedido CHECK (
        (tipo_pedido_referencia = 'normal' AND pedido_normal_id IS NOT NULL AND pedido_personalizado_id IS NULL) OR
        (tipo_pedido_referencia = 'personalizado' AND pedido_personalizado_id IS NOT NULL AND pedido_normal_id IS NULL) OR
        (tipo_pedido_referencia IS NULL AND pedido_normal_id IS NULL AND pedido_personalizado_id IS NULL)
    )
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_mensajes_clientes_email ON mensajes_clientes(email);
CREATE INDEX IF NOT EXISTS idx_mensajes_clientes_fecha ON mensajes_clientes(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_mensajes_clientes_estado ON mensajes_clientes(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_clientes_pedido_normal ON mensajes_clientes(pedido_normal_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_clientes_pedido_personalizado ON mensajes_clientes(pedido_personalizado_id);

-- Función para validar la referencia del pedido
CREATE OR REPLACE FUNCTION validar_referencia_pedido()
RETURNS TRIGGER AS $$
BEGIN
    -- Si no hay referencia a pedido, permitir la inserción
    IF NEW.pedido_normal_id IS NULL AND NEW.pedido_personalizado_id IS NULL AND NEW.tipo_pedido_referencia IS NULL THEN
        RETURN NEW;
    END IF;

    -- Validar que el pedido exista según su tipo
    IF NEW.tipo_pedido_referencia = 'normal' THEN
        IF NOT EXISTS (SELECT 1 FROM pedidos WHERE id = NEW.pedido_normal_id) THEN
            RAISE EXCEPTION 'El pedido normal con ID % no existe', NEW.pedido_normal_id;
        END IF;
    ELSIF NEW.tipo_pedido_referencia = 'personalizado' THEN
        IF NOT EXISTS (SELECT 1 FROM pedidos_personalizados WHERE id = NEW.pedido_personalizado_id) THEN
            RAISE EXCEPTION 'El pedido personalizado con ID % no existe', NEW.pedido_personalizado_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar la referencia del pedido
DROP TRIGGER IF EXISTS validar_referencia_pedido_trigger ON mensajes_clientes;
CREATE TRIGGER validar_referencia_pedido_trigger
    BEFORE INSERT OR UPDATE ON mensajes_clientes
    FOR EACH ROW
    EXECUTE FUNCTION validar_referencia_pedido();

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reseñas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    calificacion_diseno INTEGER NOT NULL CHECK (calificacion_diseno BETWEEN 1 AND 5),
    calificacion_usabilidad INTEGER NOT NULL CHECK (calificacion_usabilidad BETWEEN 1 AND 5),
    calificacion_contenido INTEGER NOT NULL CHECK (calificacion_contenido BETWEEN 1 AND 5),
    calificacion_velocidad INTEGER NOT NULL CHECK (calificacion_velocidad BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 