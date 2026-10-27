/**
 * INTEGRACION-RPE-UI.JS
 * Agrega dropdowns de RPE en la rutina (simultáneamente mientras entrena)
 * Conecta con tracking-rpe.js y deteccion-estancamiento.js
 */

// ===== MODIFICAR RENDERIZADO DE RUTINA PARA AGREGAR RPE =====
function renderRutiaEnUIConRPE() {
  const rutina = obtenerRutinaDeHoy();
  if (!rutina) {
    console.log('No hay rutina para hoy');
    return '<p style="color:var(--text-dim);">Sin rutina disponible.</p>';
  }

  let html = '<div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">';
  html += '<p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px; font-size:15px;">🤖 ENTRENAR</p>';
  html += '<form id="form-rpe-sesion">';

  rutina.superseries.forEach((superserie, idxSS) => {
    html += `<div style="margin-bottom:12px; padding:12px; background:var(--bg); border-radius:8px; border-left:3px solid var(--accent);">`;
    html += `<p style="font-weight:600; font-size:13px; color:var(--accent-strong); margin:0 0 8px;">⚡ Superserie ${idxSS + 1}</p>`;

    superserie.ejercicios.forEach((ej, idxEj) => {
      const selectId = `rpe-${idxSS}-${idxEj}`;
      html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:8px; background:var(--panel); border-radius:6px;">`;
      html += `<div style="flex:1;">`;
      html += `<span style="font-weight:500; font-size:13px;">${ej.nombre}</span>`;
      html += `<span style="color:var(--text-dim); font-size:11px; margin-left:8px;">${ej.series}×${ej.reps}</span>`;
      html += `</div>`;
      
      // SELECT DE RPE (VACÍO AL INICIO)
      html += `<select id="${selectId}" data-ejercicio="${ej.id}" data-nombre="${ej.nombre}" style="padding:6px 8px; border-radius:6px; border:1.5px solid var(--text-dim); background:var(--bg); color:var(--text); font-size:12px; font-weight:600; cursor:pointer; min-width:70px;">`;
      html += `<option value="">RPE</option>`;
      html += `<option value="5">5 (Me sobró)</option>`;
      html += `<option value="6">6 (Me sobró)</option>`;
      html += `<option value="7">7 (Cumplí)</option>`;
      html += `<option value="8">8 (Me costó)</option>`;
      html += `<option value="9">9 (Me costó)</option>`;
      html += `</select>`;
      
      html += `</div>`;
    });

    html += `</div>`;
  });

  // BOTÓN COMPLETADO
  html += `<button type="button" id="btn-completar-sesion" class="primary" style="width:100%; padding:14px; font-size:15px; margin-top:8px;">Completado</button>`;
  html += `</form>`;
  html += '</div>';

  return html;
}

// ===== MANEJAR GUARDADO DE RPE Y ANÁLISIS =====
function manejarCompletadoSesion() {
  const btn = document.getElementById('btn-completar-sesion');
  const form = document.getElementById('form-rpe-sesion');
  
  if (!btn || !form) {
    console.log('⚠️ Elementos de RPE no encontrados');
    return;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    // Recolectar RPE de todos los selects
    const selects = form.querySelectorAll('select[data-ejercicio]');
    const ejerciciosRPE = [];
    let todoCompleto = true;

    selects.forEach(select => {
      const rpeValue = select.value;
      const ejercicioId = select.getAttribute('data-ejercicio');
      const ejercicioNombre = select.getAttribute('data-nombre');

      if (!rpeValue) {
        todoCompleto = false;
        select.style.borderColor = 'var(--error, #ff6b6b)';
        return;
      } else {
        select.style.borderColor = 'var(--accent)';
      }

      ejerciciosRPE.push({
        id: ejercicioId,
        nombre: ejercicioNombre,
        rpe: parseInt(rpeValue)
      });
    });

    if (!todoCompleto) {
      alert('⚠️ Por favor completa RPE de TODOS los ejercicios');
      return;
    }

    // ✅ GUARDAR RPE
    console.log('💾 Guardando RPE de sesión:', ejerciciosRPE);
    registrarSesionRPE(ejerciciosRPE);

    // ✅ MOSTRAR CONFIRMACIÓN
    btn.disabled = true;
    btn.textContent = '✓ Sesión registrada';
    btn.style.opacity = '0.6';

    // ✅ GUARDAR EN LOCALSTORAGE QUE HOY SE ENTRENÓ
    localStorage.setItem('lastSessionDate', new Date().toDateString());

    alert('✅ Sesión guardada exitosamente');

    // ⏰ VERIFICAR SI ES FIN DE SEMANA PARA ANÁLISIS
    verificarFinDeSemanayAnalizar();
  });
}

// ===== VERIFICAR SI ES FIN DE SEMANA (DOMINGO O VIERNES) =====
function verificarFinDeSemanayAnalizar() {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=domingo, 1=lunes, ..., 5=viernes, 6=sábado

  // Si es VIERNES (5) o DOMINGO (0)
  if (dia === 5 || dia === 0) {
    console.log(`📊 Es fin de semana (${dia === 5 ? 'viernes' : 'domingo'}). Analizando patrones...`);
    
    // Obtener rutina actual para análisis
    const rutina = obtenerRutinaDeHoy();
    if (!rutina || !rutina.superseries) {
      console.log('⚠️ No hay rutina para analizar');
      return;
    }

    // Extraer lista de ejercicios
    const ejercicios = [];
    rutina.superseries.forEach(ss => {
      ss.ejercicios.forEach(ej => {
        ejercicios.push(ej);
      });
    });

    // Ejecutar análisis y adaptaciones
    const cambios = analizarYAdaptar(ejercicios, ejercicios);

    if (cambios.length > 0) {
      console.log('🔄 Adaptaciones realizadas:', cambios);
      mostrarNotificacionAdaptacion(cambios);
    }
  }
}

// ===== MOSTRAR NOTIFICACIÓN DE ADAPTACIÓN =====
function mostrarNotificacionAdaptacion(cambios) {
  const hero = document.getElementById('day-hero');
  
  if (!hero) return;

  const notificacion = renderNotificacionAdaptacion(cambios);
  
  if (notificacion) {
    hero.insertAdjacentHTML('afterbegin', notificacion);
    console.log('✅ Notificación de adaptación mostrada');
  }
}

// ===== REEMPLAZAR RENDERIZADO ACTUAL CON NUEVA VERSIÓN =====
function inicializarRPEenUI() {
  // Buscar dónde se renderiza la rutina
  const hero = document.getElementById('day-hero');
  
  if (!hero) {
    console.log('⚠️ No se encontró elemento day-hero');
    return;
  }

  // Renderizar rutina CON RPE
  const rutinaHTML = renderRutiaEnUIConRPE();
  hero.innerHTML = rutinaHTML;

  // Inicializar manejadores de eventos
  manejarCompletadoSesion();

  console.log('✅ RPE UI inicializado');
}

// ===== RETIRADO =====
// Este archivo pisaba #day-hero con su propia versión (solo superseries + un select de RPE
// 1-10 que guardaba en trackingRPE, sin relación con progState/LADDERS), sobrescribiendo lo
// que ya pinta renderDay() -> generateSession()/buildBlocks() (calentamiento, core, superseries,
// piernas, movimiento). El flujo real "Me costó/Cumplí/Me sobró" ya vive en exCardHTML()
// y alimenta registerMark() a través de commitDay() — es el mismo RPE de la sección 6 de la
// guía, con un solo camino de datos. Por eso el listener que reemplazaba el hero se retiró;
// las funciones de este archivo quedan sin invocarse, no se borran por si se reusan.
if (typeof cargarTrackingRPE === 'function') {
  cargarTrackingRPE();
}

console.log('✅ integracion-rpe-ui.js cargado');
console.log('Funciones disponibles:');
console.log('  - renderRutiaEnUIConRPE() — rutina con dropdowns RPE');
console.log('  - inicializarRPEenUI() — setup de UI y event listeners');
