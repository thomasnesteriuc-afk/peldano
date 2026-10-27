/**
 * PESTAÑA-CALENTAR.JS
 * Calentamiento científico en 4 fases (cardio → movilidad → activación → dinámico),
 * con timer visual por ejercicio (McGill 2014, Behm 2015).
 *
 * ⚠️ NOTA DE TRANSPARENCIA (Guía Maestra, sección 18: "nunca cambies en silencio"):
 * Esta pestaña BLOQUEA el paso a Entrenar hasta completarla (ver intentarEmpezarSesion()
 * en index.html). Esto lo pidió explícitamente el CEO en el Encargo Final, pero contradice
 * el principio de "mínima fricción antes de entrenar" de la propia Guía Maestra (sección 3
 * y sección 16, que lista "fricción innecesaria antes de entrenar" como algo a NUNCA construir).
 * Se construyó igual porque así se decidió explícitamente, no por descuido.
 */

const FASES_CALENTAR = [
  { id:'cardio', icono:'🏃', nombre:'Cardio', ejercicios:[
      {nombre:'Jumping Jacks', segundos:30},
      {nombre:'High Knees', segundos:30}
  ]},
  { id:'movilidad', icono:'🔄', nombre:'Movilidad', ejercicios:[
      {nombre:'Círculos de brazo', segundos:30},
      {nombre:'Círculos de cadera (rodilla al pecho)', segundos:30}
  ]},
  { id:'activacion', icono:'⚡', nombre:'Activación', ejercicios:[
      {nombre:'Flexiones escapulares', segundos:30}
  ]},
  { id:'dinamico', icono:'🤸', nombre:'Dinámico', ejercicios:[
      {nombre:'Inchworms', segundos:30}
  ]}
];

let calentarProgresoHoy = null;

function calentarEstadoHoy(){
  const hoy = new Date().toDateString();
  if(!calentarProgresoHoy || calentarProgresoHoy.fecha !== hoy){
    calentarProgresoHoy = { fecha: hoy, hechos: {} };
  }
  return calentarProgresoHoy;
}

// ¿Ya se completaron las 4 fases HOY? La usa index.html para decidir si te deja entrar a Entrenar.
function calentamientoHechoHoy(){
  return !!(typeof stats !== 'undefined' && stats && stats.calentamientoFecha === new Date().toDateString());
}

function todasLasFasesCompletas(estado){
  return FASES_CALENTAR.every(f => f.ejercicios.every((_, i) => estado.hechos[f.id + '_' + i]));
}

function marcarEjercicioCalentar(faseId, idx){
  const estado = calentarEstadoHoy();
  estado.hechos[faseId + '_' + idx] = true;
  if(todasLasFasesCompletas(estado)){
    if(typeof stats !== 'undefined' && stats){
      stats.calentamientoFecha = new Date().toDateString();
      try{ if(typeof saveState === 'function') saveState(); }catch(e){ /* no bloquear por esto */ }
    }
  }
  const panel = document.getElementById('tab-calentar');
  if(panel) panel.innerHTML = renderTabCalentar();
}

function iniciarTimerCalentar(btn, faseId, idx, segundos){
  const fila = btn.closest('.calentar-ejercicio');
  const ring = fila ? fila.querySelector('.timer-ring') : null;
  const circunferencia = 2 * Math.PI * 20;
  btn.disabled = true;
  btn.textContent = '…';
  if(ring){
    ring.style.transition = 'none';
    ring.style.strokeDashoffset = circunferencia;
    void ring.getBoundingClientRect(); // forzar reflow para que el transition de abajo re-aplique
    ring.style.transition = 'stroke-dashoffset ' + segundos + 's linear';
    ring.style.strokeDashoffset = '0';
  }
  setTimeout(() => { marcarEjercicioCalentar(faseId, idx); }, segundos * 1000);
}

function renderTabCalentar(){
  const estado = calentarEstadoHoy();
  const circunferencia = (2 * Math.PI * 20).toFixed(1);
  const completo = todasLasFasesCompletas(estado);

  let html = '<div style="padding:16px; color:var(--text);">';
  html += '<div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">';
  html += '<p style="font-weight:700; color:var(--accent-strong); margin:0 0 6px;">🔥 CALENTAMIENTO DE HOY</p>';
  html += '<p style="font-size:13px; color:var(--text-dim); margin:0;">4 fases, ~5 minutos. Marcá cada ejercicio y después pasás a Entrenar.</p>';
  html += '</div>';

  FASES_CALENTAR.forEach(fase => {
    const hechosFase = fase.ejercicios.filter((_, i) => estado.hechos[fase.id + '_' + i]).length;
    const completaFase = hechosFase === fase.ejercicios.length;
    html += '<div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:14px;' + (completaFase ? ' border:1.5px solid var(--accent);' : '') + '">';
    html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">';
    html += '<span style="font-weight:700;">' + fase.icono + ' ' + fase.nombre + '</span>';
    html += '<span style="font-size:12px; color:' + (completaFase ? 'var(--accent)' : 'var(--text-dim)') + '; font-weight:600;">' + (completaFase ? '✓ Completado' : (hechosFase + '/' + fase.ejercicios.length)) + '</span>';
    html += '</div>';

    fase.ejercicios.forEach((ej, i) => {
      const hecho = !!estado.hechos[fase.id + '_' + i];
      html += '<div class="calentar-ejercicio" style="display:flex; align-items:center; gap:12px; padding:8px 0;' + (i > 0 ? ' border-top:1px solid var(--line);' : '') + '">';
      html += '<svg width="48" height="48" viewBox="0 0 48 48" style="flex-shrink:0;">' +
        '<circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg)" stroke-width="4"/>' +
        '<circle class="timer-ring" cx="24" cy="24" r="20" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="' + circunferencia + '" stroke-dashoffset="' + (hecho ? '0' : circunferencia) + '" stroke-linecap="round" transform="rotate(-90 24 24)"/>' +
        '</svg>';
      html += '<div style="flex:1;"><div style="font-weight:600; font-size:14px;">' + ej.nombre + '</div><div style="font-size:12px; color:var(--text-dim);">' + ej.segundos + 's</div></div>';
      html += hecho
        ? '<span style="color:var(--accent); font-weight:700; font-size:18px;">✓</span>'
        : '<button class="ghost btn-calentar-start" data-fase="' + fase.id + '" data-idx="' + i + '" data-seg="' + ej.segundos + '" style="margin:0; padding:8px 14px;">▶ Empezar</button>';
      html += '</div>';
    });
    html += '</div>';
  });

  html += completo
    ? '<button class="primary" id="btn-ir-entrenar" style="width:100%; padding:16px; font-size:16px;">➜ Ir a Entrenar</button>'
    : '<p style="text-align:center; color:var(--text-dim); font-size:13px;">Completá las 4 fases para desbloquear Entrenar.</p>';

  html += '</div>';

  // Los listeners se atan después de que el caller haga innerHTML = renderTabCalentar().
  setTimeout(() => {
    const panel = document.getElementById('tab-calentar');
    if(!panel) return;
    panel.querySelectorAll('.btn-calentar-start').forEach(btn => {
      btn.addEventListener('click', () => iniciarTimerCalentar(btn, btn.dataset.fase, parseInt(btn.dataset.idx, 10), parseInt(btn.dataset.seg, 10)));
    });
    const irBtn = document.getElementById('btn-ir-entrenar');
    if(irBtn) irBtn.addEventListener('click', () => {
      const b = document.querySelector('[data-tab="tab-rutina"]');
      if(b) b.click();
    });
  }, 0);

  return html;
}

console.log('✅ pestana-calentar.js cargado');
