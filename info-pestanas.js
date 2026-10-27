/**
 * INFO-PESTANAS.JS
 * Sistema de información interactivo para cada pestaña
 * ℹ️ en la esquina → modal con instrucciones
 */

const infoPestanas = {
  contenido: {
    calentar: {
      titulo: "🔥 CALENTAR",
      descripcion: "4 fases antes de entrenar: cardio, movilidad, activación y dinámico",
      como_usar: [
        "1. Hacé cada ejercicio de la fase (el círculo se llena solo con el tiempo)",
        "2. Marcalo tocando ▶ Empezar y esperando a que termine",
        "3. Repetí para las 4 fases (~5 minutos en total)",
        "4. Al completarlas todas, se habilita 'Ir a Entrenar'"
      ],
      tips: "Es opcional: podés entrar directo a Entrenar sin pasar por acá. Se recomienda antes de entrenar."
    },
    entrenar: {
      titulo: "🏋️ ENTRENAR",
      descripcion: "Tu sesión del día: core, empuje, tirón y tren inferior, más el finisher",
      como_usar: [
        "1. Ves tu sesión en bloques: abdominales, superseries de empuje + tirón, y tren inferior",
        "2. Cada ejercicio tiene su objetivo (reps o segundos) y su descanso",
        "3. En los ejercicios de un lado (unilaterales) arrancá siempre por el lado más débil",
        "4. Después de cada ejercicio marcá 'Me costó', 'Cumplí' o 'Me sobró'",
        "5. Al marcar el último, arranca solo el FINISHER (10 min, o 5 si falta tiempo, con timer): se puede saltear con un toque, pero queda registrado",
        "6. Tocá 'Registrar cómo me fue' para guardar la sesión"
      ],
      tips: "Tocá el tiempo que tenés (60, 45 o 30 min) antes de elegir el día: la sesión se recorta sola en un orden fijo."
    },
    aprender: {
      titulo: "📚 APRENDER",
      descripcion: "Biblioteca de ejercicios y técnica",
      como_usar: [
        "1. Explora ejercicios por categoría",
        "2. Lee técnica, errores comunes, progresiones",
        "3. Mira variantes y regresiones",
        "4. Entiende el 'por qué' de cada movimiento"
      ],
      tips: "Base científica de todo. Úsalo para mejorar tu ejecución."
    },

    progreso: {
      titulo: "📊 PROGRESO",
      descripcion: "Dashboard de tu evolución",
      como_usar: [
        "1. Selecciona rango de fechas (custom)",
        "2. Clickea 'Cargar Datos'",
        "3. Ve gráfico de RPE histórico",
        "4. Mira estadísticas (promedio, máximo, sesiones)",
        "5. Explora tu árbol de habilidades",
        "6. Descarga todo como JSON"
      ],
      tips: "Descarga tus datos para llevarlos a otro lado. Gráfico muestra tu tendencia: ¿subiendo o bajando?"
    },

    tienda: {
      titulo: "🛍️ TIENDA",
      descripcion: "Equipamiento y recursos",
      como_usar: [
        "1. Ve equipo disponible en tu zona",
        "2. Lee descripciones y precios",
        "3. Guarda favoritos",
        "4. Compra directamente si quieres"
      ],
      tips: "Actualiza tu equipamiento disponible en Configuración."
    },

    nutricion: {
      titulo: "🍽️ NUTRICIÓN",
      descripcion: "Guía práctica: método del plato y hábitos, sin contar gramos",
      como_usar: [
        "1. Mirá el método del plato: mitad vegetales, un cuarto proteína, un cuarto carbos",
        "2. Medí porciones con la mano, sin balanza",
        "3. Revisá tu semana: los findes podés relajar el plan sin culpa",
        "4. Leé el tip según la hora del día",
        "5. Tips según tu objetivo (hipertrofia/fuerza/pérdida de grasa)"
      ],
      tips: "No hace falta registrar comidas ni contar macros. Sábado y domingo no tenés que seguir el plan al pie de la letra — lo que importa es lo que hacés la mayoría de los días."
    },

    video: {
      titulo: "🎥 ANÁLISIS DE VIDEO",
      descripcion: "Grabación y feedback automático de técnica",
      como_usar: [
        "1. Elige ejercicio (Pull-up, Push-up, Plank, etc.)",
        "2. Lee recomendaciones científicas (tempo, ROM, errores)",
        "3. Clickea 'Grabar Video' - se graba 60 seg automático",
        "4. Ejecuta el ejercicio con buena forma",
        "5. Si hay video anterior, ve qué mejoró",
        "6. Mira histórico de todos tus videos"
      ],
      tips: "Recomendaciones: ej 'Pull-up = subir rápido 1-2 seg, bajar lento 3-4 seg'. Comparación te marca qué mejoró vs video anterior."
    },

    mis_escaleras: {
      titulo: "🪜 MIS ESCALERAS",
      descripcion: "Progresiones y habilidades",
      como_usar: [
        "1. Ve tus progresiones: qué nivel estás en cada habilidad",
        "2. Requisitos para avanzar al siguiente nivel",
        "3. Checkpoints: completa para desbloquear siguiente",
        "4. Historial: qué ya lograste"
      ],
      tips: "Las habilidades avanzan según tu progreso en entrenamientos. Cada nivel es más difícil pero mas épico."
    }
  },

  // Popover chico (Encargo Final, pilar 5D): antes era un modal grande con toda la
  // lista "cómo usar"; ahora es una tarjeta de ~240×160, texto de 12px, máximo 3 líneas
  // + botón. Se cierra con × o tocando afuera.
  mostrarInfo(pestana) {
    let info = this.contenido[pestana];
    if (!info) return;

    let primerPaso = (info.como_usar && info.como_usar[0]) ? info.como_usar[0].replace(/^\d+\.\s*/, '') : '';

    let html = `
      <div id="modal-info-overlay" style="
        position:fixed; top:0; left:0; right:0; bottom:0;
        background:rgba(0,0,0,0.35);
        z-index:9999;
      " onclick="if(event.target.id === 'modal-info-overlay') cerrarInfo()">

        <div style="
          position:fixed; top:56px; right:16px;
          background:var(--panel); border-radius:10px; padding:14px;
          width:240px; max-height:200px; overflow-y:auto;
          color:var(--text);
          box-shadow:0 8px 24px rgba(0,0,0,0.4);
          border:1px solid var(--line);
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="margin:0; font-size:13px; font-weight:700;">${info.titulo}</span>
            <button onclick="cerrarInfo()" style="
              background:none; border:none; font-size:16px; cursor:pointer; color:var(--text-dim); line-height:1; padding:0 0 0 8px;
            ">✕</button>
          </div>

          <p style="margin:0 0 6px; color:var(--text-dim); font-size:12px; line-height:1.35;">${info.descripcion}</p>
          ${primerPaso ? `<p style="margin:0 0 6px; font-size:12px; line-height:1.35;">${primerPaso}</p>` : ''}
          <p style="margin:0 0 10px; font-size:12px; line-height:1.35; color:var(--accent-strong);">${info.tips}</p>

          <button onclick="cerrarInfo()" style="
            width:100%; padding:7px;
            background:var(--accent); color:#fff; border:none;
            border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;
          ">Entendido ✓</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }
};

function abrirInfo(pestana) {
  infoPestanas.mostrarInfo(pestana);
}

function cerrarInfo() {
  let overlay = document.getElementById('modal-info-overlay');
  if (overlay) overlay.remove();
}

// ============================================================
// AGREGAR BOTÓN ℹ️ A CADA PESTAÑA
// ============================================================

// Mapa: clave de contenido (arriba) -> id real del panel en index.html.
// Nota: la clave "progreso" describe el dashboard de RPE histórico/fechas/JSON,
// por eso apunta a "tab-dashboard" y no a "tab-progreso" (la pestaña de constancia,
// que no tiene contenido de ayuda propio todavía).
const INFO_TAB_ID_MAP = {
  calentar: 'tab-calentar',
  entrenar: 'tab-rutina',
  aprender: 'tab-biblioteca',
  progreso: 'tab-dashboard',
  tienda: 'tab-tienda',
  nutricion: 'tab-nutricion',
  video: 'tab-video',
  mis_escaleras: 'tab-nivel'
};

// Pestañas cuyo contenido se reemplaza entero con innerHTML al clickear:
// ahí el botón ℹ️ se borra con cada render, así que hay que reinsertarlo.
const INFO_TABS_DINAMICAS = ['tab-nutricion', 'tab-video', 'tab-dashboard', 'tab-calentar'];

function insertarBotonInfo(pestanaKey) {
  if (window.FEATURES && window.FEATURES.infoPestanas === false) return;   // stand-by: sin botón de ayuda
  const tabId = INFO_TAB_ID_MAP[pestanaKey];
  const panel = tabId && document.getElementById(tabId);
  if (!panel) return;
  if (panel.querySelector('.btn-info-pestana')) return; // ya está insertado

  panel.style.position = 'relative';
  const btn = document.createElement('button');
  btn.className = 'btn-info-pestana';
  btn.innerHTML = 'ℹ️';
  btn.onclick = (e) => { e.stopPropagation(); abrirInfo(pestanaKey); };
  btn.style.cssText = 'position:absolute; top:10px; right:10px; background:none; border:none; font-size:18px; cursor:pointer; z-index:5;';
  panel.appendChild(btn);
}

function agregarBotonesInfo() {
  Object.keys(INFO_TAB_ID_MAP).forEach(insertarBotonInfo);
}

// En las pestañas dinámicas, reinsertar el botón después de cada render por click
INFO_TABS_DINAMICAS.forEach(tabId => {
  const btnNav = document.querySelector(`[data-tab="${tabId}"]`);
  if (!btnNav) return;
  const key = Object.keys(INFO_TAB_ID_MAP).find(k => INFO_TAB_ID_MAP[k] === tabId);
  if (!key) return;
  btnNav.addEventListener('click', () => setTimeout(() => insertarBotonInfo(key), 50));
});

// Ejecutar cuando carga (los tabpanel ya existen en el HTML estático)
agregarBotonesInfo();

console.log('✅ info-pestanas.js cargado');
