/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - CRUD HISTORIAL CLÍNICO
   Archivo: routes/historial.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const router = express.Router();

// ── LISTAR TODOS ──
router.get('/', (req, res) => {
  try {
    const historial = db.prepare('SELECT * FROM historial ORDER BY fecha DESC, id DESC').all();
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ── HISTORIAL DE UN PACIENTE ──
router.get('/paciente/:id', (req, res) => {
  try {
    const historial = db.prepare('SELECT * FROM historial WHERE paciente_id = ? ORDER BY fecha DESC').all(req.params.id);
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial del paciente' });
  }
});

// ── OBTENER UNO ──
router.get('/:id', (req, res) => {
  try {
    const h = db.prepare('SELECT * FROM historial WHERE id = ?').get(req.params.id);
    if (!h) return res.status(404).json({ error: 'Consulta no encontrada' });
    res.json(h);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener consulta' });
  }
});

// ── CREAR ──
router.post('/', (req, res) => {
  try {
    const { paciente_id, paciente_nombre, fecha, motivo, diagnostico, presion_art, temperatura, frec_cardiaca, saturacion, peso, frec_resp, notas, plan } = req.body;

    if (!paciente_id || !fecha) {
      return res.status(400).json({ error: 'Paciente y fecha son obligatorios' });
    }

    const result = db.prepare(`
      INSERT INTO historial (paciente_id, paciente_nombre, fecha, motivo, diagnostico, presion_art, temperatura, frec_cardiaca, saturacion, peso, frec_resp, notas, plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(paciente_id, paciente_nombre, fecha, motivo || null, diagnostico || null, presion_art || null, temperatura || null, frec_cardiaca || null, saturacion || null, peso || null, frec_resp || null, notas || null, plan || null);

    const consulta = db.prepare('SELECT * FROM historial WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(consulta);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar consulta' });
  }
});

// ── ELIMINAR ──
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM historial WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar consulta' });
  }
});

module.exports = router;
