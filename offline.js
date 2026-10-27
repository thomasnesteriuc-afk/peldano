/**
 * OFFLINE.JS — registra el service worker (sw.js) y informa si la app ya quedó lista para usarse sin internet.
 *
 *  offlineEstado() -> Promise<{ estado, version }>
 *    'lista'          el service worker controla la página y bajó TODOS los archivos de su versión
 *    'preparando'     todavía no terminó de bajarlos (abrí la app con conexión y esperá unos segundos)
 *    'sin-soporte'    el navegador no permite service workers acá (por ejemplo, abierta como archivo suelto en vez de
 *                     desde su dirección web, o ver más abajo el modo privado)
 *  Además pide al navegador que NO borre los datos de la app (navigator.storage.persist): ayuda en el iPhone.
 */
(function(){
  const NOMBRE_MARCA = 'offline-listo.txt';
  function soporta(){ return 'serviceWorker' in navigator && /^https?:$/.test(location.protocol); }
  async function version(){
    try {
      const claves = (await caches.keys()).filter(k => k.indexOf('peldano-') === 0);
      for(const k of claves){ const r = await (await caches.open(k)).match(NOMBRE_MARCA); if(r) return await r.text(); }
    } catch(e) { /* sin caché: no lista */ }
    return null;
  }
  // Versión nueva: si la app ya estaba controlada por un service worker al abrirse y de golpe toma el control otro, es que
  // se publicó una versión nueva y se instaló sola. Hasta cerrar y reabrir la app se sigue viendo la anterior.
  let nuevaVersion = false;
  const controladaAlAbrir = soporta() && !!navigator.serviceWorker.controller;
  if(soporta() && controladaAlAbrir){ navigator.serviceWorker.addEventListener('controllerchange', () => { nuevaVersion = true; }); }
  window.offlineVersionNueva = () => nuevaVersion;
  window.offlineEstado = async function(){
    if(!soporta()) return { estado:'sin-soporte', version:null };
    const v = await version();
    const controla = !!navigator.serviceWorker.controller;
    return { estado: (v && controla) ? 'lista' : 'preparando', version: v };
  };
  window.offlineTexto = async function(){
    const s = await window.offlineEstado();
    if(s.estado === 'lista' && nuevaVersion) return 'Hay una versión nueva (' + s.version.slice(0, 6) + '). Cerrá la app del todo y volvé a abrirla para usarla.';
    if(s.estado === 'lista') return 'Sin conexión: lista ✓ (versión ' + s.version.slice(0, 6) + ')';
    if(s.estado === 'preparando') return 'Sin conexión: preparando… Dejá la app abierta con internet unos segundos.';
    return 'Sin conexión: no disponible acá. Abrí la app desde su dirección web (no como archivo).';
  };
  if(soporta()){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('No se pudo registrar el service worker:', err));
      if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    });
  }
})();
