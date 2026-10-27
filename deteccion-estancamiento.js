/**
 * DETECCION-ESTANCAMIENTO.JS
 * Detecta cuando un movimiento lleva 3+ semanas en el mismo peldaño sin dominarse,
 * y propone bajar el volumen (deload) para consolidar.
 *
 * Trabaja sobre el sistema real de escaleras (LADDERS/progState/registerMark,
 * definidos en index.html) — no sobre un esquema de datos propio. La versión
 * anterior de este archivo operaba sobre un esquema (ejerciciosDB[id].series,
 * .reps.max, .progresiones) que no correspondía ni a bibliotecaCalistenia ni a
 * LADDERS, y sus "adaptaciones" nunca llegaban a aplicarse de verdad a la
 * siguiente sesión generada.
 */

// ===== ¿CUÁNTAS SEMANAS PASARON ENTRE DOS CLAVES DE SEMANA (weekKeyOf)? =====
function weeksBetweenKeys(keyA, keyB) {
  const toDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  return Math.round((toDate(keyB) - toDate(keyA)) / (7 * 24 * 60 * 60 * 1000));
}

// ===== ¿ESTÁ ESTANCADO ESTE PATRÓN? (3+ semanas en el mismo peldaño, sin dominar) =====
function detectarEstancamiento(pattern) {
  const ex = topAvailable(pattern);
  if (!ex) return null;

  const st = progState[ex.name];
  if (!st || st.mastered || !st.rungSince) return null;

  const semanas = weeksBetweenKeys(st.rungSince, weekKeyOf(Date.now()));
  if (semanas >= 3) return { pattern, ex, semanas };
  return null;
}

// ===== REVISAR TODAS LAS ESCALERAS =====
function detectarEstancamientoGeneral() {
  return Object.keys(LADDERS).map(detectarEstancamiento).filter(Boolean);
}

// ===== PROPONER DELOAD: BAJA EL OBJETIVO UN ESCALÓN, SIN MARCAR "regressed" =====
// (regressed es la baja por "me costó 2 veces"; esto es una recalibración por estancamiento,
// no un retroceso, así que no dispara el mensaje "bajamos a la variante más fácil").
function proponerDeload(pattern) {
  const ex = topAvailable(pattern);
  if (!ex) return null;

  const st = ensureProg(ex);
  const floor = tFloor(ex);
  if (st.target - tStep(ex) >= floor) st.target -= tStep(ex);
  st.rungSince = weekKeyOf(Date.now()); // reinicia el conteo para no repetir la propuesta la próxima semana

  if (typeof saveState === 'function') saveState();
  console.log(`📉 Deload propuesto para ${ex.name}: nuevo objetivo ${st.target}`);
  return st;
}

// ===== RENDERIZAR BANNER DE ESTANCAMIENTO (uno por escalera estancada) =====
function renderNotificacionEstancamiento() {
  const casos = detectarEstancamientoGeneral();
  if (!casos.length) return '';

  return casos.map(c => (
    '<div style="background:var(--accent-dim); border:1.5px solid var(--accent); border-radius:12px; padding:14px; margin-bottom:16px;">' +
      '<p style="font-weight:700; color:var(--accent-strong); margin:0 0 6px; font-size:14px;">🧭 Llevás ' + c.semanas + ' semanas en ' + c.ex.name + '</p>' +
      '<p style="font-size:12.5px; color:var(--text-dim); margin:0 0 10px;">¿Bajamos el volumen esta semana para consolidar? No es retroceder, es afianzar la base.</p>' +
      '<button class="ghost btn-deload" data-pattern="' + c.pattern + '" style="width:100%;">Bajar volumen de ' + c.ex.name + '</button>' +
    '</div>'
  )).join('');
}

console.log('✅ deteccion-estancamiento.js cargado (basado en LADDERS/progState)');
console.log('Funciones disponibles:');
console.log('  - detectarEstancamiento(pattern) / detectarEstancamientoGeneral()');
console.log('  - proponerDeload(pattern)');
console.log('  - renderNotificacionEstancamiento()');
