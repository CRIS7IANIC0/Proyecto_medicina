/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - CRUD TRATAMIENTOS
   Archivo: routes/tratamientos.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const router = express.Router();

// ── LISTAR TODOS ──
router.get('/', (req, res) => {
  try {
    const tratamientos = db.prepare('SELECT * FROM tratamientos ORDER BY fecha DESC, id DESC').all();
    res.json(tratamientos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});

// ── TRATAMIENTOS DE UN PACIENTE ──
router.get('/paciente/:id', (req, res) => {
  try {
    const tratamientos = db.prepare('SELECT * FROM tratamientos WHERE paciente_id = ? ORDER BY fecha DESC').all(req.params.id);
    res.json(tratamientos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tratamientos del paciente' });
  }
});

// ── OBTENER UNO ──
router.get('/:id', (req, res) => {
  try {
    const t = db.prepare('SELECT * FROM tratamientos WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tratamiento no encontrado' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tratamiento' });
  }
});

// ── CREAR ──
router.post('/', (req, res) => {
  try {
    const { paciente_id, paciente_nombre, fecha, diagnostico, duracion, med1, dosis1, med2, dosis2, med3, dosis3, indicaciones } = req.body;

    if (!paciente_id || !fecha) {
      return res.status(400).json({ error: 'Paciente y fecha son obligatorios' });
    }
    if (!med1) {
      return res.status(400).json({ error: 'Ingresa al menos un medicamento' });
    }

    const result = db.prepare(`
      INSERT INTO tratamientos (paciente_id, paciente_nombre, fecha, diagnostico, duracion, med1, dosis1, med2, dosis2, med3, dosis3, indicaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(paciente_id, paciente_nombre, fecha, diagnostico || null, duracion || null, med1, dosis1 || null, med2 || null, dosis2 || null, med3 || null, dosis3 || null, indicaciones || null);

    const tratamiento = db.prepare('SELECT * FROM tratamientos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tratamiento);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tratamiento' });
  }
});

// ── ELIMINAR ──
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tratamientos WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tratamiento' });
  }
});

module.exports = router;
