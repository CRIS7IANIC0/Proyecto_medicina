/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - BASE DE DATOS (SQLite)
   Archivo: database/db.js
═══════════════════════════════════════════════ */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'medisys.db');
const db = new Database(DB_PATH);

// Habilitar WAL mode para mejor rendimiento
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ═══════════════════════════════
//    CREAR TABLAS
// ═══════════════════════════════
db.exec(`

  -- Tabla de administrador (doctor)
  CREATE TABLE IF NOT EXISTS admin (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario   TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL
  );

  -- Tabla de pacientes
  CREATE TABLE IF NOT EXISTS pacientes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT    NOT NULL,
    cedula          TEXT    NOT NULL UNIQUE,
    fecha_nac       TEXT,
    sexo            TEXT,
    telefono        TEXT,
    email           TEXT,
    direccion       TEXT,
    tipo_sangre     TEXT,
    eps             TEXT,
    alergias        TEXT,
    antecedentes    TEXT,
    motivo          TEXT,
    codigo_acceso   TEXT,
    created_at      TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- Tabla de historial clínico (consultas)
  CREATE TABLE IF NOT EXISTS historial (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id     INTEGER NOT NULL,
    paciente_nombre TEXT    NOT NULL,
    fecha           TEXT    NOT NULL,
    motivo          TEXT,
    diagnostico     TEXT,
    presion_art     TEXT,
    temperatura     TEXT,
    frec_cardiaca   TEXT,
    saturacion      TEXT,
    peso            TEXT,
    frec_resp       TEXT,
    notas           TEXT,
    plan            TEXT,
    created_at      TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  );

  -- Tabla de control de peso
  CREATE TABLE IF NOT EXISTS control_peso (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id      INTEGER NOT NULL,
    paciente_nombre  TEXT    NOT NULL,
    fecha            TEXT    NOT NULL,
    peso             TEXT,
    talla            TEXT,
    imc              TEXT,
    peso_meta        TEXT,
    cintura          TEXT,
    cadera           TEXT,
    grasa            TEXT,
    plan_alimenticio TEXT,
    observaciones    TEXT,
    created_at       TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  );

  -- Tabla de tratamientos
  CREATE TABLE IF NOT EXISTS tratamientos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id     INTEGER NOT NULL,
    paciente_nombre TEXT    NOT NULL,
    fecha           TEXT    NOT NULL,
    diagnostico     TEXT,
    duracion        TEXT,
    med1            TEXT,
    dosis1          TEXT,
    med2            TEXT,
    dosis2          TEXT,
    med3            TEXT,
    dosis3          TEXT,
    indicaciones    TEXT,
    created_at      TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  );

  -- Tabla de citas
  CREATE TABLE IF NOT EXISTS citas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id     INTEGER NOT NULL,
    paciente_nombre TEXT    NOT NULL,
    fecha           TEXT    NOT NULL,
    hora            TEXT    NOT NULL,
    tipo            TEXT,
    notas           TEXT,
    estado          TEXT    DEFAULT 'Pendiente',
    created_at      TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  );
`);

module.exports = db;
