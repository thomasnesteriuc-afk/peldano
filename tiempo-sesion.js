/**
 * TIEMPO-SESION.JS — la sesión es SIEMPRE de 60 min (ENCARGO, cambio del 28/10) + duración estimada de cada día.
 *
 * El plan de 60 min queda fijo. Si la sesión completa no entra, SOLO baja el finisher de 10 a 5 min. Nada más se recorta:
 * ni la entrada en calor, ni la fuerza, ni el core, ni la vuelta a la calma (el finisher y la vuelta a la calma se saltean
 * con un toque). Si aun con el finisher en 5 min no entra, la sesión queda más larga y plan.alcanza = false.
 * El selector 60 / 45 / 30 y su orden de recortes están archivados: _archivo/tiempo-sesion-selector-y-recortes.js.
 *
 * ESTIMACIÓN de duración (supuestos a la vista, para discutirlos):
 *  - Ritmo de repetición: 3 s por rep dinámica; 5 s por rep de Nordic (baja lento); 1,5 s por rep de salto.
 *  - Isométricos: el tiempo objetivo. Unilaterales: se hacen los dos lados en cada serie (x2).
 *  - 10 s por serie para acomodarse; 30 s de transición al cambiar de ejercicio (barra, banda, etc.).
 *  - Descanso entre series = el de la tarjeta (90 s, 2 min o 2:30 según el ejercicio); Nordic/Copenhagen 2 min.
 *  - Circuito de Piernas: 10 s de transición entre ejercicios y 75 s entre rondas (punto medio de 60-90 s).
 *  - Circuito de abdominales: 10 s de transición entre ejercicios y 60 s entre rondas (ENCARGO).
 *  - Entrada en calor: la suma de sus pasos (8-10 min). Finisher: 10 o 5 min. Vuelta a la calma: 3 min (ENCARGO: 2-3 min). OJO: la tarjeta
 *    actual "Estiramiento de cierre" (lista vieja) dice ~6-11 min; la Etapa 4 la reemplaza por la vuelta a la calma de 2-3 min.
 *
 * Depende de globals de index.html y entrada-calor.js: generateSession, buildBlocks, restSeconds, sessionTarget, isStatic,
 * isUnilateral, dayStretch, SALTO_REPS, DIAS, DIA_LABEL, dayFocus, entradaCalorSegundosEstimado.
 */
const TS = { MINUTOS:60, TEMPO:3, TEMPO_NORDIC:5, TEMPO_SALTO:1.5, SETUP:10, TRANSICION:30, DESC_CALIDAD:120, DESC_RONDA_PIERNAS:75, DESC_RONDA_CORE:60, TRANS_CIRC:10, VUELTA_MIN:3 };

function tsTrabajoSerie(ex){
  if(ex._libre) return parseInt(ex._dosis) || 45;                                       // soga / saltitos: 45 s
  if(ex.pattern === 'power_legs') return SALTO_REPS * TS.TEMPO_SALTO;
  const lados = isUnilateral(ex) ? 2 : 1;
  if(isStatic(ex)) return sessionTarget(ex) * lados;
  return sessionTarget(ex) * (ex.pattern === 'nordic' ? TS.TEMPO_NORDIC : TS.TEMPO) * lados;
}
function tsSegBloque(b){
  if(b.circuito){                                                                       // Piernas y abdominales: sin descanso entre ejercicios
    const descRonda = b.tipo === 'core' ? TS.DESC_RONDA_CORE : TS.DESC_RONDA_PIERNAS;
    const ronda = b.exs.reduce((t, e) => t + tsTrabajoSerie(e), 0) + TS.TRANS_CIRC * (b.exs.length - 1);
    return TS.TRANSICION + b.rondas * ronda + (b.rondas - 1) * descRonda;
  }
  const desc = ex => b.tipo === 'calidad' ? TS.DESC_CALIDAD : restSeconds(ex);
  return b.exs.reduce((t, ex) => t + TS.TRANSICION + b.rondas * (tsTrabajoSerie(ex) + TS.SETUP) + (b.rondas - 1) * desc(ex), 0);
}
function tsFuerzaSeg(full){ return buildBlocks(full).reduce((t, b) => t + tsSegBloque(b), 0); }
// Minutos de TODO el día: entrada en calor + fuerza (con el core en circuito) + finisher + vuelta a la calma.
function tsDesglose(dia, full, finisher){
  const st = dayStretch(full).length;
  return { calor: entradaCalorSegundosEstimado(dia) / 60, fuerza: tsFuerzaSeg(full) / 60, finisher, vuelta: st ? TS.VUELTA_MIN : 0 };
}
function tsTotal(d){ return d.calor + d.fuerza + d.finisher + d.vuelta; }

// Único recorte posible: finisher 10 -> 5 min.
function planTiempo(dia, full){
  if(!full) return generateSession(dia).plan;
  let finisher = 10;
  if(tsTotal(tsDesglose(dia, full, finisher)) > TS.MINUTOS) finisher = 5;
  const desglose = tsDesglose(dia, full, finisher);
  const estimadoMin = tsTotal(desglose);
  return { minutos:TS.MINUTOS, finisher, desglose, estimadoMin, alcanza: estimadoMin <= TS.MINUTOS };
}
// El plan del día que se está por entrenar.
function planTiempoHoy(){ return planTiempo(dayFocus); }

// Herramienta de desarrollo: duración por día y nivel de progreso (0 = recién empieza … 3 = avanzado).
//   estimarDuracionDias()  -> [{ nivel, dia, estimadoMin, minimo, maximo, calor, fuerza, finisher, vuelta, alcanza }]
function estimarDuracionDias(){
  const guardado = { prog: JSON.stringify(progState), stats: JSON.stringify(stats) };
  const filas = [];
  stats.sessions = 20; stats.lastSessionTs = null;
  for(const k of [0, 1, 2, 3]){
    progState = {}; Object.keys(LADDERS).forEach(p => fijarPuntoDePartida(p, Math.min(k, LADDERS[p].rungs.length - 1)));
    for(const d of DIAS){
      const pl = [];
      for(let s0 = 0; s0 < 12; s0++){ stats.varOffset = s0; stats.bloque = null; pl.push(generateSession(d).plan); }
      const prom = f => pl.reduce((x, p) => x + f(p), 0) / pl.length;
      filas.push({ nivel:k, dia:DIA_LABEL[d], estimadoMin:+prom(p => p.estimadoMin).toFixed(0), minimo:+Math.min(...pl.map(p => p.estimadoMin)).toFixed(0), maximo:+Math.max(...pl.map(p => p.estimadoMin)).toFixed(0),
        calor:+prom(p => p.desglose.calor).toFixed(1), fuerza:+prom(p => p.desglose.fuerza).toFixed(0), finisher:+prom(p => p.finisher).toFixed(1), vuelta:+prom(p => p.desglose.vuelta).toFixed(0), alcanza:pl.every(p => p.alcanza) });
    }
  }
  progState = JSON.parse(guardado.prog); stats = JSON.parse(guardado.stats);
  return filas;
}
console.log('✅ tiempo-sesion.js cargado');
