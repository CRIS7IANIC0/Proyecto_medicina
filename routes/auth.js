/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - AUTENTICACIÓN
   Archivo: routes/auth.js
═══════════════════════════════════════════════ */

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const router = express.Router();

// ── LOGIN DEL DOCTOR ──
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    const admin = db.prepare('SELECT * FROM admin WHERE usuario = ?').get(usuario);
    if (!admin) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    req.session.admin = true;
    req.session.tipo = 'admin';
    res.json({ ok: true, mensaje: 'Sesión iniciada' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── LOGIN DEL PACIENTE (Portal) ──
router.post('/portal-login', (req, res) => {
  try {
    const { cedula, codigo } = req.body;
    if (!cedula || !codigo) {
      return res.status(400).json({ error: 'Cédula y código de acceso son obligatorios' });
    }

    const paciente = db.prepare(
      'SELECT id, nombre, cedula, codigo_acceso FROM pacientes WHERE cedula = ?'
    ).get(cedula);

    if (!paciente || paciente.codigo_acceso !== codigo) {
      return res.status(401).json({ error: 'Cédula o código de acceso incorrectos' });
    }

    req.session.pacienteId = paciente.id;
    req.session.pacienteNombre = paciente.nombre;
    req.session.tipo = 'paciente';
    res.json({ ok: true, nombre: paciente.nombre });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── LOGOUT ──
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ── VERIFICAR SESIÓN ──
router.get('/check', (req, res) => {
  if (req.session.admin) {
    return res.json({ ok: true, tipo: 'admin' });
  }
  if (req.session.pacienteId) {
    return res.json({ ok: true, tipo: 'paciente', nombre: req.session.pacienteNombre });
  }
  res.json({ ok: false });
});

module.exports = router;
