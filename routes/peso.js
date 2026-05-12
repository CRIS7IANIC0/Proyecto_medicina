/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - CRUD CONTROL DE PESO
   Archivo: routes/peso.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const router = express.Router();

// ── LISTAR TODOS ──
router.get('/', (req, res) => {
  try {
    const registros = db.prepare('SELECT * FROM control_peso ORDER BY fecha DESC, id DESC').all();
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros de peso' });
  }
});

// ── REGISTROS DE UN PACIENTE ──
router.get('/paciente/:id', (req, res) => {
  try {
    const registros = db.prepare('SELECT * FROM control_peso WHERE paciente_id = ? ORDER BY fecha DESC').all(req.params.id);
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros del paciente' });
  }
});

// ── OBTENER UNO ──
router.get('/:id', (req, res) => {
  try {
    const reg = db.prepare('SELECT * FROM control_peso WHERE id = ?').get(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(reg);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registro' });
  }
});

// ── CREAR ──
router.post('/', (req, res) => {
  try {
    const { paciente_id, paciente_nombre, fecha, peso, talla, imc, peso_meta, cintura, cadera, grasa, plan_alimenticio, observaciones } = req.body;

    if (!paciente_id || !fecha) {
      return res.status(400).json({ error: 'Paciente y fecha son obligatorios' });
    }

    const result = db.prepare(`
      INSERT INTO control_peso (paciente_id, paciente_nombre, fecha, peso, talla, imc, peso_meta, cintura, cadera, grasa, plan_alimenticio, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(paciente_id, paciente_nombre, fecha, peso || null, talla || null, imc || null, peso_meta || null, cintura || null, cadera || null, grasa || null, plan_alimenticio || null, observaciones || null);

    const registro = db.prepare('SELECT * FROM control_peso WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(registro);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear registro de peso' });
  }
});

// ── ELIMINAR ──
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM control_peso WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

module.exports = router;
