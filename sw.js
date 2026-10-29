/**
 * SW.JS — service worker de Peldaño: la app funciona SIN INTERNET (ENCARGO, prioridad del 28/10).
 *
 * En la primera carga CON conexión guarda todos los archivos de la app (ASSETS) en una caché con nombre propio.
 * Desde ahí, abrir la app, elegir el día, entrenar y registrar no necesita red. Los datos viven en el dispositivo
 * (localStorage); este archivo solo guarda el código.
 *
 * VERSIÓN: la caché se llama "peldano-<VERSION>". VERSION es una huella (SHA-256) de TODOS los archivos de ASSETS,
 * en este orden. Cuando cambia cualquier archivo, hay que correr `bash actualizar-sw.sh` (reescribe la línea de
 * VERSION); si se olvida, el test "Offline: la versión del service worker coincide con los archivos" falla.
 * Con VERSION nueva, el service worker nuevo baja todo de nuevo, y recién cuando terminó borra la caché vieja:
 * nunca queda la app a medio actualizar.
 *
 * Solo toca pedidos del propio sitio. Lo externo (los enlaces a YouTube) pasa directo y es opcional.
 */
const VERSION = 'bccb885eca9e';
const CACHE = 'peldano-' + VERSION;
const ASSETS = [
  './',
  'index.html',
  'offline.js',
  'respaldo.js',
  'vendor/jspdf.umd.min.js',
  'ejercicios.js',
  'ia-rutinas.js',
  'integracion-ia-v2.js',
  'tracking-rpe.js',
  'deteccion-estancamiento.js',
  'integracion-rpe-ui.js',
  'nutricion-completo.js',
  'analisis-video-completo.js',
  'dashboard-completo.js',
  'info-pestanas.js',
  'pestana-calentar.js',
  'finisher.js',
  'entrada-calor.js',
  'tiempo-sesion.js'
];
const MARCA_LISTO = 'offline-listo.txt';      // se guarda al terminar de bajar TODO: lo lee offline.js para mostrar "lista"

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));          // ignora la caché del navegador: baja lo último
    await c.put(MARCA_LISTO, new Response(VERSION));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(claves.filter(k => k.indexOf('peldano-') === 0 && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;                                   // lo externo no se toca
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: req.mode === 'navigate' });      // la pantalla principal acepta ?parámetros
    if(hit) return hit;
    if(req.mode === 'navigate'){ const home = await c.match('index.html'); if(home) return home; }
    try { return await fetch(req); } catch(err) { return new Response('Sin conexión', { status: 503, statusText: 'Sin conexión' }); }
  })());
});
