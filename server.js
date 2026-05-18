/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - SERVIDOR EXPRESS
   Dr. José Fernando Banquett Flórez
   Archivo: server.js
═══════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dns = require('dns');

// Solución para evitar "Connection timeout" de Node 18+ en contenedores Linux/Railway (fuerza IPv4)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Inicializar base de datos (crea tablas si no existen)
require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════
//       MIDDLEWARE
// ═══════════════════════════════
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'medisys-secret-default',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
    httpOnly: true
  }
}));

// Archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════
//       RUTAS API
// ═══════════════════════════════
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/pacientes',     require('./routes/pacientes'));
app.use('/api/historial',     require('./routes/historial'));
app.use('/api/peso',          require('./routes/peso'));
app.use('/api/tratamientos',  require('./routes/tratamientos'));
app.use('/api/citas',         require('./routes/citas'));
app.use('/api/portal',        require('./routes/portal'));

// ═══════════════════════════════
//       RUTAS DE PÁGINAS
// ═══════════════════════════════

// Panel del doctor (ruta raíz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Portal del paciente
app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

// ═══════════════════════════════
//       INICIAR SERVIDOR
// ═══════════════════════════════
app.listen(PORT, () => {
  console.log('');
  console.log('  ═══════════════════════════════════════════');
  console.log('  🌸 MediSys Banquett · Servidor Iniciado');
  console.log('  ═══════════════════════════════════════════');
  console.log(`  🏥 Panel del Doctor:   http://localhost:${PORT}`);
  console.log(`  👤 Portal Pacientes:   http://localhost:${PORT}/portal`);
  console.log('  ═══════════════════════════════════════════');
  console.log('');
});
