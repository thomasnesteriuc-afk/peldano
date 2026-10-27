/**
 * ENTRADA-CALOR.JS — Entrada en calor guiada (ENCARGO.md, Etapa 3)
 *
 * 8–10 min al inicio de cada sesión, en 3 bloques, en formato REPRODUCTOR (nunca una lista):
 *   1. Movilidad articular (dinámica, de arriba hacia abajo: muñecas siempre, hombros, columna, cadera, rodillas, tobillos)
 *   2. Activación según el tipo de día (todos: retroversión pélvica + puente de glúteo)
 *   3. Calentamiento: soga (o saltitos) + 1–2 series fáciles de aproximación del primer ejercicio fuerte
 * Sin estáticos de más de 30 s. Fija por tipo de día durante el bloque mensual (stats.bloque.calor[dia]).
 * Avanza sola al terminar el timer; un toque para saltear el ejercicio; al terminar el bloque 3 arranca la sesión.
 *
 * Los textos de técnica salen de lo que ya tenía la app (CUES / MOVILIDAD) donde existía. Los marcados con
 * `revisado:"entrenador"` fueron revisados por el entrenador (no es fuente bibliográfica y no se inventa una).
 * Depende de globals de index.html: stats, profile, myEquip, generateSession, exByName, isStatic, isUnilateral,
 * hasEquip, equipmentOf, progState, tBase, bloqueVigente, HABILIDADES, saveState, DIA_LABEL.
 */

// ---------- contenido ----------
const EC_B1 = [
  { n:'Círculos de muñeca',  seg:30, cue:'Manos entrelazadas o apoyadas: círculos controlados en las dos direcciones. Sumá flexión y extensión completa.' },
  { n:'Círculos de brazo',   seg:30, cue:'Brazos extendidos a los costados: círculos grandes y controlados, hacia adelante y hacia atrás.' },
  { n:'Gato-vaca',           seg:30, cue:'En cuadrupedia, arqueá la espalda hacia arriba y después hundila, siguiendo el movimiento con la cabeza. Lento, con la respiración.' },
  { n:'Círculos de cadera',  seg:30, cue:'Llevá una rodilla al pecho y abrila hacia afuera en un círculo grande. Alterná las piernas. Rango completo, sin forzar.' },
  { n:'Sentadilla lenta de rango completo', seg:40, cue:'Bajá lento lo más profundo que te permita la movilidad, talones apoyados y rodillas en la línea de los pies. Pausa 1 s abajo y subí.', revisado:'entrenador' },
  { n:'Círculos de tobillo', seg:30, cue:'Apoyá la punta del pie y dibujá círculos con el tobillo. Cambiá de pie y de sentido.', revisado:'entrenador' }
];
const EC_ACT_TODOS = [
  { n:'Retroversión pélvica', seg:30, cue:'Acostado con las rodillas dobladas, aplastá la zona lumbar contra el piso llevando el pubis hacia el ombligo. Soltá y repetí, lento. Exhalá mientras aplanás la lumbar. Movés solo la pelvis: los glúteos no se despegan del piso.', revisado:'entrenador' },
  { n:'Puente de glúteo',     seg:30, cue:'Empujá con los talones y subí la cadera hasta hacer una línea recta. Apretá el glúteo arriba un segundo y bajá controlado.' }
];
const EC_ACT_DIA = {
  tiron: [
    { n:'Retracciones escapulares colgado', seg:40, cue:'Colgado de la barra, retraé las escápulas sin flexionar los brazos.', equipo:'Barra' },
    { n:'Aperturas con banda',              seg:40, cue:'Con la banda tomada al frente y los brazos estirados, separá las manos llevando la banda hacia el pecho y juntando los omóplatos. Brazos a la altura de los hombros, sin subirlos hacia las orejas ni arquear la lumbar. Volvé controlando la banda.', equipo:'Banda', revisado:'entrenador' }
  ],
  empuje: [
    { n:'Flexiones escapulares', seg:40, cue:'En posición de flexión con los brazos estirados, hundí y elevá el pecho moviendo solo los omóplatos. El movimiento es chiquito.' },
    { n:'Muñecas con apoyo',     seg:40, cue:'Palmas en el piso con los dedos hacia adelante: llevá el peso suavemente hacia adelante y atrás. Repetí con los dedos hacia los costados. En cuatro apoyos. Sumá una pasada suave con los dedos hacia atrás, sin dolor.', revisado:'entrenador' }
  ],
  piernas: [
    { n:'Puente a una pierna',        seg:30, lados:true, cue:'Boca arriba, una rodilla doblada con el pie en el piso y la otra pierna estirada en el aire. Empujá con el talón y subí la cadera hasta hacer una línea recta.' },
    { n:'Sentadilla profunda sostenida', seg:30, cue:'Bajá a la posición más profunda que puedas con los talones en el piso, empujando las rodillas hacia afuera con los codos. Es sostener, sin movimiento.' },
    { n:'Tobillos: rodilla hacia adelante', seg:30, cue:'Con el pie apoyado y el talón en el piso, llevá la rodilla hacia adelante pasando la punta del pie. Volvé y repetí. Rodilla alineada con el segundo dedo del pie; el talón nunca se despega.', revisado:'entrenador' }
  ]
};
const EC_SOGA = 100;        // segundos de soga / saltitos (1–2 min)
const EC_SERIE = 55;        // segundos por serie de aproximación (serie + descanso)

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
// Fijo por tipo de día durante el bloque mensual: se calcula una vez y se guarda en stats.bloque.calor[dia].
function ecAproxFija(dia){
  const b = bloqueVigente();
  if(!b.calor) b.calor = {};
  let f = b.calor[dia];
  if(f && (!exByName(f.nombre) || !hasEquip(exByName(f.nombre)))) f = null;   // si ya no se puede hacer, se rearma
  if(!f){
    const fuerte = ecPrimerFuerte(dia, generateSession(dia));
    f = fuerte ? ecAproximacion(fuerte) : { vacio:true };
    b.calor[dia] = f;
    if(typeof saveState === 'function') saveState();
  }
  return f;
}
// `sinAprox` solo sirve para estimar la duración sin tocar el bloque fijo (ver tiempo-sesion.js).
function entradaCalorPlan(dia, sinAprox){
  const eq = it => !it.equipo || myEquip.includes(it.equipo);                 // sin el equipo, el ejercicio se omite
  const mapear = (lista, bloque, titulo) => {
    const out = [];
    lista.filter(eq).forEach(it => {
      if(it.lados) ecLados().forEach((lado, k) => out.push({ bloque, titulo, n: it.n + ' · ' + lado, dur: it.seg, cue: it.cue, revisado: it.revisado }));
      else out.push({ bloque, titulo, n: it.n, dur: it.seg, cue: it.cue, revisado: it.revisado });
    });
    return out;
  };
  const delDia = (EC_ACT_DIA[dia] || []);
  const plan = [].concat(
    mapear(EC_B1, 1, "Movilidad"),
    mapear(EC_ACT_TODOS.concat(delDia), 2, "Activación")
  );
  // Bloque 3: soga (o saltitos) + 1–2 series fáciles de aproximación
  const conSoga = myEquip.includes('Soga');
  plan.push({ bloque:3, titulo:'Calentamiento', n: conSoga ? 'Soga' : 'Saltitos en el lugar', dur: EC_SOGA,
              cue: conSoga ? 'Saltos cortos y livianos, muñecas sueltas, aterrizá en la punta de los pies.' : 'Saltitos livianos en el lugar, aterrizando en la punta de los pies.' });
  if(sinAprox) return plan;
  const ap = ecAproxFija(dia);
  if(!ap.vacio){
    const dosis = ap.estatico ? ap.dosis + ' s' : ap.dosis + ' reps';
    for(let s = 1; s <= 2; s++){
      plan.push({ bloque:3, titulo:'Calentamiento', n: ap.nombre, dosis: dosis + (ap.uni ? ' por lado' : '') + ' · fácil', serie: 'Serie ' + s + ' de 2', dur: EC_SERIE,
                  cue: ap.uni ? 'Arrancá por el lado débil. Sin llegar al esfuerzo: es para entrar en calor.' : 'Sin llegar al esfuerzo: es para entrar en calor.' });
    }
  }
  return plan;
}
function entradaCalorSegundos(plan){ return plan.reduce((t, x) => t + x.dur, 0); }
// Duración estimada sin armar la aproximación fija (evita pedir la sesión dentro del cálculo de la sesión): siempre 2 series.
function entradaCalorSegundosEstimado(dia){ return entradaCalorSegundos(entradaCalorPlan(dia, true)) + 2 * EC_SERIE; }

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
