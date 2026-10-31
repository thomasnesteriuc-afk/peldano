/**
 * FINISHER.JS — Finisher de acondicionamiento con FORMATO VARIABLE por bloque mensual (ENCARGO, cambio del 28/10).
 *
 * · Al iniciar cada bloque mensual el motor elige UN formato y lo mantiene todo el mes (para poder medir progreso).
 *   Nunca repite el formato del bloque anterior.
 * · Formatos (duración siempre entre 5 y 10 min):
 *     VUELTAS     3–6 vueltas, 3–5 ejercicios por reps, 30 s entre vueltas.        Registro: "Vuelta hecha".
 *     EMOM        5–10 min, 2–4 ejercicios alternados, reps que dejan 15–25 s de descanso en cada minuto.   Registro: nada.
 *     AMRAP       6–10 min, 3–4 ejercicios, se cuentan las vueltas.                 Registro: cantidad de vueltas al final.
 *     INTERVALOS  30 s trabajo / 30 s descanso, 3–4 ejercicios, 6–10 min.           Registro: nada (manda el timer).
 * · Calibración: más largo → menos reps por ejercicio (ritmo más sostenido). Intensidad: cansar y transpirar, nunca el fallo.
 * · Ejercicios por CATEGORÍA (explosivo cuerpo entero, piernas, desplazamiento/cardio, core dinámico): rotan entre sesiones
 *   dentro del formato fijo; cada vuelta mezcla categorías distintas.
 * · Día Piernas: SIN saltos ni impacto (sin burpees, sentadilla con salto, soga, skipping, jumping jacks ni plank jacks).
 * · Salteable con un toque (queda registrado). Lo recorta el plan de 60 min solo bajando la duración (ver FIN_DURACION).
 * · Técnica: `fuente` (texto de la app, Guía de Yerai) o `revisado` ('entrenador' = revisado; 'pendiente' = texto de Claude
 *   a revisar por el entrenador). No se inventan fuentes.
 *
 * Versión anterior (pares EMOM fijos de 10 min): _archivo/finisher-previo-pares-emom.js
 * Depende de globals de index.html: stats, myEquip, saveState, dayMarks, dayFocus, isUnilateral, renderDay, bloqueVigente,
 * planTiempoHoy (tiempo-sesion.js), vibrar (opcional).
 */

const FIN_FORMATOS = ['vueltas', 'emom', 'amrap', 'intervalos'];
const FIN_NOMBRE = { vueltas:'VUELTAS', emom:'EMOM', amrap:'AMRAP', intervalos:'INTERVALOS' };
// Minutos: completo (plan normal) y reducido (si con el completo la sesión pasa de 60 min). Siempre entre 5 y 10.
const FIN_DURACION = { vueltas:{ completo:10, reducido:5 }, emom:{ completo:10, reducido:5 }, amrap:{ completo:10, reducido:6 }, intervalos:{ completo:9, reducido:6 } };
const FIN_CATS = ['explosivo', 'piernas', 'cardio', 'core'];
// tempo = segundos por repetición a ritmo cómodo; par = se cuentan alternando lados (reps pares); impacto = saltos / aterrizajes.
const FIN_EJ = {
  burpee:     { n:'Burpees', cat:'explosivo', tempo:3.5, impacto:true, unidad:'reps', cue:'Abajo, plancha, volvé y saltá. Ritmo sostenible: si perdés la forma, hacelos sin salto.', revisado:'pendiente' },
  jumpsquat:  { n:'Sentadilla con salto', cat:'explosivo', tempo:2.0, impacto:true, unidad:'reps', cue:'Sentadilla y salto explosivo, aterrizaje blando con las rodillas en línea con los pies.', revisado:'pendiente' },
  sentadilla: { n:'Sentadilla', cat:'piernas', tempo:2.5, impacto:false, unidad:'reps', cue:'Bajá hasta que los muslos queden paralelos al suelo, espalda neutra y talones apoyados.', fuente:'Guía de Yerai Alonso (texto de la app)' },
  zancadas:   { n:'Zancadas', cat:'piernas', tempo:2.5, impacto:false, par:true, unidad:'reps', cue:'Adelantá una pierna y flexioná la rodilla a 90°, volvé y cambiá de pierna.', fuente:'Guía de Yerai Alonso (texto de la app)' },
  skipping:   { n:'Skipping', cat:'cardio', tempo:0.6, impacto:true, par:true, unidad:'pasos', cue:'Corrida en el lugar subiendo las rodillas a la cadera, ritmo alto.', revisado:'pendiente' },
  jacks:      { n:'Jumping jacks', cat:'cardio', tempo:1.1, impacto:true, unidad:'reps', cue:'Ritmo parejo, brazos completos arriba, aterrizaje suave.', revisado:'pendiente' },
  soga:       { n:'Soga', cat:'cardio', tempo:0.55, impacto:true, unidad:'saltos', equipo:'Soga', cue:'Saltos cortos y livianos, muñecas sueltas, aterrizá en la punta de los pies.', revisado:'pendiente' },
  mountain:   { n:'Mountain climbers', cat:'core', tempo:1.0, impacto:false, par:true, unidad:'reps', cue:'Plancha alta, cadera baja, llevá una rodilla al pecho y alterná rápido.', revisado:'pendiente' },
  plankjacks: { n:'Plank jacks', cat:'core', tempo:1.4, impacto:true, unidad:'reps', cue:'En plancha alta, abrí y cerrá los pies saltando como en un jumping jack, sin mover la cadera.', revisado:'pendiente' }
};
const FIN_TRANS = 3, FIN_DESC_VUELTAS = 30, FIN_PREP = 5;

// ---------- formato del bloque mensual ----------
// Se elige al iniciar el bloque (la primera vez que se pide) y queda fijo todo el mes. Nunca igual al del bloque anterior
// (bloqueVigente() guarda el anterior en `finisherPrev` al armar el bloque nuevo).
function finisherFormatoBloque(){
  const b = bloqueVigente();
  if(!FIN_FORMATOS.includes(b.finisherFormato)){
    const prev = FIN_FORMATOS.includes(b.finisherPrev) ? b.finisherPrev : null;
    const cand = FIN_FORMATOS.filter(f => f !== prev);
    b.finisherFormato = cand[Math.floor((b.inicio || 0) / 86400000) % cand.length];
    try{ if(typeof saveState === 'function') saveState(); }catch(e){ /* no bloquear */ }
  }
  return b.finisherFormato;
}
// Minutos del finisher de hoy: los decide el plan de 60 min (tiempo-sesion.js) entre completo y reducido del formato.
function finisherDuraciones(){ return FIN_DURACION[finisherFormatoBloque()]; }
function finisherMinutos(){
  const p = (typeof planTiempoHoy === 'function') ? planTiempoHoy() : null;
  return p ? p.finisher : finisherDuraciones().completo;
}

// ---------- ejercicios del día: por categoría, rotando, sin impacto en Piernas ----------
function finDisponibles(dia){
  return Object.keys(FIN_EJ).filter(k => {
    const e = FIN_EJ[k];
    if(dia === 'piernas' && e.impacto) return false;                       // Piernas: sin saltos ni impacto
    if(e.equipo && !myEquip.includes(e.equipo)) return false;
    return true;
  });
}
// n ejercicios de categorías distintas (la rotación cambia con la semilla); si n supera las categorías, se repiten con otro ejercicio.
function finSeleccion(n, dia, semilla){
  const disp = finDisponibles(dia), porCat = {};
  disp.forEach(k => (porCat[FIN_EJ[k].cat] = porCat[FIN_EJ[k].cat] || []).push(k));
  const cats = FIN_CATS.filter(c => porCat[c]);
  if(!cats.length) return [];
  const orden = cats.map((_, i) => cats[(i + semilla) % cats.length]);
  const out = [];
  for(let i = 0; out.length < n && i < n + disp.length * 2; i++){
    const c = orden[i % orden.length], lista = porCat[c];
    const k = lista[(Math.floor(semilla / cats.length) + Math.floor(i / orden.length)) % lista.length];
    if(!out.includes(k)) out.push(k);
  }
  return finOrdenarCategorias(out);
}
// Reordena para que dos ejercicios seguidos nunca sean de la misma categoría (cuando se puede): cada vuelta mezcla categorías.
function finOrdenarCategorias(claves){
  const resto = claves.slice(), res = [];
  while(resto.length){
    const ult = res.length ? FIN_EJ[res[res.length - 1]].cat : null;
    const frec = c => resto.filter(k => FIN_EJ[k].cat === c).length;
    const cand = resto.filter(k => FIN_EJ[k].cat !== ult).sort((a, b) => frec(FIN_EJ[b].cat) - frec(FIN_EJ[a].cat));
    const k = cand.length ? cand[0] : resto[0];
    res.push(k); resto.splice(resto.indexOf(k), 1);
  }
  return res;
}
function finNEjercicios(fmt, D){
  if(fmt === 'vueltas') return D >= 8 ? 4 : 3;
  if(fmt === 'emom') return 2;
  if(fmt === 'amrap') return D >= 8 ? 4 : 3;
  return 3;                                                                 // intervalos
}

// ---------- calibración: más largo → menos reps por ejercicio ----------
const finG = D => 1 + 0.06 * (D - 5);                                       // ritmo efectivo: 1,0 (5 min) a 1,3 (10 min)
function finReps(e, segs, D){
  let r = Math.max(3, Math.round(segs / (e.tempo * finG(D))));
  if(e.par) r = Math.max(4, r - (r % 2));
  return r;
}
function finCalibrar(fmt, D, ejs){
  const n = ejs.length;
  if(fmt === 'vueltas'){
    let mejor = null;
    for(let V = 3; V <= 6; V++){
      const Tv = (D * 60 - FIN_DESC_VUELTAS * (V - 1)) / V, reps = ejs.map(e => finReps(e, Tv / n - FIN_TRANS, D));
      const est = V * ejs.reduce((t, e, i) => t + reps[i] * e.tempo * finG(D) + FIN_TRANS, 0) + FIN_DESC_VUELTAS * (V - 1);
      const ok = est >= 300 && est <= 600, score = Math.abs(est - D * 60);
      if(!mejor || (ok && (!mejor.ok || score < mejor.score)) || (!mejor.ok && !ok && score < mejor.score)) mejor = { V, reps, est, ok, score };
    }
    return { vueltas:mejor.V, descanso:FIN_DESC_VUELTAS, reps:mejor.reps, estSeg:Math.round(mejor.est) };
  }
  if(fmt === 'emom'){
    const R = 15 + (D - 5);                                                  // descanso objetivo por minuto: 15 s (5 min) a 20 s (10 min)
    const reps = ejs.map(e => { let r = Math.max(4, Math.floor((60 - R) / e.tempo)); if(e.par) r = Math.max(4, r - (r % 2)); return r; });
    return { minutosEmom:D, reps, descansos:ejs.map((e, i) => Math.round(60 - reps[i] * e.tempo)), estSeg:D * 60 };
  }
  if(fmt === 'amrap'){
    const slot = 90 / n - FIN_TRANS, reps = ejs.map(e => finReps(e, slot, D));
    const vuelta = ejs.reduce((t, e, i) => t + reps[i] * e.tempo * finG(D) + FIN_TRANS, 0);
    return { reps, vueltaSeg:Math.round(vuelta), vueltasEsperadas:Math.max(1, Math.floor(D * 60 / vuelta)), estSeg:D * 60 };
  }
  return { trabajo:30, descanso:30, intervalos:D, reps:ejs.map(() => null), estSeg:D * 60 };      // intervalos: 30 s / 30 s
}
function finTxt(fmt, e, reps){
  if(fmt === 'intervalos') return '30 s';
  return reps + ' ' + e.unidad + (e.par ? ' (' + (reps / 2) + ' por lado)' : '');
}
// El plan de hoy: { formato, nombre, minutos, ejercicios:[{k,n,cat,reps,txt,cue,revisado|fuente}], ... según formato }
function finisherArmar(fmt, D, dia, semilla){
  const claves = finSeleccion(Math.min(finNEjercicios(fmt, D), finDisponibles(dia).length), dia, semilla);
  const ejs = claves.map(k => FIN_EJ[k]), cal = finCalibrar(fmt, D, ejs);
  const plan = Object.assign({ formato:fmt, nombre:FIN_NOMBRE[fmt], minutos:D, dia }, cal);
  plan.ejercicios = claves.map((k, i) => ({ k, n:FIN_EJ[k].n, cat:FIN_EJ[k].cat, impacto:FIN_EJ[k].impacto, reps:cal.reps[i], txt:finTxt(fmt, FIN_EJ[k], cal.reps[i]), cue:FIN_EJ[k].cue, revisado:FIN_EJ[k].revisado, fuente:FIN_EJ[k].fuente }));
  return plan;
}
function finisherPlanHoy(){
  return finisherArmar(finisherFormatoBloque(), finisherMinutos(), dayFocus, (stats.sessions || 0) + (stats.varOffset || 0));
}
const finTitulo = p => p.nombre + ' · ' + p.minutos + ' min';

// ---- estado del día (persistido en stats para sobrevivir a los re-render) ----
function finEstadoHoy(){
  const hoy = new Date().toDateString();
  if(!stats.finisherHoy || stats.finisherHoy.fecha !== hoy) stats.finisherHoy = { fecha:hoy, estado:'pendiente', auto:false };
  return stats.finisherHoy;
}
function finLog(estado, plan, extra){
  if(!Array.isArray(stats.finisherLog)) stats.finisherLog = [];
  const reg = { f:new Date().toISOString(), e:estado, formato:plan.formato, ej:plan.ejercicios.map(x => x.n), min:plan.minutos };
  if(extra && typeof extra.vueltas === 'number') reg.vueltas = extra.vueltas;
  stats.finisherLog.push(reg);
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
function finisherCompletado(extra){
  const st = finEstadoHoy();
  if(st.estado === 'hecho') return;
  finLog('hecho', finisherPlanHoy(), extra);
  st.estado = 'hecho';
  if(typeof renderDay === 'function') renderDay();
}
// Al registrar la sesión: si el finisher quedó sin tocar, se anota como "omitido" y se rearma para la próxima.
function finisherCerrarSesion(){
  const st = finEstadoHoy();
  if(st.estado === 'pendiente') finLog('omitido', finisherPlanHoy());
  stats.finisherHoy = { fecha:new Date().toDateString(), estado:'pendiente', auto:false };
  finCerrarOverlay();
}

// ¿Están marcadas TODAS las series (o rondas) de la sesión? Arranca el finisher al marcar la última.
function finisherFuerzaCompleta(session){
  if(!session || !session.length) return false;
  // Cuenta cada serie (o ronda de circuito) de los ejercicios que de verdad se marcan; salto y soga (dosis fija) no tienen marcas.
  const bloques = buildBlocks(session); let hayMarcables = false;
  for(let bi = 0; bi < bloques.length; bi++){
    const b = bloques[bi], marcables = b.exs.filter(ex => !ex._libre && ex.pattern !== 'power_legs');
    if(!marcables.length) continue;
    hayMarcables = true;
    if(b.circuito){ if(((daySeries['ronda::' + bi]) || []).length < b.rondas) return false; }
    else if(marcables.some(ex => ((daySeries[ex.name]) || []).length < b.rondas)) return false;
  }
  return hayMarcables;
}

// ---- tarjeta dentro de la sesión ----
function finListaHTML(plan, grande){
  return plan.ejercicios.map((e, i) => '<div style="margin:' + (grande ? '10px 0' : '8px 0') + ';">' +
    '<div style="display:flex; justify-content:space-between; align-items:baseline; gap:10px;"><span style="font-weight:700; font-size:' + (grande ? 18 : 15) + 'px;">' + (i + 1) + '. ' + e.n + '</span>' +
    '<span class="u-num" style="font-family:var(--font-display); font-size:' + (grande ? 22 : 17) + 'px; font-weight:800; white-space:nowrap;">' + e.txt + '</span></div>' +
    '<div style="font-size:12.5px; color:var(--text-dim); margin-top:2px;">' + e.cue + '</div></div>').join('');
}
function finDescripcion(p){
  if(p.formato === 'vueltas') return p.vueltas + ' vueltas de ' + p.ejercicios.length + ' ejercicios, ' + p.descanso + ' s de descanso entre vueltas. Tocá "Vuelta hecha" al terminar cada una.';
  if(p.formato === 'emom') return 'Cada minuto, un ejercicio (se alternan). Hacé las reps y descansá lo que sobre (' + Math.min.apply(null, p.descansos) + '–' + Math.max.apply(null, p.descansos) + ' s).';
  if(p.formato === 'amrap') return 'Todas las vueltas que puedas en ' + p.minutos + ' min, con las mismas reps. Al final decís cuántas hiciste.';
  return '30 s de trabajo y 30 s de descanso, ' + p.minutos + ' intervalos. Mandan el timer y el ritmo parejo.';
}
const FIN_RITMO = 'Ritmo parejo: que te canse y transpires, sin llegar al fallo.';
function renderFinisher(c, session){
  const plan = finisherPlanHoy();
  const st = finEstadoHoy();
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.id = 'finisher-card';
  card.style.cssText = 'margin-top:18px; border:1.5px solid var(--accent);';
  let estadoHTML;
  if(st.estado === 'hecho'){
    estadoHTML = '<div style="font-weight:700; color:var(--accent-strong);">✓ Finisher hecho</div>';
  } else if(st.estado === 'salteado'){
    estadoHTML = '<div style="font-size:13.5px; color:var(--text-dim); margin-bottom:8px;">Lo salteaste: quedó registrado.</div>' +
      '<button class="ghost" id="fin-igual" style="width:100%; margin:0; min-height:48px;">Hacerlo igual</button>';
  } else {
    estadoHTML = '<div style="font-size:12.5px; color:var(--text-faint); margin-bottom:8px;">Arranca solo cuando marques el último ejercicio de arriba.</div>' +
      '<button class="primary" id="fin-start" style="width:100%; margin:0 0 8px; min-height:48px;">▶ Empezar finisher</button>' +
      '<button class="ghost" id="fin-skip" style="width:100%; margin:0; min-height:48px;">Saltear (queda registrado)</button>';
  }
  card.innerHTML =
    '<div style="display:flex; justify-content:space-between; align-items:baseline;">' +
      '<span style="font-size:11.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); font-weight:700;">Finisher · ' + finTitulo(plan) + '</span>' +
    '</div>' +
    '<p style="font-size:13px; color:var(--text-dim); margin:6px 0 4px; line-height:1.45;">' + finDescripcion(plan) + ' ' + FIN_RITMO + '</p>' +
    finListaHTML(plan, false) + estadoHTML;
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

// ---- reproductor (pantalla completa, timer grande) ----
let finTimer = null;
function finFmt(sec){ sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
// Tramos con reloj para EMOM, INTERVALOS y AMRAP (VUELTAS no tiene: la vuelta termina cuando vos tocás "Vuelta hecha").
function finSegmentos(plan){
  const seg = [{ tipo:'prep', dur:FIN_PREP, ej:plan.ejercicios[0] }], ejs = plan.ejercicios, n = ejs.length;
  if(plan.formato === 'emom'){
    for(let i = 0; i < plan.minutos; i++) seg.push({ tipo:'min', dur:60, i, ej:ejs[i % n], sig:i < plan.minutos - 1 ? ejs[(i + 1) % n] : null });
  } else if(plan.formato === 'intervalos'){
    for(let k = 0; k < plan.minutos; k++){
      seg.push({ tipo:'work', dur:30, k, ej:ejs[k % n], sig:ejs[(k + 1) % n] });
      if(k < plan.minutos - 1) seg.push({ tipo:'rest', dur:30, k, ej:ejs[(k + 1) % n], sig:ejs[(k + 1) % n] });
    }
  } else if(plan.formato === 'amrap'){
    seg.push({ tipo:'amrap', dur:plan.minutos * 60, ej:ejs[0] });
  }
  return seg;
}
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
  finTimer = { plan, acum:0, t0:Date.now(), corriendo:true, terminado:false, auto:!!auto, idx:0, ultimoIdx:-1, pintado:false, vueltasAmrap:0, vuelta:1, fase:'trabajo', faseDesde:0, int:setInterval(finTick, 250) };
  if(plan.formato === 'vueltas'){ finTimer.total = Infinity; }
  else { finTimer.seg = finSegmentos(plan); finTimer.total = finTimer.seg.reduce((s, x) => s + x.dur, 0); }
  finOverlay().classList.add('open');
  finTick();
}
function finElapsed(){ const t = finTimer; return t.acum + (t.corriendo ? (Date.now() - t.t0) / 1000 : 0); }
const finVibrar = p => { if(typeof vibrar === 'function') vibrar(p); };
function finTick(){
  const t = finTimer; if(!t) return;
  const el = finElapsed();
  if(t.plan.formato === 'vueltas'){                                          // por vueltas: solo manda el descanso de 30 s
    if(t.terminado) return;
    if(t.fase === 'descanso'){
      const resta = FIN_DESC_VUELTAS - (el - t.faseDesde);
      if(resta <= 0){ t.vuelta++; t.fase = 'trabajo'; t.faseDesde = el; finVibrar([40, 60, 120]); finPintar(); return; }
      t.leftSeg = resta;
    }
    if(!t.pintado) finPintar(); else finNumeros();
    return;
  }
  if(el >= t.total && !t.terminado){
    t.terminado = true; t.corriendo = false; clearInterval(t.int); t.int = null;
    finVibrar([80, 60, 80, 60, 200]);
    finPintar(); return;
  }
  let idx = 0, ini = 0;
  for(let i = 0; i < t.seg.length; i++){ if(el < ini + t.seg[i].dur){ idx = i; break; } ini += t.seg[i].dur; idx = i; }
  const cambio = (idx !== t.ultimoIdx);
  if(cambio){ t.ultimoIdx = idx; finVibrar([40, 60, 120]); }
  t.idx = idx; t.leftSeg = t.seg[idx].dur - (el - ini);
  // Se repinta entero solo al cambiar de tramo (o pausar); el resto del tiempo solo se actualizan los números.
  if(cambio || !t.pintado) finPintar(); else finNumeros();
}
function finNumeros(){
  const t = finTimer; if(!t || t.terminado) return;
  const n = document.getElementById('fin-num');
  if(n) n.textContent = (t.plan.formato === 'vueltas' && t.fase === 'trabajo') ? finFmt(finElapsed()) : finFmt(t.leftSeg);
  const r = document.getElementById('fin-resta');
  if(r && t.plan.formato !== 'vueltas') r.textContent = 'Restan ' + finFmt(t.total - finElapsed());
}
// Encabezado: formato y tiempo arriba ("EMOM · 8 min") + dónde vas ("Vuelta 2 de 4").
function finEncabezado(t, sub){
  return '<div style="font-weight:800; font-size:18px; letter-spacing:.06em;" id="fin-formato">' + finTitulo(t.plan) + '</div>' +
    '<div style="font-size:15px; font-weight:700; margin:2px 0 8px;" id="fin-donde">' + sub + '</div>';
}
function finPintar(){
  const t = finTimer; if(!t) return;
  t.pintado = true;
  const ov = finOverlay(), p = t.plan;
  const grande = html => '<div class="t-timer" id="fin-num">' + html + '</div>';
  let cuerpo = '';
  const boton = (id, txt, cls) => '<button class="' + (cls || 'ghost') + '" id="' + id + '" style="width:100%; min-height:48px;">' + txt + '</button>';
  const secundarios = boton('fin-salir', 'Salir (sigue pendiente)') + boton('fin-saltear', 'Saltear finisher (queda registrado)');
  if(t.terminado){
    if(p.formato === 'amrap'){
      cuerpo = finEncabezado(t, 'Tiempo cumplido') +
        '<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center;">' +
        '<div style="font-size:18px; font-weight:700;">¿Cuántas vueltas completaste?</div>' +
        '<div style="display:flex; align-items:center; gap:18px;">' +
          '<button class="ghost" id="fin-menos" style="margin:0; min-width:64px; min-height:64px; font-size:30px;" aria-label="Una vuelta menos">−</button>' +
          '<div class="t-timer" id="fin-vueltas" style="margin:0; min-width:90px;">' + t.vueltasAmrap + '</div>' +
          '<button class="ghost" id="fin-mas" style="margin:0; min-width:64px; min-height:64px; font-size:30px;" aria-label="Una vuelta más">+</button></div>' +
        '<div style="font-size:13px; color:var(--text-dim);">Esperadas: ' + p.vueltasEsperadas + ' (orientativo)</div></div>' +
        boton('fin-ok', 'Listo, registrar', 'primary');
    } else {
      cuerpo = finEncabezado(t, 'Finisher terminado') +
        '<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center;">' +
        '<div style="font-size:44px;">✓</div><div style="font-size:14px; color:var(--text-dim);">' + finTitulo(p) + ' · ' + p.ejercicios.map(e => e.n).join(' + ') + (p.formato === 'vueltas' ? ' · ' + p.vueltas + ' vueltas' : '') + '</div></div>' +
        boton('fin-ok', 'Listo, registrar', 'primary');
    }
  } else if(p.formato === 'vueltas'){
    const enDesc = t.fase === 'descanso';
    cuerpo = finEncabezado(t, (enDesc ? 'Descanso · ' : '') + 'Vuelta ' + Math.min(t.vuelta, p.vueltas) + ' de ' + p.vueltas) +
      '<div style="flex:1;">' + grande(enDesc ? finFmt(t.leftSeg || FIN_DESC_VUELTAS) : finFmt(finElapsed())) +
      '<div style="font-size:13px; text-align:center; color:var(--text-dim); margin:-8px 0 8px;">' + (enDesc ? 'Descanso: ya sigue la próxima vuelta' : 'Tiempo total (referencia)') + '</div>' +
      finListaHTML(p, true) + '<p style="font-size:13px; color:var(--text-dim); margin:8px 0 0;">' + FIN_RITMO + '</p></div>' +
      (enDesc ? '' : boton('fin-vuelta', 'Vuelta hecha', 'primary')) + boton('fin-pausa', t.corriendo ? 'Pausar' : 'Seguir') + secundarios;
  } else {
    const s = t.seg[t.idx || 0], enPrep = s.tipo === 'prep', enDesc = s.tipo === 'rest';
    let sub;
    if(enPrep) sub = 'Prepárate';
    else if(p.formato === 'emom') sub = 'Minuto ' + (s.i + 1) + ' de ' + p.minutos;
    else if(p.formato === 'intervalos') sub = 'Intervalo ' + (s.k + 1) + ' de ' + p.minutos + ' · ' + (enDesc ? 'Descanso' : 'Trabajo');
    else sub = 'Tiempo restante';
    let centro;
    if(p.formato === 'amrap') centro = finListaHTML(p, true);
    else if(enPrep) centro = '<div style="font-size:24px; font-weight:800; text-align:center;">' + s.ej.n + '</div>';
    else if(p.formato === 'emom') centro = '<div style="text-align:center; font-size:26px; font-weight:800; line-height:1.15;">' + s.ej.n + '</div><div class="u-num" style="text-align:center; font-family:var(--font-display); font-size:32px; font-weight:800; margin:4px 0;">' + s.ej.txt + '</div><div style="font-size:13px; text-align:center; color:var(--text-dim);">' + s.ej.cue + '</div>' + (s.sig ? '<div style="font-size:14px; text-align:center; margin-top:10px;">Sigue: ' + s.sig.n + ' · ' + s.sig.txt + '</div>' : '');
    else centro = '<div style="text-align:center; font-size:26px; font-weight:800; line-height:1.15;">' + (enDesc ? 'Siguiente: ' + s.ej.n : s.ej.n) + '</div>' + (enDesc ? '' : '<div style="font-size:13px; text-align:center; color:var(--text-dim);">' + s.ej.cue + '</div>');
    cuerpo = finEncabezado(t, sub) +
      '<div style="flex:1; display:flex; flex-direction:column; justify-content:center;">' + grande(finFmt(t.leftSeg)) + centro +
      (p.formato === 'amrap' ? '' : '<p style="font-size:13px; text-align:center; color:var(--text-dim); margin:10px 0 0;">' + FIN_RITMO + '</p>') +
      '<p id="fin-resta" style="font-size:14px; font-weight:600; text-align:center; margin:12px 0 0;">Restan ' + finFmt(t.total - finElapsed()) + '</p></div>' +
      boton('fin-pausa', t.corriendo ? 'Pausar' : 'Seguir', 'primary') + secundarios;
  }
  ov.innerHTML = '<div style="max-width:460px; margin:0 auto; padding:22px 20px 34px; min-height:100vh; box-sizing:border-box; display:flex; flex-direction:column;">' + cuerpo + '</div>';
  const b = id => ov.querySelector('#' + id);
  if(b('fin-ok')) b('fin-ok').onclick = () => { const v = (p.formato === 'amrap') ? { vueltas:t.vueltasAmrap } : (p.formato === 'vueltas' ? { vueltas:p.vueltas } : undefined); finCerrarOverlay(); finisherCompletado(v); };
  if(b('fin-vuelta')) b('fin-vuelta').onclick = () => {                      // "Vuelta hecha": un toque
    const tt = finTimer; if(!tt) return;
    finVibrar([30, 40, 60]);
    if(tt.vuelta >= p.vueltas){ tt.terminado = true; tt.corriendo = false; clearInterval(tt.int); tt.int = null; finVibrar([80, 60, 80, 60, 200]); }
    else { tt.fase = 'descanso'; tt.faseDesde = finElapsed(); tt.leftSeg = FIN_DESC_VUELTAS; }
    finPintar();
  };
  if(b('fin-mas')) b('fin-mas').onclick = () => { t.vueltasAmrap = Math.min(30, t.vueltasAmrap + 1); document.getElementById('fin-vueltas').textContent = t.vueltasAmrap; };
  if(b('fin-menos')) b('fin-menos').onclick = () => { t.vueltasAmrap = Math.max(0, t.vueltasAmrap - 1); document.getElementById('fin-vueltas').textContent = t.vueltasAmrap; };
  if(b('fin-pausa')) b('fin-pausa').onclick = () => {
    const tt = finTimer; if(!tt) return;
    if(tt.corriendo){ tt.acum = finElapsed(); tt.corriendo = false; } else { tt.t0 = Date.now(); tt.corriendo = true; }
    finPintar();
  };
  if(b('fin-salir')) b('fin-salir').onclick = () => { finCerrarOverlay(); };
  if(b('fin-saltear')) b('fin-saltear').onclick = finisherSaltear;
}

console.log('✅ finisher.js cargado');
