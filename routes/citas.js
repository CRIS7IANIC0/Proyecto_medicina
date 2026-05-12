/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - CRUD CITAS + EMAILS
   Archivo: routes/citas.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const { enviarConfirmacionCita, enviarCancelacionCita } = require('../utils/email');
const router = express.Router();

// ── LISTAR TODAS ──
router.get('/', (req, res) => {
  try {
    const citas = db.prepare('SELECT * FROM citas ORDER BY fecha ASC, hora ASC').all();
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// ── CREAR + ENVIAR CORREO ──
router.post('/', async (req, res) => {
  try {
    const { paciente_id, paciente_nombre, fecha, hora, tipo, notas } = req.body;

    if (!paciente_id || !fecha || !hora) {
      return res.status(400).json({ error: 'Paciente, fecha y hora son obligatorios' });
    }

    const result = db.prepare(`
      INSERT INTO citas (paciente_id, paciente_nombre, fecha, hora, tipo, notas)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(paciente_id, paciente_nombre, fecha, hora, tipo || null, notas || null);

    const cita = db.prepare('SELECT * FROM citas WHERE id = ?').get(result.lastInsertRowid);

    // Enviar correo de confirmación (asíncrono, no bloquea)
    const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(paciente_id);
    let emailResult = { enviado: false };
    if (paciente) {
      emailResult = await enviarConfirmacionCita(paciente, cita);
    }

    res.status(201).json({ ...cita, emailEnviado: emailResult.enviado });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

// ── ACTUALIZAR (reagendar) ──
router.put('/:id', async (req, res) => {
  try {
    const { fecha, hora, tipo, notas, estado } = req.body;

    db.prepare(`
      UPDATE citas SET fecha=?, hora=?, tipo=?, notas=?, estado=? WHERE id=?
    `).run(fecha, hora, tipo, notas, estado || 'Pendiente', req.params.id);

    const cita = db.prepare('SELECT * FROM citas WHERE id = ?').get(req.params.id);
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

// ── ELIMINAR + CORREO DE CANCELACIÓN ──
router.delete('/:id', async (req, res) => {
  try {
    const cita = db.prepare('SELECT * FROM citas WHERE id = ?').get(req.params.id);
    if (cita) {
      const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(cita.paciente_id);
      if (paciente) {
        await enviarCancelacionCita(paciente, cita);
      }
    }

    db.prepare('DELETE FROM citas WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

module.exports = router;
