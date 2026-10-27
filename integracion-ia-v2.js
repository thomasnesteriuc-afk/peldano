/**
 * INTEGRACION-IA.JS (VERSIÓN MEJORADA)
 * Adaptador que conecta el motor de IA con la interfaz existente
 * Ahora SIEMPRE muestra una rutina (de hoy, o de lunes si hoy no hay entrenamiento)
 */

// ===== VARIABLE GLOBAL PARA USAR EL MOTOR DE IA =====
let rutinasGeneradas = null;
let rutinaBriefActual = null;

// ===== OBTENER RUTINA DE HOY O FALLBACK A LUNES =====
function obtenerRutinaDeHoy() {
  // Generar rutina si no existe
  if (!rutinasGeneradas || !rutinasGeneradas.dias) {
    try {
      rutinasGeneradas = generarRutinaSemanal();
    } catch(e) {
      console.error('Error generando rutina:', e);
      return null;
    }
  }

  // Determinar qué día es hoy (lunes, miércoles, viernes)
  const hoy = new Date();
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const nombreDia = diasSemana[hoy.getDay()];

  // Mapear nombre a clave
  const diaMap = {
    lunes: 'lunes',
    miércoles: 'miercoles',
    viernes: 'viernes'
  };

  const claveDia = diaMap[nombreDia];

  // Si hoy es un día de entrenamiento, devolver esa rutina
  if (claveDia && rutinasGeneradas.dias[claveDia]) {
    return rutinasGeneradas.dias[claveDia];
  }

  // Si hoy NO es día de entrenamiento, mostrar LUNES como referencia
  console.log('📅 Hoy (' + nombreDia + ') no es día de entrenamiento. Mostrando rutina de LUNES como referencia.');
  return rutinasGeneradas.dias.lunes;
}

// ===== CONVERTIR RUTINA IA AL FORMATO ANTIGUO (ejercicios simples) =====
function rutiaAEjerciciosFlatList() {
  const rutina = obtenerRutinaDeHoy();
  if (!rutina) return [];

  const ejerciciosList = [];

  // Iterar superseries
  rutina.superseries.forEach((superserie, idxSS) => {
    superserie.ejercicios.forEach((ej) => {
      ejerciciosList.push({
        name: ej.nombre,
        id: ej.id,
        musculoPrincipal: ej.musculoPrincipal,
        dificultad: ej.dificultad,
        series: ej.series,
        reps: ej.reps,
        tempo: ej.tempo,
        descansoSeries: ej.descansoSeries,
        superserie: idxSS + 1,
        descripcion: ej.descripcion
      });
    });
  });

  return ejerciciosList;
}

// ===== CONVERTIR A FORMATO COMPATIBLE CON buildBlocks() =====
/**
 * Transforma la rutina IA a objetos "ejercicio" que entiende buildBlocks()
 * Cada ejercicio necesita: name, requires, reps, pace, hold, category, etc.
 */
function rutiaABuildBlocksFormat() {
  const rutina = obtenerRutinaDeHoy();
  if (!rutina) return [];

  const blocks = [];
  let blockIndex = 0;

  rutina.superseries.forEach((superserie, idxSS) => {
    const blockEjerciciosDeSuperserie = [];

    superserie.ejercicios.forEach((ej) => {
      // Buscar ejercicio en la DB global (si existe)
      const ejercicioDB = ejercicios[ej.id];

      // Construir objeto compatible
      const ejercicioCompatible = {
        name: ej.nombre,
        id: ej.id,
        musculoPrincipal: ej.musculoPrincipal,

        // Para buildBlocks: reps y series
        requires: ej.reps, // buildBlocks usa esto para mostrar el target
        category: ej.musculoPrincipal,
        
        // Info de la IA
        iaData: {
          series: ej.series,
          reps: ej.reps,
          tempo: ej.tempo,
          descansoSeries: ej.descansoSeries,
          dificultad: ej.dificultad,
          superserie: idxSS + 1,
          descripcion: ej.descripcion
        }
      };

      blockEjerciciosDeSuperserie.push(ejercicioCompatible);
    });

    // Cada superserie es un "bloque"
    blocks.push(blockEjerciciosDeSuperserie);
    blockIndex++;
  });

  return blocks;
}

// ===== RENDERIZAR RUTINA EN LA INTERFAZ =====
/**
 * Muestra la rutina de hoy formateada en superseries
 * Usa la estructura visual de Thomás: Superserie 1, Superserie 2, etc.
 */
function renderRutiaEnUI(containerId = 'hero') {
  const rutina = obtenerRutinaDeHoy();
  if (!rutina) {
    console.log('No hay entrenamiento');
    return '<p style="color:var(--text-dim);">Sin rutina disponible.</p>';
  }

  let html = '<div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">';
  html += '<p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px; font-size:15px;">ENTRENAR</p>';

  rutina.superseries.forEach((superserie, idxSS) => {
    html += `<div style="margin-bottom:12px; padding:12px; background:var(--bg); border-radius:8px; border-left:3px solid var(--accent);">`;
    html += `<p style="font-weight:600; font-size:13px; color:var(--accent-strong); margin:0 0 8px;">Superserie ${idxSS + 1}</p>`;

    superserie.ejercicios.forEach((ej) => {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;">
          <span style="font-weight:500;">${ej.nombre}</span>
          <span style="color:var(--text-dim);">${ej.series}x${ej.reps}</span>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += '</div>';

  return html;
}

// ===== FUNCIÓN PRINCIPAL: REEMPLAZAR generateSession =====
/**
 * Esta función reemplaza a generateSession()
 * Devuelve ejercicios en formato compatible con buildBlocks()
 * SIEMPRE devuelve una rutina (de hoy o de lunes como fallback)
 */
function generarSesionDesdeIA(focus = null) {
  const rutinaDeHoy = obtenerRutinaDeHoy();

  if (!rutinaDeHoy) {
    console.log('🤖 No hay rutina disponible');
    return [];
  }

  console.log('🤖 Usando rutina IA:', rutinaDeHoy);

  // Convertir a formato plano para compatibilidad
  const ejerciciosFlatten = rutiaAEjerciciosFlatList();

  // Guardar brief para usar después
  rutinaBriefActual = {
    dia: new Date().toLocaleDateString('es-AR', { weekday: 'long' }),
    rutina: rutinaDeHoy,
    ejercicios: ejerciciosFlatten
  };

  return ejerciciosFlatten;
}

// ===== ACTUALIZAR DESPUÉS DE CADA SEMANA =====
function actualizarConfigIADespuesDeSemana(rpePromedio, progreso, semanaActual) {
  // Actualizar la configuración global del motor de IA
  configUsuario.rpePromedio = rpePromedio; // 1-10
  configUsuario.progreso = progreso;        // "estancado", "normal", "subiendo"
  configUsuario.semanaActual = semanaActual;

  // Limpiar rutinas cacheadas para forzar regeneración
  rutinasGeneradas = null;
  rutinaBriefActual = null;

  console.log('✅ Config IA actualizada:', configUsuario);
}

// ===== EXPORTAR PARA USAR EN CONSOLA =====
console.log('✅ integracion-ia.js cargado (versión mejorada)');
console.log('Funciones disponibles:');
console.log('  - obtenerRutinaDeHoy() → siempre devuelve una rutina');
console.log('  - generarSesionDesdeIA()');
console.log('  - renderRutiaEnUI()');
console.log('  - actualizarConfigIADespuesDeSemana(rpe, progreso, semana)');
