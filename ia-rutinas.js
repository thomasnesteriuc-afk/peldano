/**
 * IA-RUTINAS.JS
 * Motor inteligente de generación de entrenamientos
 * Genera entrenamientos Full Body con variedad, sin repetir ejercicios
 * Ajusta por RPE, progreso y dificultad
 */

// ===== CONFIGURACIÓN DE USUARIO =====
const configUsuario = {
  nivel: "intermedio", // principiante, intermedio, avanzado
  diasEntrenamiento: 3,
  frecuencia: ["lunes", "miércoles", "viernes"],
  gruposMusculares: ["pull", "push", "core"],
  
  // RPE de la semana pasada (se actualiza después de cada semana)
  rpePromedio: 7, // 1-10 (1=muy fácil, 10=máximo)
  
  // Progreso
  progreso: "normal", // "estancado", "normal", "subiendo"
  
  // Semana actual (para rotar)
  semanaActual: 1
};

// ===== ESTRUCTURA DE EJERCICIOS POR GRUPO =====
// Estos IDs corresponden a ejercicios.js
const ejerciciosPorGrupo = {
  pull: ["pullups", "rows"],
  push: ["pushups", "dips"],
  core: ["l_sit", "plancha", "crunches", "hanging_leg_raise", "v_sit", "ab_wheel", "handstand"]
};

// ===== HISTORIAL DE EJERCICIOS =====
// Se guarda en localStorage para recordar qué ejercicios ya usaste
let historialEjercicios = {
  semana1: {
    lunes: [],
    miercoles: [],
    viernes: []
  },
  semana2: {
    lunes: [],
    miercoles: [],
    viernes: []
  }
  // Se expande conforme pasan las semanas
};

// ===== FUNCIÓN PRINCIPAL: GENERAR RUTINA DE LA SEMANA =====
function generarRutinaSemanal(config = configUsuario) {
  console.log("🤖 Generando rutina semanal...");
  
  const rutina = {
    semana: config.semanaActual,
    dias: {}
  };
  
  // Generar cada día
  config.frecuencia.forEach((dia, indice) => {
    rutina.dias[dia] = generarEntrenamiento(dia, indice, config);
  });
  
  console.log("✅ Rutina generada:", rutina);
  return rutina;
}

// ===== FUNCIÓN: GENERAR UN ENTRENAMIENTO (UN DÍA) =====
function generarEntrenamiento(nombreDia, indice, config) {
  console.log(`\n📅 Generando ${nombreDia.toUpperCase()}...`);
  
  const entrenamiento = {
    dia: nombreDia,
    calentamiento: armarCalentamiento(),
    superseries: [],
    core: [],
    movimiento: []
  };

  // Distribución de pull/push por superserie: 3-4 ejercicios cada una (rutina más exigente)
  const distribucion = distribuirGruposSuperseries(indice, config.semanaActual);

  console.log(`Superserie 1: ${distribucion.s1.join(" + ")}`);
  console.log(`Superserie 2: ${distribucion.s2.join(" + ")}`);

  entrenamiento.superseries.push(armarSuperserie(distribucion.s1, nombreDia, 1, config));
  entrenamiento.superseries.push(armarSuperserie(distribucion.s2, nombreDia, 2, config));

  // Bloque de CORE: 3 ejercicios variados (recto + oblicuo + flexor de cadera)
  entrenamiento.core = generarBloqueCore(nombreDia, config);

  // Bloque de MOVIMIENTO (condicionamiento metabólico, cierre del entrenamiento)
  entrenamiento.movimiento.push(
    seleccionarEjercicio("movimiento", nombreDia, "movimiento-final", config)
  );

  return entrenamiento;
}

// ===== FUNCIÓN: ARMAR BLOQUE DE CALENTAMIENTO =====
function armarCalentamiento() {
  const disponibles = (bibliotecaCalistenia.calentamiento || []).slice();

  // Barajar (Fisher-Yates) para variar el orden
  for (let i = disponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
  }

  return disponibles.map(ej => ({
    id: ej.id,
    nombre: ej.nombre,
    tipo: ej.tipo,
    duracion: ej.duracion
  }));
}

// ===== FUNCIÓN: DISTRIBUIR PULL/PUSH ENTRE LAS DOS SUPERSERIES (3-4 ejercicios c/u) =====
// El core ya no rota acá: tiene su propio bloque dedicado de 3 ejercicios (generarBloqueCore).
function distribuirGruposSuperseries(indice, semana) {
  const rotaciones = [
    { s1: ["pull", "push", "pull"], s2: ["push", "pull", "push"] },                 // Lunes Semana 1 (3+3)
    { s1: ["pull", "push", "pull", "push"], s2: ["pull", "push", "pull"] },         // Miércoles Semana 1 (4+3)
    { s1: ["push", "pull", "push"], s2: ["push", "pull", "push", "pull"] },         // Viernes Semana 1 (3+4)

    { s1: ["pull", "push", "pull", "push"], s2: ["pull", "push", "pull"] },         // Lunes Semana 2 (4+3)
    { s1: ["push", "pull", "push"], s2: ["push", "pull", "push", "pull"] },         // Miércoles Semana 2 (3+4)
    { s1: ["pull", "push", "pull"], s2: ["pull", "push", "pull", "push"] }          // Viernes Semana 2 (3+4)
  ];

  const indexRotacion = ((semana - 1) % 2) * 3 + indice;
  return rotaciones[indexRotacion % rotaciones.length];
}

// ===== FUNCIÓN: GENERAR BLOQUE DE CORE (3 ejercicios: recto + oblicuo + flexor de cadera) =====
function generarBloqueCore(dia, config) {
  const categorias = ["recto", "oblicuo", "flexor_cadera"];
  const todosCore = (bibliotecaCalistenia.core || []);

  return categorias
    .map(categoria => {
      const candidatosCategoria = todosCore.filter(ej => ej.categoria === categoria);
      if (candidatosCategoria.length === 0) return null;
      const elegido = elegirEjercicioDeLista(candidatosCategoria, `core_${categoria}`, config);
      return formatearEjercicio(elegido, config);
    })
    .filter(Boolean);
}

// ===== FUNCIÓN: ARMAR UNA SUPERSERIE =====
function armarSuperserie(grupos, dia, numeroSuperserie, config) {
  console.log(`  Superserie ${numeroSuperserie}: ${grupos.join(" + ")}`);
  
  const superserie = {
    numero: numeroSuperserie,
    ejercicios: []
  };
  
  // Seleccionar 1 ejercicio por grupo (2-3 ejercicios total)
  grupos.forEach((grupo, pos) => {
    const ejercicio = seleccionarEjercicio(grupo, dia, numeroSuperserie, config);
    superserie.ejercicios.push(ejercicio);
  });
  
  return superserie;
}

// ===== FUNCIÓN: SELECCIONAR EJERCICIO (LA MAGIA) =====
const NIVEL_A_NUMERO = { principiante: 1, intermedio: 2, avanzado: 3 };

function seleccionarEjercicio(grupo, dia, numeroSuperserie, config) {
  if (typeof bibliotecaCalistenia === "undefined") {
    console.error("❌ bibliotecaCalistenia no está cargada");
    return null;
  }

  const ejerciciosDelGrupo = bibliotecaCalistenia[grupo];
  if (!ejerciciosDelGrupo || ejerciciosDelGrupo.length === 0) {
    console.error(`❌ No hay ejercicios para el grupo: ${grupo}`);
    return null;
  }

  const ejercicioElegido = elegirEjercicioDeLista(ejerciciosDelGrupo, grupo, config);
  const resultado = formatearEjercicio(ejercicioElegido, config);

  console.log(`✅ Seleccionado: ${ejercicioElegido.nombre} (Dif: ${ejercicioElegido.dificultad}/10, ${resultado.series}×${resultado.reps})`);

  return resultado;
}

// ===== FUNCIÓN: ELEGIR UN EJERCICIO DE UNA LISTA (excluye recientes, filtra nivel/RPE) =====
// `historialKey` agrupa el historial de "no repetir" (ej: "pull", "core_oblicuo").
function elegirEjercicioDeLista(lista, historialKey, config) {
  if (!config.historialEjercicios) config.historialEjercicios = {};
  if (!config.historialEjercicios[historialKey]) config.historialEjercicios[historialKey] = [];

  // Excluir ejercicios usados en las últimas 3 sesiones de esta lista (variedad)
  let candidatos = lista.filter(
    ej => !config.historialEjercicios[historialKey].slice(-3).includes(ej.id)
  );
  if (candidatos.length === 0) candidatos = lista;

  // Filtrar por nivel del usuario (acepta "principiante"/"intermedio"/"avanzado" o número 1-3)
  const nivelUsuario = typeof config.nivel === "number"
    ? config.nivel
    : (NIVEL_A_NUMERO[config.nivel] || 2);
  let porNivel = candidatos.filter(ej => ej.dificultad <= nivelUsuario * 2.5);
  if (porNivel.length > 0) candidatos = porNivel;

  // Ajustar por RPE de la semana anterior
  const rpePromedio = config.rpePromedio || 7;
  let porRpe = candidatos;
  if (rpePromedio >= 8.5) {
    porRpe = candidatos.filter(ej => ej.dificultad <= 5);
  } else if (rpePromedio <= 6) {
    porRpe = candidatos.filter(ej => ej.dificultad >= 4);
  }
  if (porRpe.length > 0) candidatos = porRpe;

  const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];

  // Guardar en historial para no repetir en próximas sesiones
  config.historialEjercicios[historialKey].push(elegido.id);

  return elegido;
}

// ===== FUNCIÓN: FORMATEAR UN EJERCICIO ELEGIDO AL SHAPE QUE USA EL RENDER =====
function formatearEjercicio(ejercicioElegido, config) {
  const objetivo = config.objetivoActual || "hipertrofia";
  const repsOptimas = ejercicioElegido.repsOptimas[objetivo]
    || ejercicioElegido.repsOptimas.hipertrofia
    || Object.values(ejercicioElegido.repsOptimas)[0];
  let reps = repsOptimas.reps;
  if (Array.isArray(reps)) reps = reps[0];
  const rpePromedio = config.rpePromedio || 7;
  if (rpePromedio >= 8 && typeof reps === "number") reps = Math.max(reps - 2, 1);

  return {
    id: ejercicioElegido.id,
    nombre: ejercicioElegido.nombre,
    series: repsOptimas.series || 3,
    reps,
    dificultad: ejercicioElegido.dificultad,
    nivel: ejercicioElegido.nivel,
    musculoPrincipal: ejercicioElegido.musculoPrincipal,
    musculos: ejercicioElegido.musculos,
    tempo: ejercicioElegido.tempo,
    descanso: ejercicioElegido.descanso
  };
}

// ===== FUNCIONES AUXILIARES: HISTORIAL =====

function obtenerEjerciciosUsados(semana, dia, grupo) {
  // Obtener ejercicios del grupo que ya usaste en este día de semanas anteriores
  const clave = `semana${semana}`;
  
  if (!historialEjercicios[clave] || !historialEjercicios[clave][dia]) {
    return [];
  }
  
  return historialEjercicios[clave][dia]
    .filter(ej => ejercicios[ej.id]?.musculoPrincipal === grupo || 
                  ejercicios[ej.id]?.musculos?.secundarios?.includes(grupo))
    .map(ej => ej.id);
}

function registrarEjercicioUsado(semana, dia, grupo, idEjercicio) {
  const clave = `semana${semana}`;
  
  if (!historialEjercicios[clave]) {
    historialEjercicios[clave] = { lunes: [], miercoles: [], viernes: [] };
  }
  
  if (!historialEjercicios[clave][dia]) {
    historialEjercicios[clave][dia] = [];
  }
  
  historialEjercicios[clave][dia].push({
    id: idEjercicio,
    grupo: grupo,
    fecha: new Date()
  });
  
  // Guardar en localStorage
  localStorage.setItem("historialEjercicios", JSON.stringify(historialEjercicios));
}

// ===== FUNCIÓN: DETECTAR ESTANCAMIENTO =====
function detectarEstancamiento(ultimasNSemanas = 3) {
  // Lógica: si en las últimas 3 semanas no progresó en reps/peso
  // Por ahora, simple: si RPE muy bajo O muy alto = problema
  
  if (configUsuario.rpePromedio > 9) {
    return "muy_fatigado"; // Necesita deload
  }
  
  if (configUsuario.rpePromedio < 3) {
    return "muy_facil"; // Necesita progresión
  }
  
  return "normal";
}

// ===== FUNCIÓN: SUGERIR ADAPTACIÓN =====
function sugerirAdaptacion(config) {
  const diagnostico = detectarEstancamiento();
  
  const sugerencias = {
    muy_fatigado: {
      accion: "DELOAD",
      descripcion: "Reduce volumen 30-40%, mismo ejercicios",
      recomendacion: "Descansa más, come mejor"
    },
    muy_facil: {
      accion: "PROGRESIÓN",
      descripcion: "Pasa a ejercicios más difíciles",
      recomendacion: "Busca desafío: progresiones, variantes más duras"
    },
    normal: {
      accion: "MANTENER",
      descripcion: "Continúa con el plan actual",
      recomendacion: "Sigue variando, mantén consistencia"
    }
  };
  
  return sugerencias[diagnostico];
}

// ===== EXPORTAR FUNCIONES =====
// Para usar en tu HTML: 
// const rutinaDeHoy = generarRutinaSemanal();
// console.log(rutinaDeHoy);
