/**
 * CARGA.JS — carga por ARTICULACIÓN dentro de la sesión (FEEDBACK_ENTRENAMIENTO.md, ítem 1).
 *
 * Problema real: Empuje con pseudo push-ups → pike push-ups → flexiones → remo en anillas. Son patrones distintos, pero los
 * tres primeros cargan fuerte el hombro anterior y el remo en anillas exige estabilidad de hombro: terminó con el hombro fatigado.
 *
 * Cada ejercicio lleva carga en 4 zonas (hombro, codo, muñeca, lumbar): 0 = ninguna, 1 = baja, 2 = media, 3 = alta.
 * Las etiquetas que ya existían en las habilidades (Planche y Front Lever: codo/bíceps ALTA, ENCARGO Etapa 5) se respetan;
 * el resto las completó Claude y están marcadas `revisado:'pendiente'` (tabla CARGA_PATRON / CARGA_NOMBRE) a revisar por Thomás.
 *
 * El motor SUMA la carga de la sesión a medida que la arma, en el orden real (habilidad → anclas → secundario → core):
 *   puntos de una zona = nivel de carga × cantidad de series del ejercicio (la aproximación cuenta como 1 serie).
 * CRITERIO (no número rígido; los umbrales se pueden revisar en CARGA_UMBRAL):
 *   · ALTA  = zona que ya acumuló carga alta: los ejercicios que siguen se eligen con carga BAJA (1) en esa zona.
 *   · MAX   = tope duro: ninguna sesión lo supera. Si un ejercicio lo superaría, se cambia por otro del mismo grupo con menos
 *             carga en esa zona (ej.: remo en anillas → australiana o remo en barra) y, si no hay, se saca.
 * La habilidad y la primera ancla del día NUNCA se tocan; sí el segundo ancla y los accesorios.
 */
const CARGA_ZONAS = ['hombro', 'codo', 'muñeca', 'lumbar'];
const CARGA_TXT = ['ninguna', 'baja', 'media', 'alta'];
// Umbrales en puntos (nivel x series). ALTA = "ya acumuló carga alta"; MAX = tope duro de la sesión.
const CARGA_UMBRAL = { hombro:{ alta:22, max:32 }, codo:{ alta:28, max:40 }, 'muñeca':{ alta:24, max:32 }, lumbar:{ alta:24, max:34 } };

// Carga base por patrón de escalera: [hombro, codo, muñeca, lumbar]
const CARGA_PATRON = {
  push_horiz:[2, 2, 2, 0], dips:[3, 2, 1, 0], push_vert:[3, 2, 3, 0], triceps:[1, 3, 2, 0], planche:[3, 3, 3, 1],
  pull_vert:[2, 3, 1, 0], pull_horiz:[1, 2, 1, 0], pull_activ:[1, 0, 1, 0], ring_support:[2, 1, 1, 0], muscleup:[3, 3, 1, 1], front_lever:[3, 3, 1, 2],
  squat:[0, 0, 0, 1], squat_uni:[0, 0, 0, 1], lunge:[0, 0, 0, 1], power_legs:[0, 0, 0, 1], hinge:[0, 0, 1, 2], hinge_uni:[0, 0, 0, 2], nordic:[0, 0, 0, 1], copenhagen:[0, 0, 0, 1],
  core_recto:[0, 0, 0, 1], core_oblicuo:[0, 0, 0, 1], core_lumbar:[0, 0, 1, 2], core_estab:[1, 0, 1, 1], core_antiext:[0, 0, 0, 1]
};
// Excepciones por ejercicio (las hermanas de cada escalera también).
const CARGA_NOMBRE = {
  // empuje horizontal
  'Flexión inclinada (manos elevadas)':[1, 1, 1, 0], 'Flexión con rodillas':[1, 1, 1, 0], 'Flexiones diamante':[2, 3, 2, 0], 'Flexiones en anillas':[3, 2, 1, 0],
  'Flexiones arqueras de rodillas':[2, 3, 2, 0], 'Flexiones arqueras':[3, 3, 2, 0], 'Flexiones a puños':[2, 2, 1, 0], 'Flexiones agarre amplio':[3, 1, 2, 0], 'Hindu push ups':[3, 2, 2, 1],
  // fondos
  'Fondos en banco (pies apoyados)':[2, 2, 2, 0], 'Korean dips':[3, 3, 2, 0], 'Fondos en anillas':[3, 3, 1, 0], 'Fondos con balanceo':[3, 3, 1, 0], 'Fondos asistidos en anillas':[2, 2, 1, 0],
  // empuje vertical / pino
  'Pike push up':[3, 2, 2, 0], 'Pino en pared (asistido)':[3, 1, 3, 0], 'Pino':[3, 1, 3, 0], 'Flexiones a pino':[3, 3, 3, 0], 'L sit a pino':[3, 2, 3, 1],
  'Straddle press a pino':[3, 2, 3, 1], 'Press a pino':[3, 2, 3, 1], 'Pino a una mano':[3, 2, 3, 1],
  // planche
  'Pseudo push ups':[3, 2, 3, 0],
  // tirón
  'Remo en anillas (ring row)':[2, 2, 1, 0], 'Australiana prona (barra baja)':[1, 1, 1, 0], 'Australiana supina (barra baja)':[1, 2, 1, 0], 'Australiana con pies elevados':[2, 2, 1, 0], 'Remo en barra':[1, 2, 1, 1],
  'Dominadas con banda':[2, 2, 1, 0], 'Dominadas en anillas':[3, 3, 1, 0], 'Dominadas explosivas':[3, 3, 1, 0], 'Dominadas asimétricas':[3, 3, 1, 0], 'Soporte en anillas (support hold)':[2, 1, 1, 0],
  // piernas / cadena posterior
  'Puente corto':[0, 0, 1, 2], 'Puente completo':[2, 0, 3, 3], 'Puente de pie a pie':[2, 0, 3, 3],
  // core
  'Knee raises en barra':[1, 0, 1, 1], 'Leg raises en suelo':[0, 0, 0, 2], 'Leg raises en barra':[2, 1, 1, 2], 'Dragon flag a 1 pierna':[2, 1, 0, 3], 'Dragon flag':[2, 1, 0, 3],
  'L sit raises en fondos':[2, 1, 2, 2], 'L sit raises en barra':[2, 1, 1, 2], 'Pullover':[3, 3, 1, 2], 'Plancha a extensión':[2, 1, 2, 1], 'Plancha lateral':[2, 1, 1, 1], 'Windshield wipers en suelo':[0, 0, 0, 2],
  'Crunches cortos lumbares':[0, 0, 0, 2], 'Birdog':[1, 0, 2, 1], 'Plancha abdominal':[2, 1, 0, 1], 'L-sit a tuck (en paralelas)':[2, 2, 2, 1], 'L sit en anillas':[3, 2, 1, 1],
  'Plancha RKC':[2, 1, 0, 1], 'Hollow body':[0, 0, 0, 2]
};
// Carga de un ejercicio: { hombro, codo, muñeca, lumbar } en 0-3. Lo que no está en ninguna tabla se asume baja en lo que toca (1,1,1,0).
function cargaDe(ex){
  const v = (ex && CARGA_NOMBRE[ex.name]) || (ex && CARGA_PATRON[ex.pattern]) || [1, 1, 1, 0];
  return { hombro:v[0], codo:v[1], 'muñeca':v[2], lumbar:v[3] };
}
// Puntos que aporta un ejercicio con `series` series.
// El core cuenta SOLO en lumbar (el pedido suma habilidad, anclas, accesorios y aproximación; la plancha o el colgado del core no entran en hombro/codo/muñeca).
function cargaPuntos(ex, series){
  const c = cargaDe(ex), p = {}, esCore = (typeof zoneOf === 'function') && zoneOf(ex.pattern) === 'core';
  CARGA_ZONAS.forEach(z => { p[z] = (esCore && z !== 'lumbar') ? 0 : c[z] * series; }); return p;
}
function cargaVacia(){ const a = {}; CARGA_ZONAS.forEach(z => { a[z] = 0; }); return a; }
// ¿Se puede agregar `ex` (con `series`) a lo acumulado? Reglas: si la zona ya está en ALTA, solo carga baja; nunca pasar el MAX.
function cargaPermite(acum, ex, series){
  const c = cargaDe(ex), p = cargaPuntos(ex, series);
  return CARGA_ZONAS.every(z => {
    if(!p[z]) return true;
    if(acum[z] >= CARGA_UMBRAL[z].alta && c[z] > 1) return false;
    return acum[z] + p[z] <= CARGA_UMBRAL[z].max;
  });
}
function cargaSumar(acum, ex, series){ const p = cargaPuntos(ex, series); CARGA_ZONAS.forEach(z => { acum[z] += p[z]; }); return acum; }
// Carga total de una sesión ya armada, en el orden real y con las series que se van a hacer (la aproximación = 1 serie del ejercicio simple).
function cargaDeSesion(ses){
  const acum = cargaVacia(), bl = buildBlocks(ses);
  const primer = (typeof ecPrimerFuerte === 'function') ? ecPrimerFuerte(ses.dia, ses) : null;
  if(primer && typeof aproximacionDe === 'function'){ const ap = exByName(aproximacionDe(primer).nombre); if(ap) cargaSumar(acum, ap, 1); }
  bl.forEach(b => b.exs.forEach(ex => { if(!ex._libre) cargaSumar(acum, ex, b.rondas); }));
  return acum;
}

// ---------- ajuste de la sesión por carga ----------
// Recorre la sesión en su orden real (habilidad → anclas → secundario → core) sumando la carga. Un ejercicio que NO puede entrar
// (la zona ya está en ALTA y tiene carga mayor a baja, o pasaría el MAX) se cambia por otro del mismo grupo que sí entre y, si no hay,
// se saca. NUNCA se tocan: la habilidad, la primera ancla, el bloque de calidad (Nordic/Copenhagen), los ejercicios de Piernas del
// circuito y el anti-extensión / abdomen recto del core. El segundo ancla del día no retrocede en su propia escalera.
function cargaAlternativa(ex, r, s, acum, ctx, usados, yaEnSesion){
  const zona = zoneOf(ex.pattern);
  if(zona !== 'empuje' && zona !== 'tiron') return null;
  const secundario = (r === 'acc' || r === 'circ');
  const pats = secundario ? (zona === 'empuje' ? ctx.pushSec : ctx.pullSec) : (zona === 'empuje' ? ctx.pushPats : ctx.pullPats);
  const nombres = new Set(yaEnSesion.map(e => e.name)), cand = [];
  pats.forEach(p => {
    if(!secundario && p === ex.pattern) return;                          // el ancla no retrocede en su propia escalera
    if(p !== ex.pattern && usados.has(p)) return;                        // un ejercicio por patrón por sesión
    const L = LADDERS[p]; if(!L) return;
    L.rungs.map(exByName).concat((SIBLINGS[p] || []).map(exByName)).forEach(e => {
      if(!e || !isDoable(e) || nombres.has(e.name) || cand.includes(e)) return;
      if(secundario && (e.dif || 0) > TOPE_DIF_SEC) return;              // el secundario sigue siendo liviano
      cand.push(e);
    });
  });
  cand.sort((a, b) => ((b.pattern === ex.pattern) - (a.pattern === ex.pattern)) || ((b.dif || 0) - (a.dif || 0)) || ((b.rung || 0) - (a.rung || 0)));
  const ok = cand.find(e => cargaPermite(acum, e, s));
  return ok ? Object.assign({}, ok) : null;
}
// orden: ejercicios en el orden de la sesión · rol: Map(ejercicio -> rol) · ctx: { dia, descarga, pushPats, pullPats, pushSec, pullSec }
function cargaAjustar(orden, rol, ctx){
  const acum = cargaVacia(), out = [], cambios = [];
  const zonaDia = { tiron:'tiron', empuje:'empuje', piernas:'piernas' }[ctx.dia];
  const primer = orden.find(e => e._skill) || orden.find(e => zoneOf(e.pattern) === zonaDia);
  if(primer && typeof aproximacionDe === 'function'){ const ap = exByName(aproximacionDe(primer).nombre); if(ap) cargaSumar(acum, ap, 1); }   // la aproximación cuenta (1 serie)
  const serDe = r => (r === 'circ') ? rondasCircuito({ descarga:ctx.descarga }) : seriesDeRol(r, { descarga:ctx.descarga });
  const usados = new Set(orden.map(e => e.pattern));
  let primeraAncla = null;
  orden.forEach(ex => {
    const r = rol.get(ex), s = serDe(r), zona = zoneOf(ex.pattern);
    if(r === 'ancla' && !primeraAncla) primeraAncla = ex;
    const fijo = r === 'skill' || r === 'bajoA' || ex === primeraAncla || (r === 'circ' && zona === 'piernas') || (r === 'core' && /^core_(antiext|recto)$/.test(ex.pattern));
    if(fijo || cargaPermite(acum, ex, s)){ out.push(ex); cargaSumar(acum, ex, s); return; }
    const alt = cargaAlternativa(ex, r, s, acum, ctx, usados, out);
    usados.delete(ex.pattern);
    if(alt){ rol.set(alt, r); usados.add(alt.pattern); out.push(alt); cargaSumar(acum, alt, s); cambios.push({ de:ex.name, a:alt.name, rol:r }); }
    else cambios.push({ de:ex.name, a:null, rol:r });
  });
  return { orden:out, acum, cambios };
}
console.log('✅ carga.js cargado');
