/**
 * ALARMA.JS — alarma de los timers (pedido de Thomás, 11/11): AMRAP, EMOM, intervalos, descansos entre vueltas y entre series, estiramientos y el timer manual.
 *
 *  · AL LLEGAR AL LÍMITE: sonido claro + la pantalla entera parpadea (aviso visual por si el celular está en silencio). Al final de un tramo (cambio de
 *    minuto, de intervalo, de lado, fin de descanso) suena un doble pitido; al final de TODO el timer, una alarma larga.
 *  · PITIDOS CORTOS a los 3-2-1 segundos antes de cada final.
 *  · SONIDO "DESBLOQUEADO": iOS no deja sonar audio sin un gesto del usuario. El contexto de audio se destraba en el primer toque de la pantalla
 *    (y en cada toque siguiente, por si iOS lo suspendió) y, sobre todo, en el toque de "Empezar" de cada timer (alarmaDesbloquear).
 *  · PANTALLA ENCENDIDA mientras corre un timer (Screen Wake Lock API): alarmaMantener(id) / alarmaSoltar(id). Si el navegador no la tiene, no pasa nada.
 *  · SIN VIBRACIÓN (iOS no la permite en la web): vibrar() quedó apagada en index.html.
 *
 * No se puede GARANTIZAR en iOS (ver el mensaje de Claude): el interruptor de silencio del iPhone puede callar el audio web (por eso el parpadeo), el
 * Wake Lock en una app agregada a la pantalla de inicio depende de la versión de iOS (anda desde iOS 18.4; antes no), y si se bloquea la pantalla a mano
 * o se cambia de app, el timer y el sonido se detienen.
 *
 * Todo lo que hace queda anotado en ALARMA.log (para los tests): { t, tipo, clave }.
 */
const ALARMA = { ctx:null, desbloqueado:false, log:[], estado:{}, duenos:new Set(), bloqueo:null, flash:null, flashTimer:null, pedidosWake:0 };
const alarmaRegistrar = (tipo, clave) => { ALARMA.log.push({ t:Date.now(), tipo, clave:clave || null }); if(ALARMA.log.length > 400) ALARMA.log.shift(); };

function alarmaCtx(){
  if(!ALARMA.ctx){
    const C = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
    if(C){ try{ ALARMA.ctx = new C(); }catch(e){ ALARMA.ctx = null; } }
  }
  return ALARMA.ctx;
}
// Se llama DENTRO de un gesto del usuario (toque). Destraba el audio de iOS: reanuda el contexto y reproduce un instante de silencio.
function alarmaDesbloquear(){
  try{
    const c = alarmaCtx();
    if(c){
      if(c.state === 'suspended' && c.resume) c.resume();
      const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
      s.buffer = b; s.connect(c.destination); s.start(0);
      ALARMA.desbloqueado = true;
    }
  }catch(e){ /* sin audio: queda el aviso visual */ }
  alarmaRegistrar('desbloqueo');
  return ALARMA.desbloqueado;
}
// Un tono: frecuencia (Hz), duración (ms), instante de inicio (ms desde ahora) y volumen.
function alarmaTono(freq, ms, inicioMs, vol){
  const c = ALARMA.ctx; if(!c) return;
  try{
    const t0 = c.currentTime + (inicioMs || 0) / 1000, o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.6, t0 + 0.01); g.gain.setValueAtTime(vol || 0.6, t0 + ms / 1000 - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + ms / 1000 + 0.02);
  }catch(e){ /* sin audio */ }
}
function alarmaPitidoCorto(clave){ alarmaTono(880, 110, 0, 0.55); alarmaRegistrar('pitido', clave); }
// Fin de un tramo: doble pitido agudo + parpadeo. Fin de TODO el timer: alarma larga (4 pitidos) + parpadeo más largo.
function alarmaFin(clave, esFinal){
  if(esFinal){ [0, 330, 660, 990].forEach((ms, i) => alarmaTono(i % 2 ? 1320 : 990, 260, ms, 0.9)); alarmaRegistrar('final', clave); alarmaParpadeo(3600); }
  else { alarmaTono(1100, 170, 0, 0.85); alarmaTono(1400, 260, 230, 0.85); alarmaRegistrar('cambio', clave); alarmaParpadeo(1600); }
}
// La pantalla entera parpadea (2 veces por segundo, nunca más) y vuelve sola.
function alarmaParpadeo(ms){
  try{
    let el = document.getElementById('alarma-flash');
    if(!el){ el = document.createElement('div'); el.id = 'alarma-flash'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    el.classList.add('activo'); ALARMA.flash = el;
    clearTimeout(ALARMA.flashTimer);
    ALARMA.flashTimer = setTimeout(() => { el.classList.remove('activo'); }, ms || 1600);
    alarmaRegistrar('parpadeo');
  }catch(e){ /* sin DOM */ }
}
// Cada vuelta de reloj de un timer: restante = segundos que faltan del tramo. Dispara UNA sola vez por clave: 3-2-1 y el final.
// opts.fin = este tramo es el último del timer (alarma larga).
function alarmaTick(clave, restante, opts){
  const e = ALARMA.estado[clave] || (ALARMA.estado[clave] = { b3:false, b2:false, b1:false, fin:false });
  if(restante <= 0){ if(!e.fin){ e.fin = true; e.b1 = e.b2 = e.b3 = true; alarmaFin(clave, !!(opts && opts.fin)); } return; }
  const s = Math.ceil(restante);
  if(s === 3 && !e.b3){ e.b3 = true; alarmaPitidoCorto(clave); }
  else if(s === 2 && !e.b2){ e.b2 = true; alarmaPitidoCorto(clave); }
  else if(s === 1 && !e.b1){ e.b1 = true; alarmaPitidoCorto(clave); }
}
function alarmaReset(prefijo){ Object.keys(ALARMA.estado).forEach(k => { if(!prefijo || k.indexOf(prefijo) === 0) delete ALARMA.estado[k]; }); }

// ---- pantalla encendida mientras corre un timer ----
function alarmaPedirWake(){
  try{
    if(!(typeof navigator !== 'undefined' && navigator.wakeLock && navigator.wakeLock.request)){ alarmaRegistrar('wake-no-disponible'); return; }
    ALARMA.pedidosWake++;
    navigator.wakeLock.request('screen').then(l => {
      ALARMA.bloqueo = l; alarmaRegistrar('wake-activo');
      if(l.addEventListener) l.addEventListener('release', () => { if(ALARMA.bloqueo === l) ALARMA.bloqueo = null; alarmaRegistrar('wake-liberado'); });
      if(!ALARMA.duenos.size) alarmaSoltarWake();
    }).catch(() => { alarmaRegistrar('wake-rechazado'); });
  }catch(e){ alarmaRegistrar('wake-error'); }
}
function alarmaSoltarWake(){ try{ if(ALARMA.bloqueo){ const l = ALARMA.bloqueo; ALARMA.bloqueo = null; l.release(); } }catch(e){ /* ya liberado */ } }
function alarmaMantener(id){ ALARMA.duenos.add(id); if(!ALARMA.bloqueo) alarmaPedirWake(); }
function alarmaSoltar(id){ ALARMA.duenos.delete(id); if(!ALARMA.duenos.size) alarmaSoltarWake(); }
// Si iOS libera el Wake Lock al ocultar la app, se vuelve a pedir al volver mientras haya un timer corriendo.
if(typeof document !== 'undefined'){
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible' && ALARMA.duenos.size && !ALARMA.bloqueo) alarmaPedirWake(); });
  // Cada toque destraba / reanuda el audio (iOS lo suspende solo): así, cuando llega la alarma, el sonido ya está habilitado.
  ['pointerdown', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, () => { try{ alarmaDesbloquear(); }catch(e){ /* nada */ } }, { passive:true, capture:true }));
}

// ---- DESCANSO ENTRE SERIES (nuevo, 11/11): al marcar una serie arranca la cuenta del descanso del ejercicio; al terminar suena y parpadea ----
const descansoT = { activo:null, int:null };
function descansoArrancar(clave, segundos){
  descansoCancelar(true);
  if(!(segundos > 0)) return;
  descansoT.activo = { clave, fin: Date.now() + segundos * 1000, dur: segundos };
  alarmaReset('desc:'); alarmaMantener('descanso');
  descansoT.int = setInterval(descansoTick, 250);
  descansoTick();
}
function descansoRestante(){ return descansoT.activo ? Math.max(0, (descansoT.activo.fin - Date.now()) / 1000) : 0; }
function descansoTick(){
  const a = descansoT.activo; if(!a) return;
  const r = descansoRestante();
  alarmaTick('desc:' + a.clave + ':' + a.fin, r);
  document.querySelectorAll('.descanso-num').forEach(n => { n.textContent = fmtDescanso(r); });
  if(r <= 0){ descansoCancelar(true); document.querySelectorAll('.descanso-box').forEach(b => b.remove()); }
}
function descansoCancelar(silencioso){
  if(descansoT.int){ clearInterval(descansoT.int); descansoT.int = null; }
  descansoT.activo = null; alarmaSoltar('descanso');
}
function fmtDescanso(sec){ sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
// HTML del cuadro "Descanso 1:30" que va dentro de la caja de series del ejercicio (si el descanso en curso es de esa serie).
function descansoHTML(clave){
  const a = descansoT.activo; if(!a || a.clave !== clave) return '';
  return '<div class="descanso-box" style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; padding:10px 12px; border:2px solid var(--line);">' +
    '<span style="font-weight:700;">Descanso</span><span class="descanso-num u-num" style="font-family:var(--font-display); font-size:26px; font-weight:800;">' + fmtDescanso(descansoRestante()) + '</span>' +
    '<button class="ghost descanso-saltar" style="margin:0; min-height:44px; padding:6px 14px;">Saltar</button></div>';
}

console.log('✅ alarma.js cargado');
