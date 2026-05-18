/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - SERVICIO DE CORREOS
   Archivo: utils/email.js
═══════════════════════════════════════════════ */

const nodemailer = require('nodemailer');

// Crear transporter SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ── PLANTILLA BASE HTML ──
function plantillaBase(contenido) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin:0; padding:0; background:#f5efe6; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; }
      .container { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
      .header { background:linear-gradient(135deg, #0b1120, #1a2437); padding:32px 28px; text-align:center; }
      .header h1 { color:#c8a55a; font-size:22px; margin:0 0 4px; font-weight:400; }
      .header p { color:rgba(240,234,216,0.5); font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0; }
      .body { padding:32px 28px; color:#333; }
      .body h2 { color:#0b1120; font-size:20px; margin:0 0 16px; }
      .body p { font-size:14px; line-height:1.7; color:#555; margin:0 0 14px; }
      .info-card { background:#f9f6f1; border-left:3px solid #c8a55a; border-radius:8px; padding:16px 20px; margin:20px 0; }
      .info-card .label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#999; margin-bottom:4px; }
      .info-card .value { font-size:16px; color:#0b1120; font-weight:600; }
      .footer { background:#f9f6f1; padding:20px 28px; text-align:center; border-top:1px solid #eee; }
      .footer p { font-size:11px; color:#999; margin:0; }
      .badge { display:inline-block; background:linear-gradient(135deg,#c8a55a,#e2c07a); color:#0b1120; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:1px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⚕️ Dr. José Fernando Banquett Flórez</h1>
        <p>Medicina General · Montería, Córdoba</p>
      </div>
      <div class="body">
        ${contenido}
      </div>
      <div class="footer">
        <p>MediSys Banquett · Sistema de Gestión Médica</p>
        <p style="margin-top:6px;">Este es un correo automático, por favor no responda directamente.</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ═══════════════════════════════
//     TIPOS DE CORREO
// ═══════════════════════════════

// ── Confirmación de cita ──
async function enviarConfirmacionCita(paciente, cita) {
  if (!paciente.email) return { enviado: false, razon: 'Sin email' };

  const html = plantillaBase(`
    <h2>✅ Cita Confirmada</h2>
    <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
    <p>Su cita médica ha sido agendada exitosamente. A continuación los detalles:</p>

    <div class="info-card">
      <div class="label">📅 Fecha</div>
      <div class="value">${formatearFecha(cita.fecha)}</div>
    </div>
    <div class="info-card">
      <div class="label">🕐 Hora</div>
      <div class="value">${cita.hora}</div>
    </div>
    ${cita.tipo ? `
    <div class="info-card">
      <div class="label">📋 Tipo de cita</div>
      <div class="value">${cita.tipo}</div>
    </div>` : ''}
    ${cita.notas ? `
    <div class="info-card">
      <div class="label">📝 Notas de preparación</div>
      <div class="value" style="font-size:14px;font-weight:400;">${cita.notas}</div>
    </div>` : ''}

    <p style="margin-top:24px;">Le esperamos puntualmente. Si necesita cancelar o reagendar, comuníquese con nuestro consultorio.</p>
  `);

  return enviarCorreo(paciente.email, '✅ Confirmación de cita – Dr. Banquett Flórez', html);
}

// ── Cancelación de cita ──
async function enviarCancelacionCita(paciente, cita) {
  if (!paciente.email) return { enviado: false, razon: 'Sin email' };

  const html = plantillaBase(`
    <h2>❌ Cita Cancelada</h2>
    <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
    <p>Le informamos que su cita programada para el <strong>${formatearFecha(cita.fecha)}</strong> a las <strong>${cita.hora}</strong> ha sido cancelada.</p>
    <p>Si desea reagendar su cita, por favor comuníquese con nuestro consultorio.</p>
  `);

  return enviarCorreo(paciente.email, '❌ Cita cancelada – Dr. Banquett Flórez', html);
}

// ── Bienvenida con código de acceso ──
async function enviarBienvenida(paciente) {
  if (!paciente.email) return { enviado: false, razon: 'Sin email' };

  const html = plantillaBase(`
    <h2>🌿 Bienvenido a MediSys</h2>
    <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
    <p>Ha sido registrado en nuestro sistema de gestión médica. Ahora puede acceder a su portal de paciente para consultar su historial clínico y descargar sus registros médicos.</p>

    <div class="info-card">
      <div class="label">🔑 Su código de acceso</div>
      <div class="value" style="font-size:28px; letter-spacing:6px;">${paciente.codigo_acceso}</div>
    </div>
    <div class="info-card">
      <div class="label">🪪 Su cédula</div>
      <div class="value">${paciente.cedula}</div>
    </div>

    <p>Para ingresar al portal use su <strong>cédula</strong> y el <strong>código de acceso</strong> proporcionado arriba.</p>
    <p style="color:#999; font-size:12px;">⚠️ Guarde este código de acceso en un lugar seguro. No lo comparta con terceros.</p>
  `);

  return enviarCorreo(paciente.email, '🌿 Bienvenido a MediSys – Su código de acceso', html);
}

// ═══════════════════════════════
//     FUNCIÓN DE ENVÍO
// ═══════════════════════════════
async function enviarCorreo(to, subject, html) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'tu-correo@gmail.com') {
      console.log('📧 [SMTP no configurado] Correo simulado para:', to);
      console.log('   Asunto:', subject);
      return { enviado: false, razon: 'SMTP no configurado' };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });

    console.log('📧 Correo enviado a:', to);
    return { enviado: true };
  } catch (err) {
    console.error('❌ Error enviando correo:', err.message);
    return { enviado: false, razon: err.message };
  }
}

// ── Helper ──
function formatearFecha(f) {
  if (!f) return '—';
  const parts = f.split('-');
  if (parts.length !== 3) return f;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

module.exports = {
  enviarConfirmacionCita,
  enviarCancelacionCita,
  enviarBienvenida
};
