/**
 * ESTIRAMIENTOS.JS — sesión EXCLUSIVA de estiramientos (pedido de Thomás, 06/11).
 *
 * Es un cuarto botón en la elección de día (junto a Tirón, Empuje y Piernas), pero NO forma parte del ciclo de 3 días: no se bloquea,
 * no bloquea a los otros y no cuenta como sesión de fuerza (no mueve el bloque mensual, ni la descarga, ni los abdominales).
 * Formato reproductor, igual que la entrada en calor: un estiramiento por pantalla con su cuenta regresiva (los estáticos son el único
 * lugar donde manda el tiempo: 30 s por lado). Pasa solo al siguiente lado / estiramiento; "Siguiente" lo salta; se puede pausar.
 * Recorre todo el cuerpo en un orden fijo (arriba → abajo): dorsal, pecho, hombro, tríceps, bíceps y antebrazo, abdomen, flexor de cadera,
 * cuádriceps, isquios, glúteo, aductores, gemelo (~10 min). Sin el equipo marcado se saltea lo que lo necesita (barra).
 * Los textos de técnica salen de STRETCH_BY_ZONE (index.html), la lista que ya tenía la app.
 * Depende de globals de index.html: STRETCH_BY_ZONE, myEquip, stats, saveState, renderDay, vibrar (opcional).
 */

// zona -> { seg: segundos por lado (o por vez), lados: 1 | 2, equipo? }. Orden = orden de la sesión.
const EST_SESION = [
  { zona:'dorsal',        seg:30, lados:1, equipo:'Barra' },
  { zona:'pecho',         seg:30, lados:2 },
  { zona:'hombro',        seg:30, lados:1, equipo:'Barra' },
  { zona:'triceps',       seg:30, lados:2 },
  { zona:'biceps',        seg:30, lados:2 },
  { zona:'abdomen',       seg:30, lados:1 },
  { zona:'flexor_cadera', seg:30, lados:2 },
  { zona:'cuadriceps',    seg:30, lados:2 },
  { zona:'isquios',       seg:30, lados:2 },
  { zona:'gluteo',        seg:30, lados:2 },
  { zona:'aductor',       seg:30, lados:1 },
  { zona:'gemelo',        seg:30, lados:2 }
];
const EST_PREP = 5;     // segundos para acomodarse antes del primero

function estiramientosPlan(){
  return EST_SESION.filter(p => !p.equipo || myEquip.includes(p.equipo)).map(p => {
    const z = STRETCH_BY_ZONE[p.zona];
    return { zona:p.zona, n:z.n, d:z.d, seg:p.seg, lados:p.lados, dosis: p.seg + ' s' + (p.lados === 2 ? ' por lado' : '') };
  });
}
function estiramientosSegundos(plan){ return (plan || estiramientosPlan()).reduce((t, p) => t + p.seg * p.lados, 0); }

let estT = null;
function estOverlay(){
  let ov = document.getElementById('est-ov');
  if(!ov){ ov = document.createElement('div'); ov.id = 'est-ov'; ov.className = 't-overlay'; document.body.appendChild(ov); }
  return ov;
}
function estCerrar(){
  if(estT && estT.int) clearInterval(estT.int);
  estT = null;
  if(typeof alarmaSoltar === 'function'){ alarmaSoltar('est'); alarmaReset('est:'); }
  const ov = document.getElementById('est-ov'); if(ov) ov.classList.remove('open');
}
function estiramientosAbrir(){
  estCerrar();
  const plan = estiramientosPlan();
  estT = { plan, idx:0, lado:1, prep:true, acum:0, t0:Date.now(), corriendo:true, terminado:false, int:null, pintado:'' };
  estT.int = setInterval(estTick, 250);
  estOverlay().classList.add('open');
  if(typeof alarmaDesbloquear === 'function'){ alarmaDesbloquear(); alarmaReset('est:'); alarmaMantener('est'); }   // alarma (11/11): sonido destrabado con el toque + pantalla encendida
  estTick();
}
const estVibrar = p => { try{ if(typeof vibrar === 'function') vibrar(p); }catch(e){ /* sin vibración */ } };
function estTranscurrido(){ return estT.acum + (estT.corriendo ? (Date.now() - estT.t0) / 1000 : 0); }
function estDuracion(){ return estT.prep ? EST_PREP : estT.plan[estT.idx].seg; }
// Pasa al siguiente lado, o al siguiente estiramiento; al terminar el último queda la pantalla final.
function estAvanzar(){
  const t = estT; if(!t) return;
  t.acum = 0; t.t0 = Date.now();
  if(t.prep){ t.prep = false; estVibrar([40, 60, 120]); return; }
  const p = t.plan[t.idx];
  if(t.lado < p.lados){ t.lado++; estVibrar([40, 60, 120]); return; }
  t.idx++; t.lado = 1;
  if(t.idx >= t.plan.length){ t.terminado = true; t.corriendo = false; clearInterval(t.int); t.int = null; if(typeof alarmaSoltar === 'function') alarmaSoltar('est'); return; }
  estVibrar([40, 60, 120]);
}
function estTick(){
  const t = estT; if(!t) return;
  if(!t.terminado){                                                    // ALARMA: pitidos 3-2-1 y aviso al final de cada lado / estiramiento; alarma larga al final de todo
    const rest = estDuracion() - estTranscurrido(), p = t.plan[t.idx];
    if(typeof alarmaTick === 'function') alarmaTick('est:' + (t.prep ? 'prep' : t.idx + ':' + t.lado), rest, { fin: !t.prep && t.idx === t.plan.length - 1 && t.lado === p.lados });
    if(rest <= 0) estAvanzar();
  }
  const clave = t.terminado ? 'fin' : (t.prep ? 'prep' : t.idx + ':' + t.lado) + ':' + t.corriendo;
  if(t.pintado !== clave){ t.pintado = clave; estPintar(); }
  else { const n = document.getElementById('est-num'); if(n && !t.terminado) n.textContent = estFmt(estDuracion() - estTranscurrido()); }
}
function estFmt(s){ s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function estPintar(){
  const t = estT; if(!t) return;
  const ov = estOverlay();
  let cuerpo;
  if(t.terminado){
    cuerpo = '<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center;">' +
      '<div style="font-size:44px;">✓</div><div style="font-size:20px; font-weight:800;">Estiramientos terminados</div></div>' +
      '<button class="primary" id="est-ok" style="width:100%; min-height:56px;">Listo</button>';
  } else {
    const p = t.plan[t.idx], sig = t.plan[t.idx + 1];
    const titulo = t.prep ? 'Prepárate' : p.n, sub = t.prep ? (t.plan[0].n) : (p.lados === 2 ? 'Lado ' + t.lado + ' de 2' : '');
    cuerpo = '<div style="display:flex; justify-content:space-between; font-weight:800; font-size:16px; letter-spacing:.06em;"><span>ESTIRAMIENTOS</span><span>' + (t.prep ? '' : (t.idx + 1) + ' de ' + t.plan.length) + '</span></div>' +
      '<div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">' +
        '<div style="font-size:26px; font-weight:800; line-height:1.15; overflow-wrap:anywhere;">' + titulo + '</div>' +
        (sub ? '<div style="font-size:18px; font-weight:700; margin-top:4px;">' + sub + '</div>' : '') +
        '<div class="t-timer" id="est-num">' + estFmt(estDuracion() - estTranscurrido()) + '</div>' +
        (t.prep ? '' : '<div style="font-size:18px; font-weight:700;">' + p.dosis + '</div>' +
          '<details class="como-se-hace cs-lite" style="margin-top:10px;"><summary style="font-size:15px; font-weight:600; justify-content:center;">Cómo se hace</summary><div style="margin:6px 0 0;">' + ((typeof descripcionHTML === 'function' && descripcionHTML(p.n)) || p.d) + '</div></details>') +
      '</div>' +
      '<p style="text-align:center; font-size:14px; margin:0 0 10px;">' + (sig ? 'Sigue: ' + sig.n : (t.prep ? '' : 'Último')) + '</p>' +
      '<button class="primary" id="est-pausa" style="width:100%; min-height:56px; margin:0 0 8px;">' + (t.corriendo ? 'Pausar' : 'Seguir') + '</button>' +
      '<div style="display:flex; gap:8px;"><button class="ghost" id="est-sig" style="flex:1; margin:0; min-height:48px;">Siguiente</button><button class="ghost" id="est-salir" style="flex:1; margin:0; min-height:48px;">Salir</button></div>';
  }
  ov.innerHTML = '<div style="max-width:460px; margin:0 auto; padding:22px 20px 34px; min-height:100vh; box-sizing:border-box; display:flex; flex-direction:column;">' + cuerpo + '</div>';
  const q = id => ov.querySelector('#' + id);
  if(q('est-pausa')) q('est-pausa').onclick = () => { const tt = estT; if(!tt) return; if(tt.corriendo){ tt.acum = estTranscurrido(); tt.corriendo = false; } else { tt.t0 = Date.now(); tt.corriendo = true; } tt.pintado = ''; estTick(); };
  if(q('est-sig')) q('est-sig').onclick = () => { estAvanzar(); if(estT) { estT.pintado = ''; estTick(); } };
  if(q('est-salir')) q('est-salir').onclick = estCerrar;
  if(q('est-ok')) q('est-ok').onclick = () => { estRegistrar(); estCerrar(); if(typeof renderDay === 'function') renderDay(); };
}
// Queda anotado (fecha) cuántas veces se hizo; no toca el ciclo de 3 días ni el bloque mensual.
function estRegistrar(){
  if(!Array.isArray(stats.estiramientosLog)) stats.estiramientosLog = [];
  stats.estiramientosLog.push({ f:new Date().toISOString(), n:estT ? estT.plan.length : 0 });
  if(stats.estiramientosLog.length > 90) stats.estiramientosLog.shift();
  stats.estiramientosHechos = (stats.estiramientosHechos || 0) + 1;
  try{ if(typeof saveState === 'function') saveState(); }catch(e){ /* no bloquear */ }
}

console.log('✅ estiramientos.js cargado');
