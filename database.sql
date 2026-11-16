-- Base de Datos: banco_corazones
-- Proyecto: Banco de Corazones (Banca Cooperativa Digital)
-- Autores: Valentina Leal, Sergio Ramos y Dana Manrique

CREATE DATABASE IF NOT EXISTS banco_corazones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banco_corazones;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS metas_corazon;
DROP TABLE IF EXISTS transferencias;
DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS operaciones;
DROP TABLE IF EXISTS cuentas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS canales;
DROP TABLE IF EXISTS tipos_operacion;
DROP TABLE IF EXISTS estados_operacion;
DROP TABLE IF EXISTS estados_cuenta;
DROP TABLE IF EXISTS tipos_cuenta;
DROP TABLE IF EXISTS estados_usuario;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS tipos_documento;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE tipos_documento (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE estados_usuario (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE tipos_cuenta (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE estados_cuenta (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE estados_operacion (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE tipos_operacion (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE canales (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_documento_id TINYINT UNSIGNED NOT NULL,
    numero_documento VARCHAR(25) NOT NULL,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    telefono VARCHAR(25) NULL,
    ciudad VARCHAR(50) NOT NULL DEFAULT 'Manizales',
    nivel_asociado VARCHAR(30) NOT NULL DEFAULT 'Asociado Corazón',
    password_hash VARCHAR(255) NOT NULL,
    rol_id TINYINT UNSIGNED NOT NULL,
    estado_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cor_user_doc FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento (id),
    CONSTRAINT fk_cor_user_rol FOREIGN KEY (rol_id) REFERENCES roles (id),
    CONSTRAINT fk_cor_user_est FOREIGN KEY (estado_id) REFERENCES estados_usuario (id),
    CONSTRAINT uk_cor_doc UNIQUE (tipo_documento_id, numero_documento)
) ENGINE=InnoDB;

CREATE TABLE cuentas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
    tipo_id TINYINT UNSIGNED NOT NULL,
    estado_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    linea_ahorro VARCHAR(40) NOT NULL DEFAULT 'Ahorro Corazón Solidario',
    tope_diario DECIMAL(15, 2) NOT NULL DEFAULT 5000000.00,
    pin_hash VARCHAR(255) NOT NULL,
    saldo DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cor_cta_user FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cor_cta_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_cuenta (id),
    CONSTRAINT fk_cor_cta_est FOREIGN KEY (estado_id) REFERENCES estados_cuenta (id)
) ENGINE=InnoDB;

CREATE TABLE metas_corazon (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cuenta_id BIGINT UNSIGNED NOT NULL,
    nombre_meta VARCHAR(80) NOT NULL,
    monto_objetivo DECIMAL(15, 2) NOT NULL,
    monto_actual DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cor_meta_cta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE operaciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_id TINYINT UNSIGNED NOT NULL,
    estado_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    canal_id TINYINT UNSIGNED NOT NULL,
    realizado_por BIGINT UNSIGNED NULL,
    valor DECIMAL(15, 2) NOT NULL,
    referencia_bancaria VARCHAR(40) NOT NULL DEFAULT 'COR-2026',
    descripcion VARCHAR(255) NULL,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cor_op_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_operacion (id),
    CONSTRAINT fk_cor_op_est FOREIGN KEY (estado_id) REFERENCES estados_operacion (id),
    CONSTRAINT fk_cor_op_canal FOREIGN KEY (canal_id) REFERENCES canales (id),
    CONSTRAINT fk_cor_op_user FOREIGN KEY (realizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE movimientos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    operacion_id BIGINT UNSIGNED NOT NULL,
    cuenta_id BIGINT UNSIGNED NOT NULL,
    sentido ENUM('DEBITO', 'CREDITO') NOT NULL,
    saldo_resultante DECIMAL(15, 2) NOT NULL,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cor_mov_op FOREIGN KEY (operacion_id) REFERENCES operaciones (id) ON DELETE CASCADE,
    CONSTRAINT fk_cor_mov_cta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE transferencias (
    operacion_id BIGINT UNSIGNED PRIMARY KEY,
    cuenta_origen_id BIGINT UNSIGNED NOT NULL,
    cuenta_destino_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_cor_tr_op FOREIGN KEY (operacion_id) REFERENCES operaciones (id) ON DELETE CASCADE,
    CONSTRAINT fk_cor_tr_orig FOREIGN KEY (cuenta_origen_id) REFERENCES cuentas (id),
    CONSTRAINT fk_cor_tr_dest FOREIGN KEY (cuenta_destino_id) REFERENCES cuentas (id)
) ENGINE=InnoDB;

-- Catálogos iniciales
INSERT INTO tipos_documento (id, codigo, nombre) VALUES
(1, 'CC', 'Cédula de Ciudadanía'),
(2, 'CE', 'Cédula de Extranjería'),
(3, 'PAS', 'Pasaporte');

INSERT INTO roles (id, nombre) VALUES
(1, 'Administrador'),
(2, 'Cliente');

INSERT INTO estados_usuario (id, nombre) VALUES
(1, 'ACTIVO'),
(2, 'INACTIVO'),
(3, 'BLOQUEADO');

INSERT INTO tipos_cuenta (id, nombre) VALUES
(1, 'Ahorros'),
(2, 'Corriente');

INSERT INTO estados_cuenta (id, nombre) VALUES
(1, 'ACTIVA'),
(2, 'INACTIVA'),
(3, 'BLOQUEADA');

INSERT INTO estados_operacion (id, nombre) VALUES
(1, 'EXITOSA'),
(2, 'PENDIENTE'),
(3, 'FALLIDA'),
(4, 'RECHAZADA');

INSERT INTO tipos_operacion (id, nombre) VALUES
(1, 'Abono en Caja'),
(2, 'Retiro en Dispensador'),
(3, 'Envío entre Cuentas'),
(4, 'Abono Recibido');

INSERT INTO canales (id, nombre) VALUES
(1, 'Dispensador Efectivo Corazón'),
(2, 'Sucursal Web Personas'),
(3, 'Caja Principal');

-- Usuarios de Banco de Corazones (Clave: Banco123* | PIN: 1234)
INSERT INTO usuarios (id, tipo_documento_id, numero_documento, nombres, apellidos, correo, telefono, ciudad, nivel_asociado, password_hash, rol_id, estado_id) VALUES
(1, 1, '1053900100', 'Valentina', 'Leal (Gerencia)', 'admin@banco.com', '3101112233', 'Manizales', 'Directiva', '$2b$10$yhjLcIIlWUg6Kd7kz2e53uhQhmPvwaY4B.jh6T/wC5as4VucS9ttq', 1, 1),
(2, 1, '1001112233', 'Valentina', 'Leal', 'valentina@corazones.com', '3112223344', 'Manizales', 'Fundadora', '$2b$10$yhjLcIIlWUg6Kd7kz2e53uhQhmPvwaY4B.jh6T/wC5as4VucS9ttq', 2, 1),
(3, 1, '1002223344', 'Sergio', 'Ramos', 'sergio@corazones.com', '3123334455', 'Manizales', 'Fundador', '$2b$10$yhjLcIIlWUg6Kd7kz2e53uhQhmPvwaY4B.jh6T/wC5as4VucS9ttq', 2, 1),
(4, 1, '1003334455', 'Dana', 'Manrique', 'dana@corazones.com', '3134445566', 'Manizales', 'Fundadora', '$2b$10$yhjLcIIlWUg6Kd7kz2e53uhQhmPvwaY4B.jh6T/wC5as4VucS9ttq', 2, 1),
(5, 1, '1004445566', 'Camilo', 'Torres Restrepo', 'camilo@corazones.com', '3145556677', 'Pereira', 'Asociado', '$2b$10$yhjLcIIlWUg6Kd7kz2e53uhQhmPvwaY4B.jh6T/wC5as4VucS9ttq', 2, 3);

INSERT INTO cuentas (id, usuario_id, numero_cuenta, tipo_id, estado_id, linea_ahorro, pin_hash, saldo) VALUES
(1, 2, '700111223344', 1, 1, 'Ahorro Corazón Oro', '$2b$10$jXnIXzZcx1ye9AfyCcbSQe/mhAY5glX.cAf4HFLNwJSHVzhzpBMSq', 2400000.00),
(2, 3, '700222334455', 1, 1, 'Ahorro Corazón Tradicional', '$2b$10$jXnIXzZcx1ye9AfyCcbSQe/mhAY5glX.cAf4HFLNwJSHVzhzpBMSq', 1850000.00),
(3, 4, '700333445566', 2, 1, 'Cuenta Corriente Solidaria', '$2b$10$jXnIXzZcx1ye9AfyCcbSQe/mhAY5glX.cAf4HFLNwJSHVzhzpBMSq', 3100000.00),
(4, 5, '700444556677', 1, 3, 'Ahorro Corazón Tradicional', '$2b$10$jXnIXzZcx1ye9AfyCcbSQe/mhAY5glX.cAf4HFLNwJSHVzhzpBMSq', 420000.00);

INSERT INTO metas_corazon (cuenta_id, nombre_meta, monto_objetivo, monto_actual) VALUES
(1, 'Fondo Universitario Valentina', 5000000.00, 2400000.00),
(2, 'Ahorro Viaje Sergio', 3000000.00, 1850000.00),
(3, 'Reserva Emprendimiento Dana', 6000000.00, 3100000.00);

INSERT INTO operaciones (id, tipo_id, estado_id, canal_id, realizado_por, valor, referencia_bancaria, descripcion, creada_en) VALUES
(1, 1, 1, 3, 1, 2400000.00, 'COR-0001', 'Aporte de apertura — Valentina Leal', '2026-11-10 09:00:00'),
(2, 1, 1, 3, 1, 1850000.00, 'COR-0002', 'Aporte de apertura — Sergio Ramos', '2026-11-10 10:15:00'),
(3, 1, 1, 3, 1, 3100000.00, 'COR-0003', 'Aporte de apertura — Dana Manrique', '2026-11-10 11:30:00'),
(4, 1, 1, 3, 1, 420000.00, 'COR-0004', 'Aporte de apertura — Camilo Torres', '2026-11-10 12:00:00');

INSERT INTO movimientos (id, operacion_id, cuenta_id, sentido, saldo_resultante, creada_en) VALUES
(1, 1, 1, 'CREDITO', 2400000.00, '2026-11-10 09:00:00'),
(2, 2, 2, 'CREDITO', 1850000.00, '2026-11-10 10:15:00'),
(3, 3, 3, 'CREDITO', 3100000.00, '2026-11-10 11:30:00'),
(4, 4, 4, 'CREDITO', 420000.00, '2026-11-10 12:00:00');

COMMIT;
