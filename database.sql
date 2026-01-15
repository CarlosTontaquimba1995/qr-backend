-- 1. Asegúrate de que las extensiones necesarias existan
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE DATABASE validador_qr;

-- 2. Create enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE estado_entrada AS ENUM ('PENDIENTE', 'USADO');
CREATE TYPE motivo_fraude AS ENUM ('YA_USADO', 'TOKEN_INEXISTENTE');

-- 3. User table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    cedula VARCHAR(20) UNIQUE, -- Aumentado a 20 por seguridad internacional
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Entradas table (ACTUALIZADA con JSONB)
CREATE TABLE entrada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_ticket VARCHAR(36) NOT NULL UNIQUE,
    nombre_cliente VARCHAR(100) NOT NULL,
    email_cliente VARCHAR(100),
    monto_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    detalles JSONB NOT NULL, 
    estado estado_entrada DEFAULT 'PENDIENTE',
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario_id UUID NOT NULL,
    CONSTRAINT fk_entrada_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE
);

-- 5. IntentoFraude table
CREATE TABLE intento_fraude (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_escaneado VARCHAR(36) NOT NULL,
    motivo motivo_fraude NOT NULL,
    id_puerta VARCHAR(50),
    fecha_intento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario_id UUID,
    CONSTRAINT fk_intento_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES "user"(id)
        ON DELETE SET NULL
);

-- 6. Indexes (ACTUALIZADOS)
CREATE INDEX idx_entrada_uuid_ticket ON entrada(uuid_ticket);
CREATE INDEX idx_entrada_usuario_id ON entrada(usuario_id);
CREATE INDEX idx_entrada_estado ON entrada(estado);
-- NUEVO ÍNDICE: Mejora drásticamente consultas que busquen dentro de los detalles
CREATE INDEX idx_entrada_detalles_gin ON entrada USING GIN (detalles);

CREATE INDEX idx_intentos_fraude_usuario_id ON intento_fraude(usuario_id);
CREATE INDEX idx_intentos_fraude_fecha ON intento_fraude(fecha_intento);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_cedula ON "user"(cedula);

-- 7. Triggers y Funciones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrada_updated_at
BEFORE UPDATE ON entrada
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();