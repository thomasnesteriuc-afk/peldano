/**
 * RESPALDO.JS — copia de seguridad en Perfil (ENCARGO, pedido del 28/10). Funciona SIN conexión: todo es local.
 *
 *  "Exportar datos": baja un archivo .json con TODO lo que la app guarda en el dispositivo (historial, progreso,
 *                    configuración). En el iPhone abre la hoja de compartir (Guardar en Archivos, AirDrop, etc.).
 *  "Importar datos": elegís ese archivo; la app muestra de cuándo es y cuántas sesiones tiene, y pide confirmación
 *                    porque REEMPLAZA todo lo que hay ahora. Si el archivo no sirve, no toca nada.
 *
 * El archivo es un JSON { formato:'peldano-respaldo', version:1, exportado, appVersion, resumen, datos:{clave:texto} }.
 * "datos" es una copia de TODAS las claves de localStorage de la app (STORE_KEY = el estado principal).
 * NOTA (Etapa 7): si las fotos pasan a IndexedDB, hay que sumarlas acá; hoy no existen.
 * Depende de globals de index.html: stats, STORE_KEY, saveState, offlineEstado (opcional).
 */
const RESPALDO_FORMATO = 'peldano-respaldo', RESPALDO_VERSION = 1;

function respaldoGenerar(){
  if(typeof saveState === 'function') saveState();                         // vuelca a localStorage lo último que está en pantalla
  const datos = {};
  for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); datos[k] = localStorage.getItem(k); }
  let sesiones = 0; try { sesiones = (JSON.parse(datos[STORE_KEY]).stats || {}).sessions || 0; } catch(e) { /* sin estado */ }
  return { formato:RESPALDO_FORMATO, version:RESPALDO_VERSION, exportado:new Date().toISOString(), resumen:{ sesiones }, datos };
}
// Revisa un archivo ya leído (texto). No toca nada. -> { ok, error, obj, fecha, sesiones }
function respaldoValidar(texto){
  let obj;
  try { obj = JSON.parse(texto); } catch(e) { return { ok:false, error:'El archivo no es un respaldo de Peldaño (no se pudo leer).' }; }
  if(!obj || obj.formato !== RESPALDO_FORMATO) return { ok:false, error:'El archivo no es un respaldo de Peldaño.' };
  if(typeof obj.version !== 'number' || obj.version > RESPALDO_VERSION) return { ok:false, error:'Este respaldo es de una versión más nueva de la app. Actualizá la app primero.' };
  const d = obj.datos;
  if(!d || typeof d !== 'object' || Array.isArray(d) || !Object.keys(d).every(k => typeof d[k] === 'string')) return { ok:false, error:'El respaldo está dañado.' };
  let estado; try { estado = JSON.parse(d[STORE_KEY]); } catch(e) { estado = null; }
  if(!estado || typeof estado !== 'object' || !estado.stats || typeof estado.stats !== 'object') return { ok:false, error:'El respaldo no tiene el historial de la app.' };
  return { ok:true, obj, fecha:obj.exportado, sesiones:estado.stats.sessions || 0 };
}
// REEMPLAZA todo lo guardado. Si algo falla a mitad de camino, vuelve a dejar lo que había. No recarga: eso lo hace quien llama.
function respaldoAplicar(obj){
  const previo = {};
  for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); previo[k] = localStorage.getItem(k); }
  window.__sinGuardar = true;                                                // que saveState() no pise lo importado con lo que hay en memoria
  try {
    localStorage.clear();
    Object.keys(obj.datos).forEach(k => localStorage.setItem(k, obj.datos[k]));
    if(localStorage.getItem(STORE_KEY) !== obj.datos[STORE_KEY]) throw new Error('no se pudo escribir');
    return { ok:true };
  } catch(e) {
    try { localStorage.clear(); Object.keys(previo).forEach(k => localStorage.setItem(k, previo[k])); } catch(e2) { /* nada más que hacer */ }
    window.__sinGuardar = false;
    return { ok:false, error:'No se pudo importar (' + (e && e.message || e) + '). Se dejó todo como estaba.' };
  }
}
function respaldoRecargar(){ location.reload(); }                          // aparte, para poder probarlo sin recargar
function respaldoNombre(){ const d = new Date(), p = n => String(n).padStart(2, '0'); return 'peldano-respaldo-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json'; }
function respaldoEsIOS(){ return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
// Entrega el archivo: hoja de compartir en iPhone/iPad (para guardarlo en Archivos); descarga directa en el resto.
async function respaldoEntregar(nombre, texto){
  if(respaldoEsIOS() && typeof File === 'function' && navigator.canShare){
    try {
      const f = new File([texto], nombre, { type:'application/json' });
      if(navigator.canShare({ files:[f] })){ await navigator.share({ files:[f], title:'Respaldo de Peldaño' }); return 'compartido'; }
    } catch(e) { if(e && e.name === 'AbortError') return 'cancelado'; }
  }
  const url = URL.createObjectURL(new Blob([texto], { type:'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'descargado';
}
async function respaldoExportar(){
  const obj = respaldoGenerar(), r = await respaldoEntregar(respaldoNombre(), JSON.stringify(obj));
  return { resultado:r, sesiones:obj.resumen.sesiones };
}

// ---- pantalla (Perfil) ----
function respaldoMsg(t){ const e = document.getElementById('respaldo-estado'); if(e) e.textContent = t; }
function respaldoSesionesActuales(){ return (typeof stats === 'object' && stats && stats.sessions) || 0; }
function respaldoFechaCorta(iso){ try { const d = new Date(iso); return isNaN(d) ? 'fecha desconocida' : d.toLocaleDateString('es-AR'); } catch(e) { return 'fecha desconocida'; } }
function renderRespaldo(){
  const box = document.getElementById('respaldo-box'); if(!box) return;
  box.innerHTML =
    '<div style="display:flex; flex-direction:column; gap:10px;">' +
      '<button class="ghost" id="respaldo-exportar" style="margin:0; min-height:48px; width:100%;">Exportar datos</button>' +
      '<button class="ghost" id="respaldo-importar" style="margin:0; min-height:48px; width:100%;">Importar datos</button>' +
      '<input type="file" id="respaldo-archivo" accept=".json,application/json" style="display:none;">' +
    '</div>' +
    '<div id="respaldo-confirm" style="display:none; border:2px solid var(--line); padding:14px; margin-top:12px;"></div>' +
    '<p id="respaldo-estado" style="font-size:14px; margin:10px 0 0;"></p>';
  document.getElementById('respaldo-exportar').addEventListener('click', async () => {
    const r = await respaldoExportar();
    respaldoMsg(r.resultado === 'cancelado' ? 'Cancelado: no se guardó ningún archivo.' : 'Listo: respaldo de ' + r.sesiones + ' sesiones. Guardá el archivo en un lugar seguro (Archivos, correo, nube).');
  });
  const inp = document.getElementById('respaldo-archivo');
  document.getElementById('respaldo-importar').addEventListener('click', () => { inp.value = ''; inp.click(); });
  inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0]; if(!f) return;
    const lector = new FileReader();
    lector.onload = () => respaldoPedirConfirmacion(String(lector.result));
    lector.onerror = () => respaldoMsg('No se pudo leer el archivo.');
    lector.readAsText(f);
  });
}
function respaldoPedirConfirmacion(texto){
  const v = respaldoValidar(texto), cf = document.getElementById('respaldo-confirm');
  if(!v.ok){ cf.style.display = 'none'; respaldoMsg(v.error + ' No se cambió nada.'); return v; }
  respaldoMsg('');
  cf.style.display = 'block';
  cf.innerHTML =
    '<p style="font-size:16px; font-weight:700; margin:0 0 6px;">¿Reemplazar todo?</p>' +
    '<p style="font-size:14px; margin:0 0 12px; line-height:1.45;">El archivo es del <strong>' + respaldoFechaCorta(v.fecha) + '</strong> y tiene <strong>' + v.sesiones + ' sesiones</strong>. ' +
    'Importarlo <strong>reemplaza todo lo que hay ahora</strong> en este dispositivo (' + respaldoSesionesActuales() + ' sesiones). No se puede deshacer.</p>' +
    '<button class="primary" id="respaldo-reemplazar" style="margin:0 0 8px; min-height:48px; width:100%;">Reemplazar todo</button>' +
    '<button class="ghost" id="respaldo-cancelar" style="margin:0; min-height:48px; width:100%;">Cancelar</button>';
  document.getElementById('respaldo-cancelar').addEventListener('click', () => { cf.style.display = 'none'; cf.innerHTML = ''; respaldoMsg('Cancelado: no se cambió nada.'); });
  document.getElementById('respaldo-reemplazar').addEventListener('click', () => {
    const r = respaldoAplicar(v.obj);
    if(!r.ok){ cf.style.display = 'none'; respaldoMsg(r.error); return; }
    respaldoMsg('Importado ✓ Reiniciando la app…');
    setTimeout(respaldoRecargar, 400);
  });
  return v;
}
console.log('✅ respaldo.js cargado');
