/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - PORTAL DEL PACIENTE (JS)
   Archivo: portal.js
═══════════════════════════════════════════════ */

// ═══════════════════════════════
//           LOGIN
// ═══════════════════════════════
async function portalLogin() {
  const cedula = document.getElementById('loginCedula').value.trim();
  const codigo = document.getElementById('loginCodigo').value.trim();
  const errEl  = document.getElementById('lerr');

  if (!cedula || !codigo) {
    errEl.textContent = '❌ Ingrese cédula y código de acceso';
    setTimeout(() => errEl.textContent = '', 3000);
    return;
  }

  try {
    const res = await fetch('/api/auth/portal-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, codigo })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = '❌ ' + (data.error || 'Credenciales incorrectas');
      setTimeout(() => errEl.textContent = '', 3000);
      return;
    }

    // Login exitoso
    const lp = document.getElementById('loginPage');
    lp.style.transition = 'opacity .5s, transform .5s';
    lp.style.opacity = '0';
    lp.style.transform = 'scale(1.04)';
    setTimeout(() => {
      lp.style.display = 'none';
      document.getElementById('portal').style.display = 'block';
      document.getElementById('userName').textContent = data.nombre;
      document.getElementById('welcomeTitle').innerHTML = `Bienvenido, <em>${data.nombre.split(' ')[0]}</em>`;
      loadAllData();
    }, 500);
  } catch (err) {
    errEl.textContent = '❌ Error de conexión con el servidor';
    setTimeout(() => errEl.textContent = '', 3000);
  }
}

async function portalLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.reload();
}

// Enter para login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').style.display !== 'none') {
    portalLogin();
  }
});

// ═══════════════════════════════
//        NAVEGACIÓN
// ═══════════════════════════════
function showSection(name, btn) {
  document.querySelectorAll('.portal-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  btn.classList.add('active');
}

// ═══════════════════════════════
//        CARGAR DATOS
// ═══════════════════════════════
async function loadAllData() {
  loadPerfil();
  loadHistorial();
  loadTratamientos();
  loadCitas();
  loadPeso();
}

function fmtFecha(f) {
  if (!f) return '—';
  const p = f.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : f;
}

// ── PERFIL ──
async function loadPerfil() {
  try {
    const res = await fetch('/api/portal/mi-perfil');
    const pac = await res.json();
    const el = document.getElementById('perfilContent');

    el.innerHTML = `
      <div class="profile-item"><span class="profile-label">Nombre Completo</span><div class="profile-value">${pac.nombre || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">Cédula</span><div class="profile-value">${pac.cedula || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">Fecha de Nacimiento</span><div class="profile-value">${fmtFecha(pac.fecha_nac)}</div></div>
      <div class="profile-item"><span class="profile-label">Sexo</span><div class="profile-value">${pac.sexo || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">Tipo de Sangre</span><div class="profile-value">${pac.tipo_sangre || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">EPS</span><div class="profile-value">${pac.eps || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">Teléfono</span><div class="profile-value">${pac.telefono || '—'}</div></div>
      <div class="profile-item"><span class="profile-label">Email</span><div class="profile-value">${pac.email || '—'}</div></div>
      <div class="profile-item full"><span class="profile-label">Dirección</span><div class="profile-value">${pac.direccion || '—'}</div></div>
      <div class="profile-item full"><span class="profile-label">⚠️ Alergias</span><div class="profile-value ${pac.alergias ? 'alert' : ''}">${pac.alergias || 'Sin alergias registradas'}</div></div>
      <div class="profile-item full"><span class="profile-label">Antecedentes</span><div class="profile-value">${pac.antecedentes || 'Sin antecedentes registrados'}</div></div>
    `;
  } catch (err) {
    document.getElementById('perfilContent').innerHTML = '<div class="empty-msg"><span class="ei">❌</span><p>Error al cargar perfil</p></div>';
  }
}

// ── HISTORIAL ──
async function loadHistorial() {
  try {
    const res = await fetch('/api/portal/mi-historial');
    const data = await res.json();
    const el = document.getElementById('historialContent');

    if (!data.length) {
      el.innerHTML = '<div class="empty-msg"><span class="ei">📋</span><p>No hay consultas registradas aún</p></div>';
      return;
    }

    el.innerHTML = data.map(h => {
      const vitals = [];
      if (h.presion_art) vitals.push(`<span class="vital-chip"><b>PA:</b> ${h.presion_art}</span>`);
      if (h.temperatura) vitals.push(`<span class="vital-chip"><b>T°:</b> ${h.temperatura}°C</span>`);
      if (h.frec_cardiaca) vitals.push(`<span class="vital-chip"><b>FC:</b> ${h.frec_cardiaca} bpm</span>`);
      if (h.saturacion) vitals.push(`<span class="vital-chip"><b>SatO₂:</b> ${h.saturacion}%</span>`);
      if (h.peso) vitals.push(`<span class="vital-chip"><b>Peso:</b> ${h.peso} kg</span>`);

      return `<div class="info-row">
        <div class="info-row-header">
          <span class="info-row-date">📅 ${fmtFecha(h.fecha)}</span>
          <span class="info-row-badge badge-blue">${h.diagnostico || 'Sin diagnóstico'}</span>
        </div>
        ${h.motivo ? `<div class="info-row-title">Motivo: ${h.motivo}</div>` : ''}
        ${h.notas ? `<div class="info-row-detail">📝 ${h.notas}</div>` : ''}
        ${h.plan ? `<div class="info-row-detail" style="margin-top:6px">💊 Plan: ${h.plan}</div>` : ''}
        ${vitals.length ? `<div class="info-row-vitals">${vitals.join('')}</div>` : ''}
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('historialContent').innerHTML = '<div class="empty-msg"><span class="ei">❌</span><p>Error al cargar historial</p></div>';
  }
}

// ── TRATAMIENTOS ──
async function loadTratamientos() {
  try {
    const res = await fetch('/api/portal/mis-tratamientos');
    const data = await res.json();
    const el = document.getElementById('tratamientosContent');

    if (!data.length) {
      el.innerHTML = '<div class="empty-msg"><span class="ei">💊</span><p>No hay tratamientos registrados</p></div>';
      return;
    }

    el.innerHTML = data.map(t => {
      const meds = [];
      if (t.med1) meds.push(`💊 <b>${t.med1}</b> — ${t.dosis1 || ''}`);
      if (t.med2) meds.push(`💊 <b>${t.med2}</b> — ${t.dosis2 || ''}`);
      if (t.med3) meds.push(`💊 <b>${t.med3}</b> — ${t.dosis3 || ''}`);

      return `<div class="info-row">
        <div class="info-row-header">
          <span class="info-row-date">📅 ${fmtFecha(t.fecha)}</span>
          <span class="info-row-badge badge-gold">${t.diagnostico || '—'}</span>
        </div>
        <div class="info-row-detail">${meds.join('<br>')}</div>
        ${t.duracion ? `<div class="info-row-detail" style="margin-top:6px">⏱️ Duración: ${t.duracion}</div>` : ''}
        ${t.indicaciones ? `<div class="info-row-detail" style="margin-top:6px">📋 ${t.indicaciones}</div>` : ''}
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('tratamientosContent').innerHTML = '<div class="empty-msg"><span class="ei">❌</span><p>Error al cargar tratamientos</p></div>';
  }
}

// ── CITAS ──
async function loadCitas() {
  try {
    const res = await fetch('/api/portal/mis-citas');
    const data = await res.json();
    const el = document.getElementById('citasContent');

    if (!data.length) {
      el.innerHTML = '<div class="empty-msg"><span class="ei">📅</span><p>No hay citas programadas</p></div>';
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    el.innerHTML = data.map(c => {
      const pasada = c.fecha < hoy;
      const esHoy = c.fecha === hoy;
      const badgeClass = pasada ? 'badge-gray' : esHoy ? 'badge-teal' : 'badge-gold';
      const badgeText = pasada ? 'Completada' : esHoy ? '¡Hoy!' : 'Pendiente';

      return `<div class="info-row">
        <div class="info-row-header">
          <span class="info-row-date">📅 ${fmtFecha(c.fecha)} · ${c.hora}</span>
          <span class="info-row-badge ${badgeClass}">${badgeText}</span>
        </div>
        ${c.tipo ? `<div class="info-row-title">${c.tipo}</div>` : ''}
        ${c.notas ? `<div class="info-row-detail">📝 ${c.notas}</div>` : ''}
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('citasContent').innerHTML = '<div class="empty-msg"><span class="ei">❌</span><p>Error al cargar citas</p></div>';
  }
}

// ── PESO ──
async function loadPeso() {
  try {
    const res = await fetch('/api/portal/mi-peso');
    const data = await res.json();
    const el = document.getElementById('pesoContent');

    if (!data.length) {
      el.innerHTML = '<div class="empty-msg"><span class="ei">⚖️</span><p>No hay registros de peso</p></div>';
      return;
    }

    el.innerHTML = data.map(w => {
      const imcVal = parseFloat(w.imc);
      let imcBadge = 'badge-teal', imcText = 'Normal';
      if (imcVal < 18.5) { imcBadge = 'badge-blue'; imcText = 'Bajo peso'; }
      else if (imcVal >= 25 && imcVal < 30) { imcBadge = 'badge-gold'; imcText = 'Sobrepeso'; }
      else if (imcVal >= 30) { imcBadge = 'badge-rose'; imcText = 'Obesidad'; }

      return `<div class="info-row">
        <div class="info-row-header">
          <span class="info-row-date">📅 ${fmtFecha(w.fecha)}</span>
          ${w.imc ? `<span class="info-row-badge ${imcBadge}">IMC ${w.imc} · ${imcText}</span>` : ''}
        </div>
        <div class="info-row-vitals">
          ${w.peso ? `<span class="vital-chip"><b>Peso:</b> ${w.peso} kg</span>` : ''}
          ${w.talla ? `<span class="vital-chip"><b>Talla:</b> ${w.talla} cm</span>` : ''}
          ${w.cintura ? `<span class="vital-chip"><b>Cintura:</b> ${w.cintura} cm</span>` : ''}
          ${w.cadera ? `<span class="vital-chip"><b>Cadera:</b> ${w.cadera} cm</span>` : ''}
          ${w.grasa ? `<span class="vital-chip"><b>Grasa:</b> ${w.grasa}%</span>` : ''}
          ${w.peso_meta ? `<span class="vital-chip"><b>Meta:</b> ${w.peso_meta} kg</span>` : ''}
        </div>
        ${w.plan_alimenticio ? `<div class="info-row-detail" style="margin-top:10px">🥗 ${w.plan_alimenticio}</div>` : ''}
        ${w.observaciones ? `<div class="info-row-detail" style="margin-top:4px">📝 ${w.observaciones}</div>` : ''}
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('pesoContent').innerHTML = '<div class="empty-msg"><span class="ei">❌</span><p>Error al cargar registros</p></div>';
  }
}

// ═══════════════════════════════
//        DESCARGAR PDF
// ═══════════════════════════════
function descargarPDF() {
  window.open('/api/portal/descargar-historial', '_blank');
}

// ═══════════════════════════════
//     VERIFICAR SESIÓN AL INICIO
// ═══════════════════════════════
(async function checkSession() {
  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    if (data.ok && data.tipo === 'paciente') {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('portal').style.display = 'block';
      document.getElementById('userName').textContent = data.nombre;
      document.getElementById('welcomeTitle').innerHTML = `Bienvenido, <em>${data.nombre.split(' ')[0]}</em>`;
      loadAllData();
    }
  } catch (err) { /* Sesión no activa */ }
})();
