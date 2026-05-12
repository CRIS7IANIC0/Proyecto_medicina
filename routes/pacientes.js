/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - CRUD PACIENTES
   Archivo: routes/pacientes.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Generar código de acceso de 6 dígitos
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── LISTAR TODOS ──
router.get('/', (req, res) => {
  try {
    const pacientes = db.prepare('SELECT * FROM pacientes ORDER BY id DESC').all();
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// ── OBTENER UNO ──
router.get('/:id', (req, res) => {
  try {
    const pac = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);
    if (!pac) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(pac);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
});

// ── CREAR ──
router.post('/', (req, res) => {
  try {
    const { nombre, cedula, fecha_nac, sexo, telefono, email, direccion, tipo_sangre, eps, alergias, antecedentes, motivo } = req.body;

    if (!nombre || !cedula) {
      return res.status(400).json({ error: 'Nombre y cédula son obligatorios' });
    }

    // Verificar si ya existe
    const existing = db.prepare('SELECT id FROM pacientes WHERE cedula = ?').get(cedula);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un paciente con esa cédula' });
    }

    const codigo_acceso = generarCodigo();

    const result = db.prepare(`
      INSERT INTO pacientes (nombre, cedula, fecha_nac, sexo, telefono, email, direccion, tipo_sangre, eps, alergias, antecedentes, motivo, codigo_acceso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nombre, cedula, fecha_nac || null, sexo || null, telefono || null, email || null, direccion || null, tipo_sangre || null, eps || null, alergias || null, antecedentes || null, motivo || null, codigo_acceso);

    const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(paciente);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

// ── ACTUALIZAR ──
router.put('/:id', (req, res) => {
  try {
    const { nombre, cedula, fecha_nac, sexo, telefono, email, direccion, tipo_sangre, eps, alergias, antecedentes, motivo } = req.body;

    db.prepare(`
      UPDATE pacientes SET nombre=?, cedula=?, fecha_nac=?, sexo=?, telefono=?, email=?, direccion=?, tipo_sangre=?, eps=?, alergias=?, antecedentes=?, motivo=?
      WHERE id=?
    `).run(nombre, cedula, fecha_nac, sexo, telefono, email, direccion, tipo_sangre, eps, alergias, antecedentes, motivo, req.params.id);

    const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

// ── ELIMINAR ──
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM pacientes WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
});

module.exports = router;
