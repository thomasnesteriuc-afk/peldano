/**
 * FINISHER.JS — Finisher de acondicionamiento (spec 23/9, REEMPLAZA la versión opcional anterior)
 *
 * - OBLIGATORIO en todas las sesiones de calistenia: se puede saltear con un toque, pero se registra.
 * - 8-10 min, 2 ejercicios de movimiento alternados, EMOM con timer visible.
 * - Arranca solo al marcar el último ejercicio de fuerza de la sesión.
 * - Rota entre sesiones (por cantidad de sesiones registradas + "Cambiar ejercicios").
 * - Duración según el tiempo elegido para el día (tiempo-sesion.js): 10 min; 5 min si hay que recortar; se elimina en 30 min.
 *
 * Depende de globals de index.html: stats, saveState, dayMarks, isUnilateral, esLunes, renderDay.
 */

// int: 1 = suave · 2 = media · 3 = alta.
const FIN_EJ = {
  soga:      { n:'Soga (o saltos en el lugar)', int:1, cue:'Saltos cortos y livianos, muñecas sueltas, aterrizá en la punta de los pies.' },
  jacks:     { n:'Jumping jacks', int:1, cue:'Ritmo parejo, brazos completos arriba, aterrizaje suave.' },
  highknees: { n:'Rodillas al pecho (high knees)', int:2, cue:'Corrida en el lugar subiendo las rodillas a la cadera, ritmo alto.' },
  mountain:  { n:'Mountain climbers', int:2, cue:'Plancha alta, cadera baja, llevá una rodilla al pecho y alterná rápido.' },
  skaters:   { n:'Patinadores (saltos laterales)', int:2, cue:'Saltá de un pie al otro hacia el costado, frená y aterrizá firme.' },
  burpee:    { n:'Burpees', int:3, cue:'Abajo, plancha, volvé y saltá. Ritmo sostenible: si perdés la forma, hacelos sin salto.' },
  jumpsquat: { n:'Jump squats', int:3, cue:'Sentadilla y salto explosivo, aterrizaje blando con las rodillas en línea con los pies.' }
};
const FIN_PARES = [
  ['soga', 'burpee'], ['jumpsquat', 'mountain'], ['skaters', 'burpee'],
  ['highknees', 'jumpsquat'], ['soga', 'mountain'], ['jacks', 'burpee']
];

// Duración del finisher: la decide el plan de tiempo del día (tiempo-sesion.js): 10 min, 5 si hay que recortar, 0 = sin finisher.
function finisherMinutos(){
  const p = (typeof planTiempoHoy === 'function') ? planTiempoHoy() : null;
  return p ? p.finisher : 10;
}
function finisherConfig(){
  return { minutos:finisherMinutos(), trabajo:40, descanso:20, pares:FIN_PARES };
}
// Rota por sesiones registradas + offset manual, igual que los accesorios.
function finisherPlanHoy(){
  const cfg = finisherConfig();
  const idx = (((stats.sessions || 0) + (stats.varOffset || 0)) % cfg.pares.length + cfg.pares.length) % cfg.pares.length;
  const par = cfg.pares[idx];
  return { minutos:cfg.minutos, trabajo:cfg.trabajo, descanso:cfg.descanso, idx, a:FIN_EJ[par[0]], b:FIN_EJ[par[1]] };
}

// ---- estado del día (persistido en stats para sobrevivir a los re-render) ----
function finEstadoHoy(){
  const hoy = new Date().toDateString();
  if(!stats.finisherHoy || stats.finisherHoy.fecha !== hoy) stats.finisherHoy = { fecha:hoy, estado:'pendiente', auto:false };
  return stats.finisherHoy;
}
function finLog(estado, plan){
  if(!Array.isArray(stats.finisherLog)) stats.finisherLog = [];
  stats.finisherLog.push({ f:new Date().toISOString(), e:estado, par:[plan.a.n, plan.b.n], min:plan.minutos });
  if(stats.finisherLog.length > 90) stats.finisherLog.shift();
  if(estado === 'hecho') stats.finisherHechos = (stats.finisherHechos || 0) + 1;
  else stats.finisherSalteados = (stats.finisherSalteados || 0) + 1;   // salteado u omitido: se cuentan igual
  try{ if(typeof saveState === 'function') saveState(); }catch(e){ /* no bloquear por esto */ }
}

// Saltear con un toque — queda registrado.
function finisherSaltear(){
  const st = finEstadoHoy();
  if(st.estado !== 'pendiente') return;
  finLog('salteado', finisherPlanHoy());
  st.estado = 'salteado';
  finCerrarOverlay();
  if(typeof renderDay === 'function') renderDay();
}
function finisherCompletado(){
  const st = finEstadoHoy();
  if(st.estado === 'hecho') return;
  finLog('hecho', finisherPlanHoy());
  st.estado = 'hecho';
  if(typeof renderDay === 'function') renderDay();
}
// Al registrar la sesión: si el finisher quedó sin tocar, se anota como "omitido" y se rearma para la próxima.
function finisherCerrarSesion(){
  const st = finEstadoHoy();
  if(st.estado === 'pendiente' && finisherMinutos() > 0) finLog('omitido', finisherPlanHoy());   // sin finisher hoy: no se anota como omitido
  stats.finisherHoy = { fecha:new Date().toDateString(), estado:'pendiente', auto:false };
  finCerrarOverlay();
}

// ¿Están marcados todos los ejercicios de fuerza de la sesión? (los unilaterales, los dos lados)
function finisherFuerzaCompleta(session){
  if(!session || !session.length) return false;
  // Solo cuentan los ejercicios que de verdad se dibujan (los que tienen botones de "cómo te fue").
  // Los de dosis fija (salto, soga) no tienen botones de marca: no cuentan.
  const visibles = buildBlocks(session).reduce((acc, b) => acc.concat(b.exs), []).filter(ex => !ex._libre && ex.pattern !== 'power_legs');
  if(!visibles.length) return false;
  return visibles.every(ex => (typeof isUnilateral === 'function' && isUnilateral(ex))
    ? (dayMarks[ex.name + '::L'] && dayMarks[ex.name + '::R'])
    : dayMarks[ex.name]);
}

// ---- tarjeta dentro de la sesión ----
function renderFinisher(c, session){
  if(finisherMinutos() <= 0) return;                  // con poco tiempo (30 min) el finisher se elimina
  const plan = finisherPlanHoy();
  const st = finEstadoHoy();
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.id = 'finisher-card';
  card.style.cssText = 'margin-top:18px; border:1.5px solid var(--accent);';
  const fila = (letra, ej) => '<div style="margin:8px 0;"><div style="font-weight:700; font-size:15px;">' + letra + ' · ' + ej.n + '</div><div style="font-size:12.5px; color:var(--text-dim); margin-top:2px;">' + ej.cue + '</div></div>';
  let estadoHTML;
  if(st.estado === 'hecho'){
    estadoHTML = '<div style="font-weight:700; color:var(--accent-strong);">✓ Finisher hecho</div>';
  } else if(st.estado === 'salteado'){
    estadoHTML = '<div style="font-size:13.5px; color:var(--text-dim); margin-bottom:8px;">Lo salteaste: quedó registrado.</div>' +
      '<button class="ghost" id="fin-igual" style="width:100%; margin:0;">Hacerlo igual</button>';
  } else {
    estadoHTML = '<div style="font-size:12.5px; color:var(--text-faint); margin-bottom:8px;">Arranca solo cuando marques el último ejercicio de arriba.</div>' +
      '<button class="primary" id="fin-start" style="width:100%; margin:0 0 8px;">▶ Empezar finisher</button>' +
      '<button class="ghost" id="fin-skip" style="width:100%; margin:0;">Saltear (queda registrado)</button>';
  }
  card.innerHTML =
    '<div style="display:flex; justify-content:space-between; align-items:baseline;">' +
      '<span style="font-size:11.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); font-weight:700;">Finisher · ' + plan.minutos + ' min</span>' +
      '<span style="font-size:12.5px; color:var(--text-dim); font-weight:600;">EMOM alternado</span>' +
    '</div>' +
    '<p style="font-size:13px; color:var(--text-dim); margin:6px 0 4px; line-height:1.45;">' +
      'Cada minuto: ' + plan.trabajo + ' s de trabajo + ' + plan.descanso + ' s de descanso, alternando los dos ejercicios. ' + plan.minutos + ' rondas.' +
    '</p>' +
    fila('A', plan.a) + fila('B', plan.b) + estadoHTML;
  c.appendChild(card);
  const q = id => card.querySelector('#' + id);
  if(q('fin-start')) q('fin-start').addEventListener('click', () => finisherAbrir(false));
  if(q('fin-skip')) q('fin-skip').addEventListener('click', finisherSaltear);
  if(q('fin-igual')) q('fin-igual').addEventListener('click', () => { finEstadoHoy().estado = 'pendiente'; finisherAbrir(false); });

  // Arranque automático: recién cuando termina el último bloque de fuerza (una sola vez por sesión).
  if(st.estado === 'pendiente' && !st.auto && finisherFuerzaCompleta(session)){
    st.auto = true;
    setTimeout(() => finisherAbrir(true), 350);
  }
}

// ---- timer del finisher (pantalla completa, tiempo visible) ----
let finTimer = null;
function finSegmentos(plan){
  const seg = [{ tipo:'prep', dur:5, ronda:0, ej:plan.a }];
  for(let r = 1; r <= plan.minutos; r++){
    const ej = (r % 2 === 1) ? plan.a : plan.b;
    const sig = (r % 2 === 1) ? plan.b : plan.a;
    seg.push({ tipo:'work', dur:plan.trabajo, ronda:r, ej, sig });
    if(r < plan.minutos) seg.push({ tipo:'rest', dur:plan.descanso, ronda:r, ej:sig, sig });
  }
  return seg;
}
function finFmt(sec){ sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
function finOverlay(){
  let ov = document.getElementById('fin-ov');
  if(!ov){ ov = document.createElement('div'); ov.id = 'fin-ov'; ov.className = 't-overlay'; document.body.appendChild(ov); }
  return ov;
}
function finCerrarOverlay(){
  if(finTimer && finTimer.int) clearInterval(finTimer.int);
  finTimer = null;
  const ov = document.getElementById('fin-ov'); if(ov) ov.classList.remove('open');
}
function finisherAbrir(auto){
  finCerrarOverlay();
  const plan = finisherPlanHoy();
  const seg = finSegmentos(plan);
  const total = seg.reduce((s, x) => s + x.dur, 0);
  finTimer = { plan, seg, total, acum:0, t0:Date.now(), corriendo:true, ultimoIdx:-1, terminado:false, auto:!!auto,
    int:setInterval(finTick, 250) };
  finOverlay().classList.add('open');
  finTick();
}
function finElapsed(){ const t = finTimer; return t.acum + (t.corriendo ? (Date.now() - t.t0) / 1000 : 0); }
function finTick(){
  const t = finTimer; if(!t) return;
  const el = finElapsed();
  if(el >= t.total && !t.terminado){
    t.terminado = true; t.corriendo = false; clearInterval(t.int); t.int = null;
    if(typeof vibrar === 'function') vibrar([80, 60, 80, 60, 200]);
    finPintar(); return;
  }
  let idx = 0, ini = 0;
  for(let i = 0; i < t.seg.length; i++){ if(el < ini + t.seg[i].dur){ idx = i; break; } ini += t.seg[i].dur; idx = i; }
  const cambio = (idx !== t.ultimoIdx);
  if(cambio){ t.ultimoIdx = idx; if(typeof vibrar === 'function') vibrar([40, 60, 120]); }
  t.idx = idx; t.leftSeg = t.seg[idx].dur - (el - ini);
  // Se repinta entero solo al cambiar de tramo (o pausar); el resto del tiempo solo se
  // actualizan los números, para no reemplazar los botones mientras el usuario los toca.
  if(cambio || !t.pintado) finPintar(); else finNumeros();
}
function finNumeros(){
  const t = finTimer; if(!t || t.terminado) return;
  const n = document.getElementById('fin-num'); if(n) n.textContent = finFmt(t.leftSeg);
  const r = document.getElementById('fin-resta'); if(r) r.textContent = 'Restan ' + finFmt(t.total - finElapsed());
}
function finPintar(){
  const t = finTimer; if(!t) return;
  t.pintado = true;
  const ov = finOverlay();
  const p = t.plan;
  let cuerpo;
  if(t.terminado){
    cuerpo =
      '<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center;">' +
        '<div style="font-size:44px;">✓</div>' +
        '<div style="font-family:var(--font-display); font-weight:700; font-size:26px;">Finisher terminado</div>' +
        '<div style="font-size:14px; color:var(--text-dim);">' + p.minutos + ' min · ' + p.a.n + ' + ' + p.b.n + '</div>' +
      '</div>' +
      '<button class="primary" id="fin-ok" style="width:100%;">Listo, registrar</button>';
  } else {
    const s = t.seg[t.idx || 0];
    const enPrep = s.tipo === 'prep', enDesc = s.tipo === 'rest';
    const color = enDesc || enPrep ? 'var(--text-dim)' : 'var(--accent)';
    const fase = enPrep ? 'Prepárate' : (enDesc ? 'Descanso' : 'Trabajo');
    const resta = t.total - finElapsed();
    cuerpo =
      '<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; text-align:center;">' +
        '<p style="font-size:13px; letter-spacing:.16em; text-transform:uppercase; font-weight:700; color:' + color + '; margin:0;">' + fase + (enPrep ? '' : ' · ronda ' + s.ronda + '/' + p.minutos) + '</p>' +
        '<div style="font-family:var(--font-display); font-weight:700; font-size:26px; line-height:1.15; margin-top:4px;">' + (enDesc ? 'Siguiente: ' + s.sig.n : s.ej.n) + '</div>' +
        '<div class="t-timer" id="fin-num" style="color:' + color + ';">' + finFmt(t.leftSeg) + '</div>' +
        '<p style="font-size:13px; color:var(--text-dim); margin:0; max-width:340px;">' + (enDesc ? '' : s.ej.cue) + '</p>' +
        '<p id="fin-resta" style="font-size:14px; font-weight:600; margin:14px 0 0;">Restan ' + finFmt(resta) + '</p>' +
      '</div>' +
      '<button class="primary" id="fin-pausa" style="width:100%;">' + (t.corriendo ? 'Pausar' : 'Seguir') + '</button>' +
      '<button class="ghost" id="fin-salir" style="width:100%;">Salir (sigue pendiente)</button>' +
      '<button class="ghost" id="fin-saltear" style="width:100%;">Saltear finisher (queda registrado)</button>';
  }
  ov.innerHTML = '<div style="max-width:460px; margin:0 auto; padding:22px 20px 34px; min-height:100vh; box-sizing:border-box; display:flex; flex-direction:column;">' +
    '<div style="font-weight:700; font-size:16px; margin-bottom:8px;">🔥 Finisher' + '</div>' + cuerpo + '</div>';
  const b = id => ov.querySelector('#' + id);
  if(b('fin-ok')) b('fin-ok').onclick = () => { finCerrarOverlay(); finisherCompletado(); };
  if(b('fin-pausa')) b('fin-pausa').onclick = () => {
    const tt = finTimer; if(!tt) return;
    if(tt.corriendo){ tt.acum = finElapsed(); tt.corriendo = false; } else { tt.t0 = Date.now(); tt.corriendo = true; }
    finPintar();
  };
  if(b('fin-salir')) b('fin-salir').onclick = () => { finCerrarOverlay(); };
  if(b('fin-saltear')) b('fin-saltear').onclick = finisherSaltear;
}

console.log('✅ finisher.js cargado');
