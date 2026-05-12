/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - SEED (Usuario admin inicial)
   Archivo: database/seed.js
═══════════════════════════════════════════════ */

const bcrypt = require('bcrypt');
const db = require('./db');

async function seed() {
  const existing = db.prepare('SELECT id FROM admin WHERE usuario = ?').get('admin');

  if (existing) {
    console.log('✅ El usuario admin ya existe.');
    return;
  }

  const hash = await bcrypt.hash('1234', 12);
  db.prepare('INSERT INTO admin (usuario, password) VALUES (?, ?)').run('admin', hash);
  console.log('🌸 Usuario admin creado exitosamente.');
  console.log('   Usuario: admin');
  console.log('   Contraseña: 1234');
}

seed().catch(err => {
  console.error('❌ Error al crear el seed:', err);
  process.exit(1);
});
