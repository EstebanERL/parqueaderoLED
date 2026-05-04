-- ============================================================
-- Base de Datos: parqueadero_db
-- Sistema de Gestión de Parqueadero
-- ============================================================

DROP DATABASE IF EXISTS parqueadero_db;
CREATE DATABASE parqueadero_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_db;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO roles (nombre) VALUES ('administrador'), ('operario');

-- ------------------------------------------------------------
-- USUARIOS
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Password por defecto: admin123  (bcrypt hash)
INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES
('Administrador', 'admin@parqueadero.com',
 '$2b$10$p2SddtZZtmACKZXAfmwrwOdMWK0SiHSMr5mN29mkokxptcZTuD/6.', 1),
('Operario Demo', 'operario@parqueadero.com',
 '$2b$10$p2SddtZZtmACKZXAfmwrwOdMWK0SiHSMr5mN29mkokxptcZTuD/6.', 2);

-- ------------------------------------------------------------
-- TIPOS DE VEHÍCULO
-- ------------------------------------------------------------
CREATE TABLE tipos_vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,         -- sedan, camioneta, moto
  categoria ENUM('auto','moto') NOT NULL,     -- agrupador de cupos
  capacidad_maxima INT NOT NULL
);

-- La capacidad total se define por CATEGORÍA (30 autos, 15 motos)
-- Se replica por tipo para flexibilidad; el control real usa la categoría.
INSERT INTO tipos_vehiculo (nombre, categoria, capacidad_maxima) VALUES
('sedan',     'auto', 30),
('camioneta', 'auto', 30),
('moto',      'moto', 15);

-- ------------------------------------------------------------
-- TARIFAS
-- ------------------------------------------------------------
CREATE TABLE tarifas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_vehiculo_id INT NOT NULL,
  unidad ENUM('minuto','hora','dia','fraccion') NOT NULL DEFAULT 'minuto',
  valor DECIMAL(10,2) NOT NULL,
  valor_fraccion_minutos INT DEFAULT 15,  -- sólo si unidad='fraccion'
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id)
);

INSERT INTO tarifas (tipo_vehiculo_id, unidad, valor, valor_fraccion_minutos) VALUES
(1, 'minuto', 100.00, 15),   -- sedan: $100/min
(2, 'minuto', 120.00, 15),   -- camioneta: $120/min
(3, 'minuto',  60.00, 15);   -- moto: $60/min

-- ------------------------------------------------------------
-- ESPACIOS (opcional, por si se quiere asignar número de celda)
-- ------------------------------------------------------------
CREATE TABLE espacios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  categoria ENUM('auto','moto') NOT NULL,
  ocupado TINYINT(1) DEFAULT 0
);

-- Generar 30 autos + 15 motos
INSERT INTO espacios (codigo, categoria)
SELECT CONCAT('A', LPAD(n,2,'0')), 'auto' FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) t;

INSERT INTO espacios (codigo, categoria)
SELECT CONCAT('M', LPAD(n,2,'0')), 'moto' FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) t;

-- ------------------------------------------------------------
-- REGISTROS (entradas / salidas)
-- ------------------------------------------------------------
CREATE TABLE registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo_id INT NOT NULL,
  espacio_id INT,
  hora_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hora_salida DATETIME NULL,
  minutos_total INT NULL,
  valor_pagar DECIMAL(10,2) NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  estado ENUM('activo','finalizado') DEFAULT 'activo',
  usuario_entrada_id INT NOT NULL,
  usuario_salida_id INT NULL,
  FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id),
  FOREIGN KEY (espacio_id) REFERENCES espacios(id),
  FOREIGN KEY (usuario_entrada_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_salida_id) REFERENCES usuarios(id),
  INDEX idx_estado (estado),
  INDEX idx_placa (placa)
);

-- ------------------------------------------------------------
-- TICKETS
-- ------------------------------------------------------------
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_id INT UNIQUE NOT NULL,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  emitido_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (registro_id) REFERENCES registros(id)
);

-- ------------------------------------------------------------
-- VISTA: cupos disponibles en tiempo real
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_cupos AS
SELECT
  'auto' AS categoria,
  30 AS capacidad,
  (SELECT COUNT(*) FROM registros r
    JOIN tipos_vehiculo t ON t.id = r.tipo_vehiculo_id
    WHERE r.estado='activo' AND t.categoria='auto') AS ocupados,
  30 - (SELECT COUNT(*) FROM registros r
    JOIN tipos_vehiculo t ON t.id = r.tipo_vehiculo_id
    WHERE r.estado='activo' AND t.categoria='auto') AS disponibles
UNION ALL
SELECT
  'moto',
  15,
  (SELECT COUNT(*) FROM registros r
    JOIN tipos_vehiculo t ON t.id = r.tipo_vehiculo_id
    WHERE r.estado='activo' AND t.categoria='moto'),
  15 - (SELECT COUNT(*) FROM registros r
    JOIN tipos_vehiculo t ON t.id = r.tipo_vehiculo_id
    WHERE r.estado='activo' AND t.categoria='moto');
