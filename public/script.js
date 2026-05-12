/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - LÓGICA DEL SISTEMA
   Dr. José Fernando Banquett Flórez
   Archivo: script.js
═══════════════════════════════════════════════ */

// ═══════════════════════════════
//            LOGIN
// ═══════════════════════════════
async function login() {
  const u = v('lu'), p = v('lp');
  if (!u || !p) return toast('⚠️', 'Ingrese credenciales');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: u, password: p })
    });
    if (res.ok) {
      const lp = document.getElementById('loginPage');
      lp.style.transition = 'opacity .5s, transform .5s';
      lp.style.opacity    = '0';
      lp.style.transform  = 'scale(1.04)';
      setTimeout(() => {
        lp.style.display = 'none';
        document.getElementById('app').style.display = 'block';
        init();
      }, 500);
    } else {
      document.getElementById('lerr').textContent = '❌ Credenciales incorrectas';
      setTimeout(() => document.getElementById('lerr').textContent = '', 3000);
    }
  } catch (err) { toast('❌', 'Error de red'); }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').style.display !== 'none') login();
});

async function logout() { await fetch('/api/auth/logout', {method:'POST'}); location.reload(); }

// ═══════════════════════════════
//          FUNCIONES HELPER
// ═══════════════════════════════

// Obtener valor de un input por id
function v(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

// Limpiar un input por id
function sv(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

// Mostrar notificación toast
function toast(ic, msg) {
  document.getElementById('tic').textContent  = ic;
  document.getElementById('tmsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

// Calcular edad desde fecha de nacimiento
function edad(fn) {
  if (!fn) return '—';
  const d = new Date(fn), h = new Date();
  let a = h.getFullYear() - d.getFullYear();
  if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a + ' años';
}

// Formatear fecha YYYY-MM-DD → DD/MM/YYYY
function fmtFecha(f) {
  return f ? f.split('-').reverse().join('/') : '—';
}

// Generar ID único
function uid() {
  return Date.now() + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════
//          NAVEGACIÓN
// ═══════════════════════════════
function go(pg, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('pg-' + pg).classList.add('active');
  el.classList.add('active');
  syncSelects();
}

function tab(btn, id) {
  const page = btn.closest('.page');
  page.querySelectorAll('[id^="tp-"],[id^="th-"],[id^="tw-"],[id^="tt-"],[id^="ta-"]')
      .forEach(d => d.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  btn.closest('.tabs').querySelectorAll('.tab')
     .forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

// ═══════════════════════════════
//            MODAL
// ═══════════════════════════════
function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML    = html;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

// ═══════════════════════════════
//         EXPORTAR PDF
// ═══════════════════════════════
function exportPDF(tableId, title) {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><title>${title}</title>
    <style>
      body { font-family: Georgia, serif; background: #fff; color: #1a1a2e; padding: 32px; }
      h1   { font-size: 22px; color: #0b1120; margin-bottom: 4px; }
      .sub { font-size: 12px; color: #666; margin-bottom: 20px; }
      .line{ height: 2px; background: linear-gradient(90deg,#c8a55a,#4fa8a0); border: none; margin-bottom: 20px; }
      table{ width: 100%; border-collapse: collapse; font-size: 12px; }
      th   { background: #0b1120; color: #c8a55a; padding: 9px 12px; text-align: left; letter-spacing: 1px; font-size: 10px; text-transform: uppercase; }
      td   { padding: 9px 12px; border-bottom: 1px solid #eee; color: #333; }
      tr:nth-child(even) td { background: #faf8f5; }
      .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: right; }
    </style></head><body>
    <h1>Dr. José Fernando Banquett Flórez</h1>
    <div class="sub">Medicina General · Clínica IMAT Oncomédica · Montería, Córdoba</div>
    <hr class="line">
    <h2 style="font-size:16px;margin-bottom:14px;">${title}</h2>
    ${tbl.outerHTML}
    <div class="footer">Generado: ${new Date().toLocaleString('es-CO')} · MediSys Banquett</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

// ═══════════════════════════════
//           PACIENTES
// ═══════════════════════════════
async function savePac() {
  const nombre = v('pn'), cedula = v('pc');
  if (!nombre || !cedula) { toast('⚠️', 'Nombre y cédula son obligatorios'); return; }

  const body = {
    nombre, cedula, fecha_nac: v('pfn'), sexo: v('ps'), telefono: v('pt'),
    email: v('pe'), direccion: v('pd'), tipo_sangre: v('psang'),
    eps: v('peps'), alergias: v('pal'), antecedentes: v('pant'), motivo: v('pm')
  };

  try {
    const res = await fetch('/api/pacientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return toast('⚠️', err.error || 'Error al guardar');
    }
    clearPac(); await loadPacientes();
    toast('🌸', 'Paciente registrado exitosamente');
  } catch (err) { toast('❌', 'Error al guardar'); }
}

function clearPac() {
  ['pn','pc','pfn','pt','pe','pd','peps','pal','pant','pm'].forEach(id => sv(id));
  sv('ps'); sv('psang');
}

let cachedPacientes = [];

async function loadPacientes() {
  try {
    const res = await fetch('/api/pacientes');
    cachedPacientes = await res.json();
    renderPac(cachedPacientes);
    syncSelects(); dash();
  } catch (err) { toast('❌', 'Error al cargar pacientes'); }
}

function renderPac(lista) {
  const data = lista || cachedPacientes;
  const tb = document.getElementById('tbPac');
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="10"><div class="empty"><span class="ei">👥</span><p>Sin pacientes registrados</p></div></td></tr>';
    return;
  }
  tb.innerHTML = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><b>${p.nombre}</b></td>
      <td>${p.cedula}</td>
      <td>${edad(p.fecha_nac)}</td>
      <td><span class="badge br">${p.sexo || '—'}</span></td>
      <td>${p.telefono || '—'}</td>
      <td>${p.eps || '—'}</td>
      <td><span class="badge bg">${p.tipo_sangre || '—'}</span></td>
      <td>${p.alergias || '—'}</td>
      <td><div class="actions">
        <button class="btn btn-o btn-icon btn-sm" onclick="verPac('${p.id}')" title="Ver detalle">👁</button>
        <button class="btn btn-r btn-icon btn-sm" onclick="delPac('${p.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`).join('');
}

function filtPac(q) {
  renderPac(cachedPacientes.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.cedula.includes(q) ||
    (p.eps || '').toLowerCase().includes(q.toLowerCase())
  ));
}

async function delPac(id) {
  if (!confirm('¿Eliminar este paciente?')) return;
  try {
    const res = await fetch('/api/pacientes/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadPacientes();
      toast('🗑', 'Paciente eliminado');
    }
  } catch (err) { toast('❌', 'Error al eliminar'); }
}

async function verPac(id) {
  const p = cachedPacientes.find(x => x.id === parseInt(id));
  if (!p) return;
  openModal('📋 ' + p.nombre, `
    <div class="fg">
      <div class="ff"><label>Cédula</label><input readonly value="${p.cedula}"></div>
      <div class="ff"><label>Fecha Nac.</label><input readonly value="${fmtFecha(p.fecha_nac)}"></div>
      <div class="ff"><label>Sexo</label><input readonly value="${p.sexo || '—'}"></div>
      <div class="ff"><label>Tipo Sangre</label><input readonly value="${p.tipo_sangre || '—'}"></div>
      <div class="ff"><label>Teléfono</label><input readonly value="${p.telefono || '—'}"></div>
      <div class="ff"><label>Email</label><input readonly value="${p.email || '—'}"></div>
      <div class="ff"><label>EPS</label><input readonly value="${p.eps || '—'}"></div>
      <div class="ff"><label>Alergias</label><input readonly value="${p.alergias || '—'}"></div>
      <div class="ff"><label>Cód. Portal</label><input readonly value="${p.codigo_acceso || '—'}" style="color:var(--gold);font-weight:bold;letter-spacing:2px"></div>
      <div class="ff fc"><label>Antecedentes</label><textarea readonly>${p.antecedentes || '—'}</textarea></div>
      <div class="ff fc"><label>Dirección</label><input readonly value="${p.direccion || '—'}"></div>
      <div class="ff fc"><label>Motivo de Consulta</label><textarea readonly>${p.motivo || '—'}</textarea></div>
    </div>`);
}

// ═══════════════════════════════
//         HISTORIAL CLÍNICO
// ═══════════════════════════════
async function saveHist() {
  const pacId = v('hp'), fecha = v('hf');
  if (!pacId || !fecha) { toast('⚠️', 'Paciente y fecha son obligatorios'); return; }

  const paciente = cachedPacientes.find(p => p.id === parseInt(pacId));
  if (!paciente) return toast('⚠️', 'Paciente no válido');

  const body = {
    paciente_id: paciente.id, paciente_nombre: paciente.nombre, fecha,
    motivo: v('hm'), diagnostico: v('hd'), presion_art: v('hpa'), temperatura: v('ht'),
    frec_cardiaca: v('hfc'), saturacion: v('hsat'), peso: v('hpeso'), frec_resp: v('hfr'),
    notas: v('hn'), plan: v('hplan')
  };

  try {
    const res = await fetch('/api/historial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      clearHist(); await loadHistorial();
      toast('📋', 'Consulta registrada');
    }
  } catch (err) { toast('❌', 'Error al guardar'); }
}

function clearHist() {
  ['hf','hm','hd','hpa','ht','hfc','hsat','hpeso','hfr','hn','hplan'].forEach(id => sv(id));
  sv('hp');
}

let cachedHistorial = [];

async function loadHistorial() {
  try {
    const res = await fetch('/api/historial');
    cachedHistorial = await res.json();
    renderHist(cachedHistorial);
    dash();
  } catch (err) { toast('❌', 'Error al cargar historial'); }
}

function renderHist(lista) {
  const data = lista || cachedHistorial;
  const tb = document.getElementById('tbHist');
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="9"><div class="empty"><span class="ei">📋</span><p>Sin consultas</p></div></td></tr>';
    return;
  }
  tb.innerHTML = data.map(h => `
    <tr>
      <td>${fmtFecha(h.fecha)}</td>
      <td><b>${h.paciente_nombre}</b></td>
      <td>${h.motivo || '—'}</td>
      <td><span class="badge bb">${h.diagnostico || '—'}</span></td>
      <td>${h.presion_art || '—'}</td>
      <td>${h.temperatura ? h.temperatura + '°C' : '—'}</td>
      <td>${h.frec_cardiaca ? h.frec_cardiaca + ' bpm' : '—'}</td>
      <td>${h.saturacion ? h.saturacion + '%' : '—'}</td>
      <td><div class="actions">
        <button class="btn btn-o btn-icon btn-sm" onclick="verHist('${h.id}')" title="Ver">👁</button>
        <button class="btn btn-r btn-icon btn-sm" onclick="delHist('${h.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`).join('');
}

function filtHist(q) {
  renderHist(cachedHistorial.filter(h =>
    h.paciente_nombre.toLowerCase().includes(q.toLowerCase()) ||
    (h.diagnostico || '').toLowerCase().includes(q.toLowerCase())
  ));
}

async function delHist(id) {
  if (!confirm('¿Eliminar esta consulta?')) return;
  try {
    const res = await fetch('/api/historial/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadHistorial();
      toast('🗑', 'Consulta eliminada');
    }
  } catch (err) { toast('❌', 'Error al eliminar'); }
}

function verHist(id) {
  const h = cachedHistorial.find(x => x.id === parseInt(id));
  if (!h) return;
  openModal('📋 Consulta · ' + h.paciente_nombre, `
    <div class="fg">
      <div class="ff"><label>Fecha</label><input readonly value="${fmtFecha(h.fecha)}"></div>
      <div class="ff"><label>Paciente</label><input readonly value="${h.paciente_nombre}"></div>
      <div class="ff"><label>Motivo</label><input readonly value="${h.motivo || '—'}"></div>
      <div class="ff"><label>Diagnóstico</label><input readonly value="${h.diagnostico || '—'}"></div>
      <div class="ff"><label>P.A.</label><input readonly value="${h.presion_art || '—'}"></div>
      <div class="ff"><label>Temperatura</label><input readonly value="${h.temperatura ? h.temperatura + '°C' : '—'}"></div>
      <div class="ff"><label>Frec. Cardíaca</label><input readonly value="${h.frec_cardiaca ? h.frec_cardiaca + ' bpm' : '—'}"></div>
      <div class="ff"><label>Saturación</label><input readonly value="${h.saturacion ? h.saturacion + '%' : '—'}"></div>
      <div class="ff"><label>Peso</label><input readonly value="${h.peso ? h.peso + ' kg' : '—'}"></div>
      <div class="ff"><label>Frec. Resp.</label><input readonly value="${h.frec_resp ? h.frec_resp + ' rpm' : '—'}"></div>
      <div class="ff fc"><label>Notas Clínicas</label><textarea readonly>${h.notas || '—'}</textarea></div>
      <div class="ff fc"><label>Plan de Manejo</label><textarea readonly>${h.plan || '—'}</textarea></div>
    </div>`);
}

// ═══════════════════════════════
//         CONTROL DE PESO
// ═══════════════════════════════
function calcIMC() {
  const p  = parseFloat(v('wpes'));
  const t  = parseFloat(v('wtal')) / 100;
  const el = document.getElementById('imcResult');
  if (p && t && t > 0) {
    const imc = (p / (t * t)).toFixed(1);
    sv('wimc', imc);
    let cls = 'imc-normal', txt = '✅ Normal';
    if      (imc < 18.5) { cls = 'imc-bajo';  txt = '🔵 Bajo peso'; }
    else if (imc >= 25 && imc < 30) { cls = 'imc-sobre'; txt = '🟡 Sobrepeso'; }
    else if (imc >= 30)  { cls = 'imc-ob';    txt = '🔴 Obesidad'; }
    el.innerHTML = `<div class="imc-pill ${cls}">IMC ${imc} kg/m² — ${txt}</div>`;
  } else {
    sv('wimc'); el.innerHTML = '';
  }
}

function imcBadge(imc) {
  if (!imc) return '—';
  const val = parseFloat(imc);
  if (val < 18.5) return '<span class="badge bb">Bajo peso</span>';
  if (val < 25)   return '<span class="badge bt">Normal</span>';
  if (val < 30)   return '<span class="badge bg">Sobrepeso</span>';
  return '<span class="badge br">Obesidad</span>';
}

function savePeso() {
  const pacId = v('wp'), fecha = v('wf');
  if (!pacId || !fecha) { toast('⚠️', 'Paciente y fecha son obligatorios'); return; }

  const paciente = cachedPacientes.find(p => p.id === parseInt(pacId));
  if (!paciente) return toast('⚠️', 'Paciente no válido');

  const body = {
    paciente_id: paciente.id, paciente_nombre: paciente.nombre, fecha,
    peso: v('wpes'), talla: v('wtal'), imc: v('wimc'), peso_meta: v('wmeta'),
    cintura: v('wcin'), cadera: v('wcad'), grasa: v('wgra'),
    plan_alimenticio: v('wplan'), observaciones: v('wobs')
  };

  fetch('/api/peso', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(res => {
    if (res.ok) {
      clearPeso(); loadPeso();
      toast('⚖️', 'Registro de peso guardado');
    }
  }).catch(() => toast('❌', 'Error al guardar peso'));
}

function clearPeso() {
  ['wf','wpes','wtal','wimc','wmeta','wcin','wcad','wgra','wplan','wobs'].forEach(id => sv(id));
  sv('wp');
  document.getElementById('imcResult').innerHTML = '';
}

let cachedPeso = [];

async function loadPeso() {
  try {
    const res = await fetch('/api/peso');
    cachedPeso = await res.json();
    renderPeso(cachedPeso);
    dash();
  } catch (err) { toast('❌', 'Error al cargar peso'); }
}

function renderPeso(lista) {
  const data = lista || cachedPeso;
  const tb = document.getElementById('tbPeso');
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="10"><div class="empty"><span class="ei">⚖️</span><p>Sin registros</p></div></td></tr>';
    return;
  }
  tb.innerHTML = data.map(w => `
    <tr>
      <td>${fmtFecha(w.fecha)}</td>
      <td><b>${w.paciente_nombre}</b></td>
      <td>${w.peso ? w.peso + ' kg' : '—'}</td>
      <td>${w.talla ? w.talla + ' cm' : '—'}</td>
      <td>${w.imc || '—'}</td>
      <td>${w.cintura ? w.cintura + ' cm' : '—'}</td>
      <td>${w.cadera ? w.cadera + ' cm' : '—'}</td>
      <td>${w.grasa ? w.grasa + '%' : '—'}</td>
      <td>${imcBadge(w.imc)}</td>
      <td><div class="actions">
        <button class="btn btn-o btn-icon btn-sm" onclick="verPeso('${w.id}')" title="Ver">👁</button>
        <button class="btn btn-r btn-icon btn-sm" onclick="delPeso('${w.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`).join('');
}

function filtPeso(q) {
  renderPeso(cachedPeso.filter(w => w.paciente_nombre.toLowerCase().includes(q.toLowerCase())));
}

async function delPeso(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  try {
    const res = await fetch('/api/peso/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadPeso();
      toast('🗑', 'Registro eliminado');
    }
  } catch (err) { toast('❌', 'Error al eliminar'); }
}

function verPeso(id) {
  const w = cachedPeso.find(x => x.id === parseInt(id));
  if (!w) return;
  openModal('⚖️ Control de Peso · ' + w.paciente_nombre, `
    <div class="fg fg3">
      <div class="ff"><label>Fecha</label><input readonly value="${fmtFecha(w.fecha)}"></div>
      <div class="ff"><label>Peso</label><input readonly value="${w.peso ? w.peso + ' kg' : '—'}"></div>
      <div class="ff"><label>Talla</label><input readonly value="${w.talla ? w.talla + ' cm' : '—'}"></div>
      <div class="ff"><label>IMC</label><input readonly value="${w.imc || '—'}"></div>
      <div class="ff"><label>Peso Meta</label><input readonly value="${w.peso_meta ? w.peso_meta + ' kg' : '—'}"></div>
      <div class="ff"><label>Cintura</label><input readonly value="${w.cintura ? w.cintura + ' cm' : '—'}"></div>
      <div class="ff"><label>Cadera</label><input readonly value="${w.cadera ? w.cadera + ' cm' : '—'}"></div>
      <div class="ff"><label>% Grasa</label><input readonly value="${w.grasa ? w.grasa + '%' : '—'}"></div>
      <div class="ff fc"><label>Plan Alimenticio</label><textarea readonly>${w.plan_alimenticio || '—'}</textarea></div>
      <div class="ff fc"><label>Observaciones</label><textarea readonly>${w.observaciones || '—'}</textarea></div>
    </div>`);
}

// ═══════════════════════════════
//         TRATAMIENTOS
// ═══════════════════════════════
async function saveTrat() {
  const pacId = v('tp'), fecha = v('tf');
  if (!pacId || !fecha)  { toast('⚠️', 'Paciente y fecha son obligatorios'); return; }
  if (!v('tm1'))       { toast('⚠️', 'Ingresa al menos un medicamento'); return; }

  const paciente = cachedPacientes.find(p => p.id === parseInt(pacId));
  if (!paciente) return toast('⚠️', 'Paciente no válido');

  const body = {
    paciente_id: paciente.id, paciente_nombre: paciente.nombre, fecha,
    diagnostico: v('tdiag'), duracion: v('tdur'),
    med1: v('tm1'), dosis1: v('td1'), med2: v('tm2'), dosis2: v('td2'),
    med3: v('tm3'), dosis3: v('td3'), indicaciones: v('tind')
  };

  try {
    const res = await fetch('/api/tratamientos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      clearTrat(); await loadTratamientos();
      toast('💊', 'Fórmula médica guardada');
    }
  } catch (err) { toast('❌', 'Error al guardar tratamiento'); }
}

function clearTrat() {
  ['tf','tdiag','tdur','tm1','td1','tm2','td2','tm3','td3','tind'].forEach(id => sv(id));
  sv('tp');
}

let cachedTratamientos = [];

async function loadTratamientos() {
  try {
    const res = await fetch('/api/tratamientos');
    cachedTratamientos = await res.json();
    renderTrat(cachedTratamientos);
    dash();
  } catch (err) { toast('❌', 'Error al cargar tratamientos'); }
}

function renderTrat(lista) {
  const data = lista || cachedTratamientos;
  const tb = document.getElementById('tbTrat');
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="8"><div class="empty"><span class="ei">💊</span><p>Sin tratamientos</p></div></td></tr>';
    return;
  }
  tb.innerHTML = data.map(t => `
    <tr>
      <td>${fmtFecha(t.fecha)}</td>
      <td><b>${t.paciente_nombre}</b></td>
      <td><span class="badge bb">${t.diagnostico || '—'}</span></td>
      <td>${t.med1 || '—'}</td>
      <td>${t.dosis1 || '—'}</td>
      <td>${t.med2 || '—'}</td>
      <td>${t.duracion || '—'}</td>
      <td><div class="actions">
        <button class="btn btn-o btn-icon btn-sm" onclick="verTrat('${t.id}')" title="Ver">👁</button>
        <button class="btn btn-r btn-icon btn-sm" onclick="delTrat('${t.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`).join('');
}

function filtTrat(q) {
  renderTrat(cachedTratamientos.filter(t =>
    t.paciente_nombre.toLowerCase().includes(q.toLowerCase()) ||
    (t.med1 || '').toLowerCase().includes(q.toLowerCase())
  ));
}

async function delTrat(id) {
  if (!confirm('¿Eliminar este tratamiento?')) return;
  try {
    const res = await fetch('/api/tratamientos/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadTratamientos();
      toast('🗑', 'Tratamiento eliminado');
    }
  } catch (err) { toast('❌', 'Error al eliminar'); }
}

function verTrat(id) {
  const t = cachedTratamientos.find(x => x.id === parseInt(id));
  if (!t) return;
  openModal('💊 Fórmula · ' + t.paciente_nombre, `
    <div class="fg">
      <div class="ff"><label>Fecha</label><input readonly value="${fmtFecha(t.fecha)}"></div>
      <div class="ff"><label>Diagnóstico</label><input readonly value="${t.diagnostico || '—'}"></div>
      <div class="ff"><label>Duración</label><input readonly value="${t.duracion || '—'}"></div>
      <div class="ff"><label></label></div>
      <div class="ff"><label>Medicamento 1</label><input readonly value="${t.med1 || '—'}"></div>
      <div class="ff"><label>Dosis 1</label><input readonly value="${t.dosis1 || '—'}"></div>
      <div class="ff"><label>Medicamento 2</label><input readonly value="${t.med2 || '—'}"></div>
      <div class="ff"><label>Dosis 2</label><input readonly value="${t.dosis2 || '—'}"></div>
      <div class="ff"><label>Medicamento 3</label><input readonly value="${t.med3 || '—'}"></div>
      <div class="ff"><label>Dosis 3</label><input readonly value="${t.dosis3 || '—'}"></div>
      <div class="ff fc"><label>Indicaciones</label><textarea readonly>${t.indicaciones || '—'}</textarea></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-g" onclick="printTrat('${t.id}')">🖨 Imprimir Fórmula</button>
    </div>`);
}

// Imprimir fórmula médica
function printTrat(id) {
  const t = STORE.trat.find(x => x.id === id);
  if (!t) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><title>Fórmula Médica</title>
    <style>
      body { font-family: Georgia, serif; padding: 40px; color: #1a1a2e; max-width: 700px; margin: auto; }
      .header { border-bottom: 3px solid #c8a55a; padding-bottom: 16px; margin-bottom: 20px; }
      h1  { font-size: 22px; color: #0b1120; }
      .sub{ font-size: 12px; color: #666; margin-top: 4px; }
      .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #c8a55a; margin-bottom: 8px; }
      .section { margin-bottom: 16px; }
      .med { background: #faf8f5; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #c8a55a; }
      .med b { font-size: 14px; }
      .med span { color: #666; font-size: 12px; }
      .ind { background: #f0f8f7; padding: 12px; border-radius: 8px; border-left: 3px solid #4fa8a0; font-size: 13px; }
      .firma { margin-top: 48px; text-align: center; }
      .firma-line { width: 200px; height: 1px; background: #333; margin: auto; }
      .firma p { font-size: 12px; color: #333; margin-top: 6px; }
      .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 14px; }
    </style></head><body>
    <div class="header">
      <h1>Dr. José Fernando Banquett Flórez</h1>
      <div class="sub">Médico General · Reg. Médico: ____________</div>
      <div class="sub">Clínica IMAT Oncomédica · Montería, Córdoba</div>
      <div class="sub">Fecha: ${fmtFecha(t.fecha)}</div>
    </div>
    <div class="section"><h3>Paciente</h3><p><b>${t.paciente_nombre}</b></p></div>
    <div class="section"><h3>Diagnóstico</h3><p>${t.diagnostico || '—'}</p></div>
    <div class="section"><h3>Medicamentos</h3>
      ${t.med1 ? `<div class="med"><b>${t.med1}</b><br><span>${t.dosis1 || ''}</span></div>` : ''}
      ${t.med2 ? `<div class="med"><b>${t.med2}</b><br><span>${t.dosis2 || ''}</span></div>` : ''}
      ${t.med3 ? `<div class="med"><b>${t.med3}</b><br><span>${t.dosis3 || ''}</span></div>` : ''}
    </div>
    <div class="section"><h3>Duración</h3><p>${t.duracion || '—'}</p></div>
    ${t.indicaciones ? `<div class="section"><h3>Indicaciones</h3><div class="ind">${t.indicaciones}</div></div>` : ''}
    <div class="firma">
      <div class="firma-line"></div>
      <p>Dr. José Fernando Banquett Flórez</p>
      <p style="font-size:11px;color:#999;">Médico General</p>
    </div>
    <div class="footer">MediSys Banquett · ${new Date().toLocaleString('es-CO')}</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// Imprimir desde el formulario sin guardar
function imprimirFormula() {
  const pacId = v('tp'), fecha = v('tf');
  if (!pacId || !fecha || !v('tm1')) {
    toast('⚠️', 'Completa paciente, fecha y medicamento 1');
    return;
  }
  const paciente = cachedPacientes.find(p => p.id === parseInt(pacId));
  const t = {
    paciente_nombre: paciente ? paciente.nombre : '—', fecha,
    diagnostico: v('tdiag'), duracion: v('tdur'),
    med1: v('tm1'), dosis1: v('td1'),
    med2: v('tm2'), dosis2: v('td2'),
    med3: v('tm3'), dosis3: v('td3'),
    indicaciones: v('tind')
  };
  cachedTratamientos.push({ ...t, id: 'temp' });
  printTrat('temp');
  cachedTratamientos.pop();
}

// ═══════════════════════════════
//           CITAS
// ═══════════════════════════════
async function saveCita() {
  const pacId = v('cp'), fecha = v('cf'), hora = v('ch');
  if (!pacId || !fecha || !hora) {
    toast('⚠️', 'Paciente, fecha y hora son obligatorios');
    return;
  }
  const paciente = cachedPacientes.find(p => p.id === parseInt(pacId));
  if (!paciente) return toast('⚠️', 'Paciente no válido');

  const btn = document.querySelector('#ta-nuevo button.btn-g');
  const btnOriginal = btn.innerHTML;
  btn.innerHTML = 'Guardando y enviando correo... ⏳';
  btn.disabled = true;

  try {
    const res = await fetch('/api/citas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: paciente.id, paciente_nombre: paciente.nombre,
        fecha, hora, tipo: v('ct'), notas: v('cn')
      })
    });
    if (res.ok) {
      const data = await res.json();
      clearCita(); await loadCitas();
      toast('📅', data.emailEnviado ? 'Cita guardada y correo enviado' : 'Cita guardada (sin email)');
    }
  } catch (err) { toast('❌', 'Error al agendar cita'); }
  btn.innerHTML = btnOriginal;
  btn.disabled = false;
}

function clearCita() {
  ['cf','ch','cn'].forEach(id => sv(id));
  sv('cp'); sv('ct');
}

let cachedCitas = [];

async function loadCitas() {
  try {
    const res = await fetch('/api/citas');
    cachedCitas = await res.json();
    renderCita(cachedCitas);
    dash();
  } catch (err) { toast('❌', 'Error al cargar citas'); }
}

function renderCita(lista) {
  const data = (lista || cachedCitas)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const tb  = document.getElementById('tbCita');
  const hoy = new Date().toISOString().slice(0, 10);

  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="empty"><span class="ei">📅</span><p>Sin citas</p></div></td></tr>';
    return;
  }
  tb.innerHTML = data.map(c => {
    const pasada  = c.fecha < hoy;
    const esHoy   = c.fecha === hoy;
    const badge   = pasada  ? '<span class="badge bw">Completada</span>'
                  : esHoy   ? '<span class="badge bt">Hoy</span>'
                  :           '<span class="badge bg">Pendiente</span>';
    return `<tr>
      <td>${fmtFecha(c.fecha)}</td>
      <td><b>${c.hora}</b></td>
      <td><b>${c.paciente_nombre}</b></td>
      <td><span class="badge bg">${c.tipo || '—'}</span></td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.notas || '—'}</td>
      <td>${badge}</td>
      <td><div class="actions">
        <button class="btn btn-r btn-icon btn-sm" onclick="delCita('${c.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}

function filtCita(q) {
  renderCita(cachedCitas.filter(c =>
    c.paciente_nombre.toLowerCase().includes(q.toLowerCase()) ||
    (c.tipo || '').toLowerCase().includes(q.toLowerCase())
  ));
}

async function delCita(id) {
  if (!confirm('¿Eliminar y enviar correo de cancelación?')) return;
  try {
    const res = await fetch('/api/citas/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadCitas();
      toast('🗑', 'Cita eliminada y notificada');
    }
  } catch (err) { toast('❌', 'Error al cancelar'); }
}

// ═══════════════════════════════
//       SINCRONIZAR SELECTS
// ═══════════════════════════════
function syncSelects() {
  ['hp','wp','tp','cp'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML =
      '<option value="">Seleccionar paciente</option>' +
      cachedPacientes
        .map(p => `<option value="${p.id}" ${p.id.toString() === cur ? 'selected' : ''}>${p.nombre}</option>`)
        .join('');
  });
}

// ═══════════════════════════════
//          DASHBOARD
// ═══════════════════════════════
function dash() {
  document.getElementById('s1').textContent  = cachedPacientes.length;
  document.getElementById('s2').textContent  = cachedCitas.length;
  document.getElementById('s3').textContent  = cachedPeso.length;
  document.getElementById('s4').textContent  = cachedTratamientos.length;
  document.getElementById('nb1').textContent = cachedPacientes.length;
  document.getElementById('nb2').textContent = cachedHistorial.length;
  document.getElementById('nb3').textContent = cachedPeso.length;
  document.getElementById('nb4').textContent = cachedTratamientos.length;
  document.getElementById('nb5').textContent = cachedCitas.length;

  const dp = document.getElementById('d-pacs');
  dp.innerHTML = cachedPacientes.length
    ? cachedPacientes.slice(0, 5).map(p => `
        <div class="dash-row">
          <div class="dash-av">👤</div>
          <div class="dash-info">
            <h4>${p.nombre}</h4>
            <p>${p.sexo || '—'} · ${p.eps || 'Sin EPS'}</p>
          </div>
          <span class="badge bg">${p.tipo_sangre || '—'}</span>
        </div>`).join('')
    : '<div class="empty"><span class="ei">👥</span><p>Sin pacientes aún</p></div>';

  const dc   = document.getElementById('d-citas');
  const hoy  = new Date().toISOString().slice(0, 10);
  const prox = cachedCitas
    .filter(c => c.fecha >= hoy)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, 5);

  dc.innerHTML = prox.length
    ? prox.map(c => `
        <div class="dash-row">
          <div class="dash-av">📅</div>
          <div class="dash-info">
            <h4>${c.paciente_nombre}</h4>
            <p>${fmtFecha(c.fecha)} · ${c.hora}</p>
          </div>
          <span class="badge bt">${c.tipo || 'Consulta'}</span>
        </div>`).join('')
    : '<div class="empty"><span class="ei">📅</span><p>Sin citas próximas</p></div>';
}

// ═══════════════════════════════
//           INICIALIZAR
// ═══════════════════════════════
async function init() {
  const d = new Date();
  document.getElementById('fechaHoy').textContent =
    d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    if (data.ok && data.tipo === 'admin') {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      await Promise.all([
        loadPacientes(), loadHistorial(), loadTratamientos(), loadPeso(), loadCitas()
      ]);
    }
  } catch (err) { /* Not logged in */ }
}

init();
