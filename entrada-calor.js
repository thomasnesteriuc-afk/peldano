/**
 * ENTRADA-CALOR.JS — Entrada en calor guiada (ENCARGO, cambio de enfoque del 28/10: CRITERIOS, no números rígidos)
 *
 * ORDEN FIJO, en formato REPRODUCTOR (nunca una lista):  1. Movilidad  →  2. Activación  →  3. Pulsaciones.
 * El motor decide y VARÍA entre sesiones (no es fuerza): rota los ejercicios del pool respetando estos criterios.
 *
 * CRITERIOS
 *  · Corta y ágil: orientativo 5–8 min. Pocos ejercicios, bien elegidos; si dos cubren lo mismo, va uno solo (`cubre`).
 *  · Movilidad: las articulaciones que más trabajan ese día. Muñecas SIEMPRE (la calistenia las carga en casi todo).
 *  · Activación: lo que se va a usar ese día (escápulas en Tirón, escápulas/muñecas en Empuje, glúteo y cadera en Piernas)
 *    + control pélvico (retroversión o puente; uno solo, que cubren lo mismo).
 *  · Pulsaciones: algo breve y dinámico (soga, jumping jacks o skipping).
 *  · PROHIBIDO cualquier ejercicio de entrenamiento (dominadas, flexiones, habilidades, escalones de las escaleras, etc.).
 *
 * LAS SERIES DE APROXIMACIÓN YA NO VAN ACÁ: las propone la pantalla de la sesión, al inicio del primer ejercicio fuerte
 * (aproximacionHTML), 1–2 series fáciles claramente marcadas.
 *
 * Los textos de técnica salen de lo que ya tenía la app donde existía. `revisado:"entrenador"` = revisado por el entrenador
 * (no es fuente bibliográfica y no se inventa una). `revisado:"pendiente"` = texto de Claude a revisar por el entrenador.
 * Depende de globals de index.html: stats, profile, myEquip, exByName, isStatic, isUnilateral, hasEquip, progState, tBase,
 * HABILIDADES, DIA_LABEL.
 */

// `cubre` = qué prepara cada ejercicio: si dos cubren lo mismo, el plan usa uno solo. `equipo` = se omite si no lo tenés.
const EC_MOV = [
  { id:'muneca',  n:'Círculos de muñeca', seg:45, cubre:['muñeca'], cue:'Manos entrelazadas o apoyadas: círculos controlados en las dos direcciones. Sumá flexión y extensión completa.' },
  { id:'muneca-apoyo', n:'Muñecas con apoyo', seg:45, cubre:['muñeca'], cue:'Palmas en el piso con los dedos hacia adelante: llevá el peso suavemente hacia adelante y atrás. Repetí con los dedos hacia los costados. En cuatro apoyos. Sumá una pasada suave con los dedos hacia atrás, sin dolor.', revisado:'entrenador' },
  { id:'brazo',   n:'Círculos de brazo',  seg:45, cubre:['hombro'], cue:'Brazos extendidos a los costados: círculos grandes y controlados, hacia adelante y hacia atrás.' },
  { id:'gato',    n:'Gato-vaca',          seg:45, cubre:['columna'], cue:'En cuadrupedia, arqueá la espalda hacia arriba y después hundila, siguiendo el movimiento con la cabeza. Lento, con la respiración.' },
  { id:'cadera',  n:'Círculos de cadera', seg:45, cubre:['cadera'], cue:'Llevá una rodilla al pecho y abrila hacia afuera en un círculo grande. Alterná las piernas. Rango completo, sin forzar.' },
  { id:'sentadilla-lenta', n:'Sentadilla lenta de rango completo', seg:40, cubre:['cadera', 'rodilla', 'tobillo'], cue:'Bajá lento lo más profundo que te permita la movilidad, talones apoyados y rodillas en la línea de los pies. Pausa 1 s abajo y subí.', revisado:'entrenador' },
  { id:'tobillo-rodilla', n:'Tobillos: rodilla hacia adelante', seg:40, cubre:['rodilla', 'tobillo'], cue:'Con el pie apoyado y el talón en el piso, llevá la rodilla hacia adelante pasando la punta del pie. Volvé y repetí. Rodilla alineada con el segundo dedo del pie; el talón nunca se despega.', revisado:'entrenador' },
  { id:'tobillo', n:'Círculos de tobillo', seg:40, cubre:['tobillo'], cue:'Apoyá la punta del pie y dibujá círculos con el tobillo. Cambiá de pie y de sentido.', revisado:'entrenador' }
];
const EC_ACT = [
  { id:'retracciones', n:'Retracciones escapulares colgado', seg:50, cubre:['escápula'], dias:['tiron'], equipo:'Barra', cue:'Colgado de la barra, retraé las escápulas sin flexionar los brazos.' },
  { id:'aperturas', n:'Aperturas con banda', seg:50, cubre:['escápula'], dias:['tiron'], equipo:'Banda', cue:'Con la banda tomada al frente y los brazos estirados, separá las manos llevando la banda hacia el pecho y juntando los omóplatos. Brazos a la altura de los hombros, sin subirlos hacia las orejas ni arquear la lumbar. Volvé controlando la banda.', revisado:'entrenador' },
  { id:'flex-escapulares', n:'Flexiones escapulares', seg:50, cubre:['escápula'], dias:['empuje'], cue:'En posición de flexión con los brazos estirados, hundí y elevá el pecho moviendo solo los omóplatos. El movimiento es chiquito.' },
  { id:'retroversion', n:'Retroversión pélvica', seg:40, cubre:['pelvis'], dias:['tiron', 'empuje'], cue:'Acostado con las rodillas dobladas, aplastá la zona lumbar contra el piso llevando el pubis hacia el ombligo. Soltá y repetí, lento. Exhalá mientras aplanás la lumbar. Movés solo la pelvis: los glúteos no se despegan del piso.', revisado:'entrenador' },
  { id:'puente', n:'Puente de glúteo', seg:40, cubre:['pelvis', 'glúteo'], dias:['tiron', 'empuje', 'piernas'], cue:'Empujá con los talones y subí la cadera hasta hacer una línea recta. Apretá el glúteo arriba un segundo y bajá controlado.' }
];
// Subir pulsaciones: breve y dinámico. Textos de Claude pendientes de revisión del entrenador.
const EC_PULSO = [
  { id:'soga', n:'Soga', seg:100, equipo:'Soga', cue:'Saltos cortos y livianos, muñecas sueltas, aterrizá en la punta de los pies.', revisado:'pendiente' },
  { id:'jacks', n:'Jumping jacks', seg:100, cue:'Ritmo parejo, brazos completos arriba, aterrizaje suave.', revisado:'pendiente' },
  { id:'skipping', n:'Skipping', seg:100, cue:'Corrida en el lugar subiendo las rodillas a la cadera, ritmo alto.', revisado:'pendiente' }
];
// Articulaciones que más trabajan cada día, de arriba hacia abajo (las muñecas van SIEMPRE).
const EC_DIA_ARTIC = { tiron:['muñeca', 'hombro', 'columna'], empuje:['muñeca', 'hombro', 'columna'], piernas:['muñeca', 'cadera', 'rodilla', 'tobillo'] };
const EC_ORDEN_ARTIC = ['muñeca', 'hombro', 'columna', 'cadera', 'rodilla', 'tobillo'];
const EC_MIN_TOTAL = 330, EC_MAX_PULSO = 150, EC_MIN_PULSO = 90;   // orientativo: ~5,5 a 8 min; las pulsaciones se ajustan para no quedar cortos
const EC_SERIE = 55;        // segundos por serie de aproximación (serie + descanso): se cuenta en la parte de fuerza, no acá


// ---------- armado ----------
function ecLados(){
  const l = profile.ladoDebil;                       // 'izquierdo' | 'derecho' | null
  return [l ? ('lado ' + l + ' (débil)') : 'lado débil', 'otro lado'];
}
// Ejercicio de aproximación: ETAPA ANTERIOR si el primer ejercicio es una habilidad; si no, un peldaño abajo del primer ancla.
function ecAproximacion(ex){
  let prev = null;
  if(ex._skill && HABILIDADES[ex._skill]){
    const et = HABILIDADES[ex._skill].etapas, i = et.indexOf(ex.name);
    prev = exByName(i > 0 ? et[i - 1] : ex.requires) || null;
  } else if(ex.requires){ prev = exByName(ex.requires) || null; }
  if(!prev || !hasEquip(prev)) prev = ex;             // sin peldaño anterior (o sin el equipo): el mismo, con menos
  const estatico = isStatic(prev);
  const st = progState[prev.name];
  const t = (st && typeof st.target === 'number') ? st.target : tBase(prev);
  const dosis = estatico ? 10 : Math.max(3, Math.min(6, Math.round(t * 0.4)));
  return { nombre: prev.name, estatico, dosis, uni: isUnilateral(prev) };
}
// El primer ejercicio fuerte de la sesión del día: la habilidad si hay; si no, el primero de lo principal del día.
function ecPrimerFuerte(dia, ses){
  const hab = ses.find(e => e._skill); if(hab) return hab;
  const zona = dia === 'tiron' ? 'tiron' : (dia === 'empuje' ? 'empuje' : 'piernas');
  return ses.find(e => zoneOf(e.pattern) === zona) || null;
}

// ---------- armado por CRITERIOS ----------
// Semilla de variedad: cambia sola con cada sesión (y con "Cambiar ejercicios"), igual que el resto de la app.
function ecSemilla(){ return (stats && stats.sessions || 0) + (stats && stats.varOffset || 0); }
const ecTiene = it => !it.equipo || myEquip.includes(it.equipo);                     // sin el equipo, el ejercicio no entra
function ecElegirRotando(lista, semilla, desfase){ return lista.length ? lista[(semilla + (desfase || 0)) % lista.length] : null; }
// Devuelve los ejercicios ELEGIDOS (con su bloque), todavía sin las series de aproximación (que ya no van acá).
function entradaCalorElegidos(dia, semilla){
  const s = (typeof semilla === 'number') ? semilla : ecSemilla();
  const necesarias = EC_DIA_ARTIC[dia] || EC_DIA_ARTIC.tiron;
  // 1. MOVILIDAD: muñecas siempre; después las articulaciones del día; cada una se cubre UNA sola vez.
  const cubiertas = new Set(), mov = [];
  const agregar = it => { if(it && !mov.includes(it)){ mov.push(it); it.cubre.forEach(j => cubiertas.add(j)); } };
  agregar(EC_MOV.find(it => it.id === (dia === 'empuje' ? 'muneca-apoyo' : 'muneca')));         // en Empuje las muñecas se preparan con apoyo
  necesarias.forEach((j, i) => {
    if(cubiertas.has(j) || mov.length >= 3) return;
    const cand = EC_MOV.filter(it => ecTiene(it) && it.cubre.includes(j) && it.cubre.every(x => !cubiertas.has(x)) && it.id !== 'muneca' && it.id !== 'muneca-apoyo');
    agregar(ecElegirRotando(cand, s, i));
  });
  // Si con lo mínimo la entrada en calor quedaría corta (< ~5,5 min aun con las pulsaciones al máximo), suma la columna (gato-vaca).
  const restoMov = mov.reduce((t, x) => t + x.seg, 0) + 40 + 40;           // + activación escapular/pélvica aproximada
  if(mov.length < 3 && !cubiertas.has('columna') && restoMov + EC_MAX_PULSO < EC_MIN_TOTAL) agregar(EC_MOV.find(it => it.id === 'gato'));
  mov.sort((a, b) => Math.min.apply(null, a.cubre.map(j => EC_ORDEN_ARTIC.indexOf(j))) - Math.min.apply(null, b.cubre.map(j => EC_ORDEN_ARTIC.indexOf(j))));
  // 2. ACTIVACIÓN: lo que se usa ese día + control pélvico (retroversión o puente: cubren lo mismo, va uno solo).
  const act = [];
  const esc = ecElegirRotando(EC_ACT.filter(it => it.dias.includes(dia) && it.cubre.includes('escápula') && ecTiene(it)), s);
  if(esc) act.push(esc);
  const pelv = dia === 'piernas' ? EC_ACT.find(it => it.id === 'puente')                         // Piernas: glúteo y cadera
    : ecElegirRotando(EC_ACT.filter(it => it.dias.includes(dia) && it.cubre.includes('pelvis')), s, 1);
  if(pelv) act.push(pelv);
  // 3. PULSACIONES: breve y dinámico; dura lo justo para que la entrada en calor no quede corta.
  const pulso = ecElegirRotando(EC_PULSO.filter(ecTiene), s, 2);
  const resto = mov.concat(act).reduce((t, x) => t + x.seg, 0);
  const durPulso = Math.max(EC_MIN_PULSO, Math.min(EC_MAX_PULSO, EC_MIN_TOTAL - resto));
  return { mov, act, pulso: pulso ? Object.assign({}, pulso, { seg: durPulso }) : null };
}
// El plan que consume el reproductor: pasos en ORDEN FIJO movilidad → activación → pulsaciones.
function entradaCalorPlan(dia, semilla){
  const e = entradaCalorElegidos(dia, semilla), plan = [];
  const pasar = (lista, bloque, titulo) => lista.forEach(it => plan.push({ bloque, titulo, n: it.n, dur: it.seg, cue: it.cue, revisado: it.revisado, id: it.id, cubre: it.cubre }));
  pasar(e.mov, 1, 'Movilidad'); pasar(e.act, 2, 'Activación');
  if(e.pulso){ pasar([e.pulso], 3, 'Pulsaciones'); if(!myEquip.includes('Soga') && e.pulso.id === 'soga') plan[plan.length - 1].n = 'Saltitos en el lugar'; }
  return plan;
}
function entradaCalorSegundos(plan){ return plan.reduce((t, x) => t + x.dur, 0); }
// Duración estimada de la entrada en calor (la usa el plan de 60 min). Las series de aproximación se cuentan en la fuerza.
function entradaCalorSegundosEstimado(dia){ return entradaCalorSegundos(entradaCalorPlan(dia)); }

// ---------- SERIES DE APROXIMACIÓN (ya NO van en la entrada en calor) ----------
// Al inicio del primer ejercicio fuerte (la habilidad si hay; si no, la primera ancla) el motor propone 2 series fáciles:
// la versión más simple (el peldaño anterior) con pocas reps. Claramente marcadas: no se registran ni cuentan.
function aproximacionDe(ex){
  const ap = ecAproximacion(ex);
  return { nombre: ap.nombre, estatico: ap.estatico, dosis: ap.dosis, uni: ap.uni, series: 2 };
}
function aproximacionHTML(ex){
  const a = aproximacionDe(ex), mismo = a.nombre === ex.name;
  const dosis = a.estatico ? a.dosis + ' s' : a.dosis + ' reps';
  return '<div class="aprox-box" style="border:2px dashed var(--line); padding:10px 12px; margin:0 0 12px;">' +
    '<div style="font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;">Aproximación · ' + a.series + ' series fáciles · no cuentan</div>' +
    '<div style="font-size:15px; font-weight:700; margin-top:4px;">' + a.nombre + ' · ' + dosis + (a.uni ? ' por lado' : '') + '</div>' +
    '<div style="font-size:13px; color:var(--text-dim); margin-top:2px;">' + (mismo ? 'Mismo ejercicio, pocas reps y sin llegar al esfuerzo.' : 'Versión más simple, sin llegar al esfuerzo.') + ' Después empezá las series de verdad.</div></div>';
}

// ---------- reproductor ----------
let ecT = null;
function ecOverlay(){
  let ov = document.getElementById('ec-ov');
  if(!ov){ ov = document.createElement('div'); ov.id = 'ec-ov'; ov.className = 't-overlay'; document.body.appendChild(ov); }
  return ov;
}
function ecFmt(s){ s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function ecCerrar(){
  if(ecT && ecT.int) clearInterval(ecT.int);
  ecT = null;
  const ov = document.getElementById('ec-ov'); if(ov) ov.classList.remove('open');
}
function entradaCalorAbrir(dia, alTerminar){
  ecCerrar();
  const plan = entradaCalorPlan(dia);
  if(!plan.length){ if(alTerminar) alTerminar(); return; }
  ecT = { dia, plan, idx:0, acum:0, t0:Date.now(), corriendo:true, alTerminar, int:null, pintado:-1 };
  ecT.int = setInterval(ecTick, 250);
  ecOverlay().classList.add('open');
  ecTick();
}
function ecTranscurrido(){ return ecT.acum + (ecT.corriendo ? (Date.now() - ecT.t0) / 1000 : 0); }
function ecAvanzar(){
  const t = ecT; if(!t) return;
  t.idx++; t.acum = 0; t.t0 = Date.now(); t.pintado = -1;
  if(t.idx >= t.plan.length){
    const cb = t.alTerminar; ecCerrar();
    if(typeof vibrar === 'function') vibrar([60, 60, 120]);
    if(cb) cb();                                    // al terminar el bloque 3 pasa directo a la sesión, sin toques extra
    return;
  }
  if(typeof vibrar === 'function') vibrar([40, 60, 120]);
}
function ecTick(){
  const t = ecT; if(!t) return;
  const it = t.plan[t.idx];
  if(ecTranscurrido() >= it.dur){ ecAvanzar(); if(!ecT) return; }
  if(ecT.pintado !== ecT.idx) ecPintar(); else ecNumeros();
}
function ecNumeros(){
  const t = ecT; if(!t) return;
  const n = document.getElementById('ec-num'); if(n) n.textContent = ecFmt(t.plan[t.idx].dur - ecTranscurrido());
}
function ecPintar(){
  const t = ecT; if(!t) return;
  t.pintado = t.idx;
  const it = t.plan[t.idx], sig = t.plan[t.idx + 1];
  const sigTxt = sig ? ('Sigue: ' + (sig.bloque !== it.bloque ? sig.titulo + ' · ' : '') + sig.n) : 'Sigue: la sesión';
  const ov = ecOverlay();
  ov.innerHTML =
    '<div class="ec-wrap">' +
      '<div class="ec-top"><span>' + it.titulo + '</span><span>Bloque ' + it.bloque + ' de 3</span></div>' +
      '<div class="ec-centro">' +
        '<div class="ec-nombre">' + it.n + '</div>' +
        (it.dosis ? '<div class="ec-dosis">' + (it.serie ? it.serie + ' · ' : '') + it.dosis + '</div>' : '') +
        '<div class="t-timer" id="ec-num">' + ecFmt(it.dur - ecTranscurrido()) + '</div>' +
        '<p class="ec-cue">' + it.cue + '</p>' +
      '</div>' +
      '<p class="ec-sigue">' + sigTxt + '</p>' +
      '<button class="primary" id="ec-saltear" style="width:100%; margin:0 0 8px;">Saltear</button>' +
      '<div style="display:flex; gap:8px;"><button class="ghost" id="ec-pausa" style="flex:1; margin:0;">' + (t.corriendo ? 'Pausar' : 'Seguir') + '</button>' +
      '<button class="ghost" id="ec-salir" style="flex:1; margin:0;">Salir</button></div>' +
    '</div>';
  const q = id => ov.querySelector('#' + id);
  q('ec-saltear').onclick = () => { ecAvanzar(); if(ecT) ecPintar(); };
  q('ec-pausa').onclick = () => {
    const tt = ecT; if(!tt) return;
    if(tt.corriendo){ tt.acum = ecTranscurrido(); tt.corriendo = false; } else { tt.t0 = Date.now(); tt.corriendo = true; }
    ecPintar();
  };
  q('ec-salir').onclick = () => ecCerrar();
}

console.log('✅ entrada-calor.js cargado');
