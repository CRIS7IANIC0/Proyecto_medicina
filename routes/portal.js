/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - PORTAL DEL PACIENTE (API)
   Archivo: routes/portal.js
═══════════════════════════════════════════════ */

const express = require('express');
const db = require('../database/db');
const { generarHistorialPDF } = require('../utils/pdf-generator');
const router = express.Router();

// Middleware: verificar que es un paciente autenticado
function requirePaciente(req, res, next) {
  if (!req.session.pacienteId) {
    return res.status(401).json({ error: 'No autenticado como paciente' });
  }
  next();
}

router.use(requirePaciente);

// ── MI PERFIL ──
router.get('/mi-perfil', (req, res) => {
  try {
    const pac = db.prepare(
      'SELECT id, nombre, cedula, fecha_nac, sexo, telefono, email, direccion, tipo_sangre, eps, alergias, antecedentes FROM pacientes WHERE id = ?'
    ).get(req.session.pacienteId);
    if (!pac) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(pac);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// ── MI HISTORIAL ──
router.get('/mi-historial', (req, res) => {
  try {
    const historial = db.prepare(
      'SELECT * FROM historial WHERE paciente_id = ? ORDER BY fecha DESC'
    ).all(req.session.pacienteId);
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ── MIS TRATAMIENTOS ──
router.get('/mis-tratamientos', (req, res) => {
  try {
    const trat = db.prepare(
      'SELECT * FROM tratamientos WHERE paciente_id = ? ORDER BY fecha DESC'
    ).all(req.session.pacienteId);
    res.json(trat);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});

// ── MIS CITAS ──
router.get('/mis-citas', (req, res) => {
  try {
    const citas = db.prepare(
      'SELECT * FROM citas WHERE paciente_id = ? ORDER BY fecha ASC, hora ASC'
    ).all(req.session.pacienteId);
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// ── MI PESO ──
router.get('/mi-peso', (req, res) => {
  try {
    const peso = db.prepare(
      'SELECT * FROM control_peso WHERE paciente_id = ? ORDER BY fecha DESC'
    ).all(req.session.pacienteId);
    res.json(peso);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros de peso' });
  }
});

// ── DESCARGAR HISTORIAL EN PDF ──
router.get('/descargar-historial', (req, res) => {
  try {
    const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.session.pacienteId);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const historial = db.prepare('SELECT * FROM historial WHERE paciente_id = ? ORDER BY fecha DESC').all(req.session.pacienteId);
    const tratamientos = db.prepare('SELECT * FROM tratamientos WHERE paciente_id = ? ORDER BY fecha DESC').all(req.session.pacienteId);
    const controlPeso = db.prepare('SELECT * FROM control_peso WHERE paciente_id = ? ORDER BY fecha DESC').all(req.session.pacienteId);

    const doc = generarHistorialPDF(paciente, historial, tratamientos, controlPeso);

    const filename = `Historial_Clinico_${paciente.nombre.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
});

module.exports = router;
