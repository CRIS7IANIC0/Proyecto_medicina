/* ═══════════════════════════════════════════════
   MEDISYS BANQUETT - GENERADOR DE PDF
   Archivo: utils/pdf-generator.js
═══════════════════════════════════════════════ */

const PDFDocument = require('pdfkit');

// Colores del sistema
const COLORS = {
  night: '#0b1120',
  gold: '#c8a55a',
  gold2: '#b8953f',
  teal: '#4fa8a0',
  text: '#333333',
  textLight: '#666666',
  border: '#e0d8cc',
  bg: '#f9f6f1'
};

/**
 * Genera un PDF profesional del historial clínico del paciente.
 * @param {Object} paciente - Datos del paciente
 * @param {Array} historial - Consultas del paciente
 * @param {Array} tratamientos - Tratamientos del paciente
 * @param {Array} controlPeso - Registros de peso del paciente
 * @returns {PDFDocument} - Documento PDF
 */
function generarHistorialPDF(paciente, historial, tratamientos, controlPeso) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Historial Clínico - ${paciente.nombre}`,
      Author: 'Dr. José Fernando Banquett Flórez',
      Subject: 'Historial Clínico del Paciente',
      Creator: 'MediSys Banquett'
    }
  });

  // ═══════════════════════════════
  //        ENCABEZADO
  // ═══════════════════════════════
  doc.rect(0, 0, doc.page.width, 100).fill(COLORS.night);

  doc.fontSize(20).font('Helvetica-Bold')
     .fillColor(COLORS.gold)
     .text('Dr. José Fernando Banquett Flórez', 50, 30);

  doc.fontSize(9).font('Helvetica')
     .fillColor('#999999')
     .text('Medicina General · Montería, Córdoba', 50, 55)
     .text(`Generado: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, 70);

  doc.fillColor(COLORS.gold)
     .rect(50, 90, 120, 2).fill(COLORS.gold);

  // ═══════════════════════════════
  //     DATOS DEL PACIENTE
  // ═══════════════════════════════
  let y = 120;
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.night)
     .text('Datos del Paciente', 50, y);

  y += 6;
  doc.moveTo(50, y + 16).lineTo(562, y + 16).strokeColor(COLORS.border).lineWidth(0.5).stroke();

  y += 26;
  const datosLeft = [
    ['Nombre', paciente.nombre],
    ['Cédula', paciente.cedula],
    ['Fecha Nac.', formatearFecha(paciente.fecha_nac)],
    ['Sexo', paciente.sexo || '—'],
  ];
  const datosRight = [
    ['Tipo Sangre', paciente.tipo_sangre || '—'],
    ['EPS', paciente.eps || '—'],
    ['Teléfono', paciente.telefono || '—'],
    ['Email', paciente.email || '—'],
  ];

  datosLeft.forEach((d, i) => {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight).text(d[0], 50, y + i * 20);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text).text(d[1], 130, y + i * 20);
  });
  datosRight.forEach((d, i) => {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight).text(d[0], 310, y + i * 20);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text).text(d[1], 400, y + i * 20);
  });

  y += 90;
  if (paciente.alergias) {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight).text('Alergias', 50, y);
    doc.fontSize(10).font('Helvetica').fillColor('#c07b7f').text(paciente.alergias, 130, y);
    y += 20;
  }
  if (paciente.antecedentes) {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight).text('Antecedentes', 50, y);
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.text).text(paciente.antecedentes, 130, y, { width: 420 });
    y += 30;
  }

  // ═══════════════════════════════
  //     HISTORIAL DE CONSULTAS
  // ═══════════════════════════════
  if (historial.length > 0) {
    y += 10;
    if (y > 650) { doc.addPage(); y = 50; }

    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.night)
       .text('Historial de Consultas', 50, y);
    y += 20;
    doc.moveTo(50, y).lineTo(562, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 10;

    historial.forEach((h, idx) => {
      if (y > 660) { doc.addPage(); y = 50; }

      // Fondo alternado
      if (idx % 2 === 0) {
        doc.rect(45, y - 4, 522, 80).fill(COLORS.bg);
      }

      doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.night)
         .text(`${formatearFecha(h.fecha)}`, 50, y);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gold2)
         .text(h.diagnostico || 'Sin diagnóstico', 150, y);

      y += 16;
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);

      const vitals = [];
      if (h.presion_art) vitals.push(`PA: ${h.presion_art}`);
      if (h.temperatura) vitals.push(`T°: ${h.temperatura}°C`);
      if (h.frec_cardiaca) vitals.push(`FC: ${h.frec_cardiaca} bpm`);
      if (h.saturacion) vitals.push(`SatO₂: ${h.saturacion}%`);
      if (h.peso) vitals.push(`Peso: ${h.peso} kg`);
      if (h.frec_resp) vitals.push(`FR: ${h.frec_resp} rpm`);

      if (vitals.length) {
        doc.text(`Signos vitales: ${vitals.join(' · ')}`, 50, y, { width: 500 });
        y += 14;
      }
      if (h.motivo) {
        doc.text(`Motivo: ${h.motivo}`, 50, y, { width: 500 });
        y += 14;
      }
      if (h.plan) {
        doc.text(`Plan: ${h.plan}`, 50, y, { width: 500 });
        y += 14;
      }
      y += 12;
    });
  }

  // ═══════════════════════════════
  //       TRATAMIENTOS
  // ═══════════════════════════════
  if (tratamientos.length > 0) {
    y += 10;
    if (y > 650) { doc.addPage(); y = 50; }

    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.night)
       .text('Tratamientos Prescritos', 50, y);
    y += 20;
    doc.moveTo(50, y).lineTo(562, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 10;

    tratamientos.forEach((t, idx) => {
      if (y > 660) { doc.addPage(); y = 50; }

      if (idx % 2 === 0) {
        doc.rect(45, y - 4, 522, 60).fill(COLORS.bg);
      }

      doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.night)
         .text(`${formatearFecha(t.fecha)}`, 50, y);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gold2)
         .text(t.diagnostico || '', 150, y);
      y += 16;

      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text);
      if (t.med1) doc.text(`💊 ${t.med1} — ${t.dosis1 || ''}`, 50, y, { width: 500 }), y += 13;
      if (t.med2) doc.text(`💊 ${t.med2} — ${t.dosis2 || ''}`, 50, y, { width: 500 }), y += 13;
      if (t.med3) doc.text(`💊 ${t.med3} — ${t.dosis3 || ''}`, 50, y, { width: 500 }), y += 13;
      if (t.duracion) doc.fillColor(COLORS.textLight).text(`Duración: ${t.duracion}`, 50, y), y += 13;
      y += 10;
    });
  }

  // ═══════════════════════════════
  //     CONTROL DE PESO
  // ═══════════════════════════════
  if (controlPeso.length > 0) {
    y += 10;
    if (y > 650) { doc.addPage(); y = 50; }

    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.night)
       .text('Evolución de Peso', 50, y);
    y += 20;
    doc.moveTo(50, y).lineTo(562, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 10;

    // Cabecera de tabla
    const cols = ['Fecha', 'Peso', 'Talla', 'IMC', 'Cintura', 'Cadera', '% Grasa'];
    const colX = [50, 130, 195, 260, 325, 395, 465];

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.gold2);
    cols.forEach((c, i) => doc.text(c, colX[i], y));
    y += 16;

    controlPeso.forEach((w, idx) => {
      if (y > 700) { doc.addPage(); y = 50; }

      if (idx % 2 === 0) {
        doc.rect(45, y - 3, 522, 16).fill(COLORS.bg);
      }

      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text);
      const vals = [formatearFecha(w.fecha), w.peso ? w.peso + ' kg' : '—', w.talla ? w.talla + ' cm' : '—', w.imc || '—', w.cintura ? w.cintura + ' cm' : '—', w.cadera ? w.cadera + ' cm' : '—', w.grasa ? w.grasa + '%' : '—'];
      vals.forEach((val, i) => doc.text(val, colX[i], y));
      y += 16;
    });
  }

  // ═══════════════════════════════
  //        PIE DE PÁGINA
  // ═══════════════════════════════
  y += 30;
  if (y > 680) { doc.addPage(); y = 50; }

  doc.moveTo(50, y).lineTo(562, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
  y += 14;

  doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight)
     .text('Este documento contiene información médica confidencial protegida por la Ley 1581 de 2012 (Protección de Datos Personales).', 50, y, { width: 512, align: 'center' });

  y += 26;
  doc.moveTo(200, y).lineTo(400, y).strokeColor(COLORS.text).lineWidth(0.5).stroke();
  y += 6;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.night)
     .text('Dr. José Fernando Banquett Flórez', 50, y, { width: 512, align: 'center' });
  y += 14;
  doc.fontSize(8).font('Helvetica').fillColor(COLORS.textLight)
     .text('Médico General', 50, y, { width: 512, align: 'center' });

  return doc;
}

function formatearFecha(f) {
  if (!f) return '—';
  const parts = f.split('-');
  if (parts.length !== 3) return f;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

module.exports = { generarHistorialPDF };
