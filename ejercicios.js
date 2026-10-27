const ejercicios = {
  // ===== PULL (Dorsal, Bíceps) =====
  pullups: {
    nombre: "Pull-up",
    musculoPrincipal: "dorsal ancho",
    musculos: {
      principal: "dorsal ancho",
      secundarios: ["bíceps", "deltoides posterior"]
    },
    nivel: "intermedio",
    dificultad: 6,
    equipamiento: ["barra"],
    repsOptimas: { min: 6, max: 12 },
    tempo: "2-1-2",
    descansoSeries: 90,
    descripcion: "Colgarse de una barra y subir hasta que la barbilla pase la barra",
    
    regresiones: [
      { id: "pullup_asistido", nombre: "Pull-up Asistido", dificultad: 4, descripcion: "Con banda elástica o máquina de asistencia" },
      { id: "pullup_negativo", nombre: "Pull-up Negativo", dificultad: 3, descripcion: "Salta arriba, baja lentamente (3-5 segundos)" },
      { id: "dead_hang", nombre: "Dead Hang", dificultad: 2, descripcion: "Solo cuelga de la barra, acostúmbrate al agarre" }
    ],
    
    progresiones: [
      { id: "pullup_arquero", nombre: "Archer Pull-up", dificultad: 7, descripcion: "Tira hacia un lado mientras subes" },
      { id: "onearm_pullup", nombre: "One-Arm Pull-up", dificultad: 9, descripcion: "Pull-up con un solo brazo" }
    ],
    
    variantes: [
      { id: "chinup", nombre: "Chin-up (Agarre Cerrado)", musculoPrincipal: "bíceps", dificultad: 5 },
      { id: "pullup_ancho", nombre: "Pull-up Agarre Ancho", dificultad: 7 },
      { id: "neutral_grip", nombre: "Neutral Grip Pull-up", dificultad: 6 }
    ]
  },

  rows: {
    nombre: "Rows (Remo)",
    musculoPrincipal: "dorsal ancho",
    musculos: {
      principal: "dorsal ancho",
      secundarios: ["bíceps", "trapecios"]
    },
    nivel: "principiante",
    dificultad: 4,
    equipamiento: ["barra baja"],
    repsOptimas: { min: 8, max: 12 },
    tempo: "2-1-2",
    descansoSeries: 75,
    descripcion: "Colgarte bajo una barra y tirar hacia ti",
    
    regresiones: [
      { id: "row_inclinado", nombre: "Row Inclinado", dificultad: 2, descripcion: "Con barra más alta (menos peso corporal)" }
    ],
    
    progresiones: [
      { id: "row_onearm", nombre: "One-Arm Row", dificultad: 6, descripcion: "Remo con un solo brazo" },
      { id: "row_pseudo", nombre: "Pseudo Planche Row", dificultad: 8, descripcion: "Remo con cuerpo casi horizontal" }
    ],
    
    variantes: [
      { id: "row_agarre_ancho", nombre: "Row Agarre Ancho", dificultad: 5 },
      { id: "row_agarre_cerrado", nombre: "Row Agarre Cerrado", dificultad: 4 }
    ]
  },

  // ===== PUSH (Pecho, Tríceps) =====
  pushups: {
    nombre: "Push-up",
    musculoPrincipal: "pecho",
    musculos: {
      principal: "pecho",
      secundarios: ["tríceps", "deltoides anterior"]
    },
    nivel: "principiante",
    dificultad: 3,
    equipamiento: [],
    repsOptimas: { min: 8, max: 15 },
    tempo: "2-1-2",
    descansoSeries: 60,
    descripcion: "Posición de plancha, bajas y subes empujando con brazos",
    
    regresiones: [
      { id: "pushup_inclinado", nombre: "Push-up Inclinado", dificultad: 2, descripcion: "Manos en un banco o silla" },
      { id: "pushup_rodillas", nombre: "Push-up Rodillas", dificultad: 1, descripcion: "Apoyado en rodillas" }
    ],
    
    progresiones: [
      { id: "pushup_deficit", nombre: "Push-up Déficit", dificultad: 4, descripcion: "Manos en libros/bloques para más rango" },
      { id: "pushup_onearm", nombre: "One-Arm Push-up", dificultad: 8, descripcion: "Push-up con un solo brazo" }
    ],
    
    variantes: [
      { id: "pushup_diamante", nombre: "Push-up Diamante", musculoPrincipal: "tríceps", dificultad: 5 },
      { id: "pushup_pino", nombre: "Handstand Push-up", musculoPrincipal: "deltoides", dificultad: 7 },
      { id: "pushup_ancho", nombre: "Push-up Agarre Ancho", dificultad: 4 }
    ]
  },

  dips: {
    nombre: "Dips",
    musculoPrincipal: "tríceps",
    musculos: {
      principal: "tríceps",
      secundarios: ["pecho", "deltoides anterior"]
    },
    nivel: "intermedio",
    dificultad: 6,
    equipamiento: ["paralelas o dos bancos"],
    repsOptimas: { min: 6, max: 12 },
    tempo: "2-1-2",
    descansoSeries: 90,
    descripcion: "Baja entre dos barras/bancos paralelos, luego sube",
    
    regresiones: [
      { id: "dips_asistido", nombre: "Dips Asistido", dificultad: 4, descripcion: "Con máquina de asistencia o banda" },
      { id: "dips_banco", nombre: "Bench Dips", dificultad: 3, descripcion: "Con dos bancos" }
    ],
    
    progresiones: [
      { id: "dips_weighted", nombre: "Weighted Dips", dificultad: 8, descripcion: "Con peso añadido (chaleco, mochila)" },
      { id: "dips_onearm", nombre: "One-Arm Dips", dificultad: 9, descripcion: "Dips con un brazo" }
    ],
    
    variantes: [
      { id: "dips_pecho", nombre: "Dips Pecho (Inclinado)", musculoPrincipal: "pecho", dificultad: 6 }
    ]
  },

  // ===== LEGS (Cuádriceps, Glúteos, Isquiotibiales) =====
  pistol_squat: {
    nombre: "Pistol Squat",
    musculoPrincipal: "cuádriceps",
    musculos: {
      principal: "cuádriceps",
      secundarios: ["glúteos", "isquiotibiales"]
    },
    nivel: "avanzado",
    dificultad: 8,
    equipamiento: [],
    repsOptimas: { min: 5, max: 10 },
    tempo: "3-1-2",
    descansoSeries: 120,
    descripcion: "Sentadilla profunda sobre una sola pierna",
    
    regresiones: [
      { id: "pistol_asistido", nombre: "Pistol Squat Asistido", dificultad: 6, descripcion: "Con una banda o cuerda para ayudarte" },
      { id: "pistol_box", nombre: "Pistol Squat Box", dificultad: 5, descripcion: "Sientas en un box al bajar" },
      { id: "bw_squat", nombre: "Bodyweight Squat", dificultad: 3, descripcion: "Sentadilla bilateral (dos piernas)" }
    ],
    
    progresiones: [
      { id: "pistol_weighted", nombre: "Pistol Squat Weighted", dificultad: 9, descripcion: "Con mancuerna" }
    ],
    
    variantes: [
      { id: "shrimp_squat", nombre: "Shrimp Squat", dificultad: 7, descripcion: "La otra pierna atrás, no completamente extendida" }
    ]
  },

  lunges: {
    nombre: "Lunges",
    musculoPrincipal: "cuádriceps",
    musculos: {
      principal: "cuádriceps",
      secundarios: ["glúteos", "isquiotibiales"]
    },
    nivel: "principiante",
    dificultad: 4,
    equipamiento: [],
    repsOptimas: { min: 8, max: 12 },
    tempo: "2-1-2",
    descansoSeries: 60,
    descripcion: "Paso largo adelante, baja hasta que ambas rodillas formen 90°",
    
    regresiones: [
      { id: "lunges_inclinado", nombre: "Lunges Inclinado", dificultad: 2, descripcion: "Manos en el piso para estabilizarte" }
    ],
    
    progresiones: [
      { id: "lunges_salto", nombre: "Jumping Lunges", dificultad: 6, descripcion: "Salta cambiando de pierna" },
      { id: "lunges_bulgaro", nombre: "Bulgarian Split Squat", dificultad: 6, descripcion: "Pierna atrás en un banco" }
    ],
    
    variantes: [
      { id: "lunges_reverso", nombre: "Reverse Lunges", dificultad: 4, descripcion: "Paso atrás en lugar de adelante" },
      { id: "lunges_lateral", nombre: "Lateral Lunges", dificultad: 4, descripcion: "Paso hacia el lado" }
    ]
  },

  // ===== CORE (Abdominales, Espalda Baja, Flexores de Cadera) =====
  l_sit: {
    nombre: "L-Sit",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: ["flexores de cadera", "serratos"]
    },
    nivel: "intermedio",
    dificultad: 7,
    equipamiento: ["barra o paralelas"],
    repsOptimas: { min: 10, max: 30 },
    tempo: "isométrico",
    descansoSeries: 90,
    descripcion: "Cuelga de barra con piernas estiradas horizontales, forma de L",
    
    regresiones: [
      { id: "l_sit_tuck", nombre: "L-Sit Tuck", dificultad: 5, descripcion: "Piernas dobladas (en posición de sentadilla)" },
      { id: "l_sit_single", nombre: "L-Sit Single Leg", dificultad: 6, descripcion: "Una pierna estirada, otra doblada" },
      { id: "dead_hang", nombre: "Dead Hang", dificultad: 2, descripcion: "Solo cuelga, fortalece el agarre" }
    ],
    
    progresiones: [
      { id: "v_sit", nombre: "V-Sit", dificultad: 9, descripcion: "Ambas piernas estiradas hacia arriba" }
    ],
    
    variantes: [
      { id: "l_sit_floor", nombre: "L-Sit Floor", dificultad: 6, descripcion: "En el piso, apoyado en manos" }
    ]
  },

  planche: {
    nombre: "Planche",
    musculoPrincipal: "pecho",
    musculos: {
      principal: "pecho",
      secundarios: ["deltoides", "serratos"]
    },
    nivel: "avanzado",
    dificultad: 9,
    equipamiento: ["piso"],
    repsOptimas: { min: 5, max: 30 },
    tempo: "isométrico",
    descansoSeries: 120,
    descripcion: "Cuerpo completamente horizontal, apoyado solo en manos",
    
    regresiones: [
      { id: "planche_tuck", nombre: "Planche Tuck", dificultad: 7, descripcion: "Piernas dobladas" },
      { id: "planche_advanced_tuck", nombre: "Planche Advanced Tuck", dificultad: 8, descripcion: "Piernas más estiradas" },
      { id: "pseudo_planche", nombre: "Pseudo Planche Pushup", dificultad: 6, descripcion: "Movimiento de push-up en planche" }
    ],
    
    progresiones: [
      { id: "planche_straddle", nombre: "Planche Straddle", dificultad: 9, descripcion: "Piernas abiertas en V" },
      { id: "full_planche", nombre: "Full Planche", dificultad: 10, descripcion: "Piernas totalmente estiradas juntas" }
    ],
    
    variantes: []
  },

  plancha: {
    nombre: "Plancha",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: ["espalda baja", "serratos"]
    },
    nivel: "principiante",
    dificultad: 3,
    equipamiento: [],
    repsOptimas: { min: 30, max: 180 },
    tempo: "isométrico",
    descansoSeries: 60,
    descripcion: "Posición de push-up, mantén sin bajar ni subir",
    
    regresiones: [
      { id: "plancha_rodillas", nombre: "Plancha Rodillas", dificultad: 2, descripcion: "Apoyado en rodillas" },
      { id: "plancha_inclinada", nombre: "Plancha Inclinada", dificultad: 2, descripcion: "Manos en un banco" }
    ],
    
    progresiones: [
      { id: "plancha_levantando_brazo", nombre: "Plancha con Brazo Levantado", dificultad: 4, descripcion: "Levanta un brazo mientras mantienes" },
      { id: "plancha_rcc", nombre: "RKC Plancha", dificultad: 5, descripcion: "Plancha con máxima tensión" }
    ],
    
    variantes: [
      { id: "plancha_lateral", nombre: "Plancha Lateral", dificultad: 4, descripcion: "De lado, sobre un codo" },
      { id: "plancha_inversa", nombre: "Plancha Inversa", dificultad: 5, descripcion: "De espalda" }
    ]
  },

  crunches: {
    nombre: "Crunches",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: []
    },
    nivel: "principiante",
    dificultad: 2,
    equipamiento: [],
    repsOptimas: { min: 12, max: 20 },
    tempo: "2-0-1",
    descansoSeries: 45,
    descripcion: "Acostado boca arriba, flexiona el abdomen hacia arriba",
    
    regresiones: [
      { id: "crunch_assist", nombre: "Crunch Asistido", dificultad: 1, descripcion: "Ayúdate con las manos" }
    ],
    
    progresiones: [
      { id: "crunch_deficit", nombre: "Crunch Déficit", dificultad: 3, descripcion: "Espalda sobre un declin (inclinado hacia atrás)" },
      { id: "crunch_pesos", nombre: "Weighted Crunches", dificultad: 4, descripcion: "Con plato o mancuerna en el pecho" }
    ],
    
    variantes: [
      { id: "crunch_oblicuo", nombre: "Oblique Crunches", dificultad: 3, descripcion: "Gira hacia un lado" }
    ]
  },

  hanging_leg_raise: {
    nombre: "Hanging Leg Raise",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: ["flexores de cadera"]
    },
    nivel: "intermedio",
    dificultad: 6,
    equipamiento: ["barra"],
    repsOptimas: { min: 8, max: 15 },
    tempo: "2-1-2",
    descansoSeries: 90,
    descripcion: "Cuelga de barra, levanta piernas hasta la horizontal",
    
    regresiones: [
      { id: "hlr_tuck", nombre: "Tuck Hanging Leg Raise", dificultad: 4, descripcion: "Piernas dobladas" },
      { id: "hlr_single", nombre: "Single Leg Raise", dificultad: 5, descripcion: "Una pierna a la vez" },
      { id: "knee_raise", nombre: "Knee Raise", dificultad: 3, descripcion: "Levanta rodillas hacia el pecho" }
    ],
    
    progresiones: [
      { id: "hlr_weighted", nombre: "Weighted Leg Raise", dificultad: 8, descripcion: "Con peso en tobillos" }
    ],
    
    variantes: [
      { id: "hlr_alternado", nombre: "Alternating Leg Raise", dificultad: 6, descripcion: "Levanta una pierna, luego la otra" }
    ]
  },

  v_sit: {
    nombre: "V-Sit",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: ["flexores de cadera", "serratos"]
    },
    nivel: "avanzado",
    dificultad: 9,
    equipamiento: [],
    repsOptimas: { min: 5, max: 20 },
    tempo: "isométrico",
    descansoSeries: 120,
    descripcion: "Cuerpo forma una V: manos atrás, piernas adelante, ambas estiradas",
    
    regresiones: [
      { id: "v_sit_tuck", nombre: "V-Sit Tuck", dificultad: 7, descripcion: "Piernas dobladas" },
      { id: "l_sit", nombre: "L-Sit", dificultad: 7, descripcion: "Piernas horizontales" }
    ],
    
    progresiones: [
      { id: "v_sit_hold", nombre: "V-Sit Hold", dificultad: 9, descripcion: "Mantener más tiempo" }
    ],
    
    variantes: []
  },

  ab_wheel: {
    nombre: "Ab Wheel Rollout",
    musculoPrincipal: "abdominales",
    musculos: {
      principal: "abdominales",
      secundarios: ["pecho", "serratos", "espalda baja"]
    },
    nivel: "avanzado",
    dificultad: 7,
    equipamiento: ["ab wheel"],
    repsOptimas: { min: 8, max: 15 },
    tempo: "3-1-2",
    descansoSeries: 90,
    descripcion: "Rodillo ab: extiende hacia adelante y retrae el abdomen",
    
    regresiones: [
      { id: "ab_wheel_knee", nombre: "Ab Wheel Rodillas", dificultad: 5, descripcion: "De rodillas" },
      { id: "ab_wheel_wall", nombre: "Ab Wheel Wall", dificultad: 4, descripcion: "Contra la pared para limitar rango" },
      { id: "ab_wheel_incline", nombre: "Ab Wheel Incline", dificultad: 6, descripcion: "Manos en un banco inclinado" }
    ],
    
    progresiones: [
      { id: "ab_wheel_full", nombre: "Ab Wheel Full Extension", dificultad: 9, descripcion: "Completamente estirado" }
    ],
    
    variantes: [
      { id: "ab_wheel_oblicuo", nombre: "Ab Wheel Diagonal", dificultad: 8, descripcion: "Diagonal hacia los lados" }
    ]
  },

  handstand: {
    nombre: "Handstand Hold",
    musculoPrincipal: "deltoides",
    musculos: {
      principal: "deltoides",
      secundarios: ["trapecios", "serratos", "core"]
    },
    nivel: "intermedio",
    dificultad: 7,
    equipamiento: ["pared"],
    repsOptimas: { min: 20, max: 120 },
    tempo: "isométrico",
    descansoSeries: 90,
    descripcion: "Invertido sobre manos, cuerpo alineado verticalmente",
    
    regresiones: [
      { id: "handstand_wall", nombre: "Handstand Wall Hold", dificultad: 6, descripcion: "Espalda contra la pared" },
      { id: "handstand_chest", nombre: "Handstand Chest to Wall", dificultad: 6, descripcion: "Frente hacia la pared" },
      { id: "pike_pushup", nombre: "Pike Push-up", dificultad: 5, descripcion: "Push-up modificado hacia arriba" }
    ],
    
    progresiones: [
      { id: "handstand_hspu", nombre: "Handstand Push-up", dificultad: 8, descripcion: "Push-up invertido" },
      { id: "handstand_freestand", nombre: "Handstand Freestanding", dificultad: 9, descripcion: "Sin pared" }
    ],
    
    variantes: [
      { id: "handstand_shoulder_tap", nombre: "Handstand Shoulder Tap", dificultad: 8, descripcion: "Toca el hombro opuesto mientras sostienes" }
    ]
  },

  muscle_up: {
    nombre: "Muscle-Up",
    musculoPrincipal: "pecho",
    musculos: {
      principal: "pecho",
      secundarios: ["dorsales", "tríceps", "deltoides"]
    },
    nivel: "avanzado",
    dificultad: 9,
    equipamiento: ["barra paralelas o anillas"],
    repsOptimas: { min: 5, max: 12 },
    tempo: "2-1-2",
    descansoSeries: 120,
    descripcion: "Tienes hacia arriba y pasas por encima (transición de tiro a empuje)",
    
    regresiones: [
      { id: "muscle_up_assist", nombre: "Muscle-up Asistido", dificultad: 7, descripcion: "Con banda o máquina" },
      { id: "transition_drill", nombre: "Transition Drills", dificultad: 7, descripcion: "Practica solo el cambio" },
      { id: "dips_pullups", nombre: "Dips + Pull-ups", dificultad: 7, descripcion: "Haz ambos por separado" }
    ],
    
    progresiones: [
      { id: "muscle_up_strict", nombre: "Strict Muscle-up", dificultad: 10, descripcion: "Sin momentum" }
    ],
    
    variantes: [
      { id: "muscle_up_rings", nombre: "Muscle-up Anillas", dificultad: 9, descripcion: "En anillas (más difícil)" }
    ]
  },

  front_lever: {
    nombre: "Front Lever Hold",
    musculoPrincipal: "dorsal ancho",
    musculos: {
      principal: "dorsal ancho",
      secundarios: ["bíceps", "serratos"]
    },
    nivel: "avanzado",
    dificultad: 9,
    equipamiento: ["barra"],
    repsOptimas: { min: 10, max: 60 },
    tempo: "isométrico",
    descansoSeries: 120,
    descripcion: "Cuelga de barra, cuerpo horizontal hacia adelante",
    
    regresiones: [
      { id: "fl_tuck", nombre: "Front Lever Tuck", dificultad: 7, descripcion: "Piernas dobladas" },
      { id: "fl_single", nombre: "Front Lever Single Leg", dificultad: 8, descripcion: "Una pierna estirada" },
      { id: "fl_straddle", nombre: "Front Lever Straddle", dificultad: 8, descripcion: "Piernas abiertas en V" }
    ],
    
    progresiones: [
      { id: "fl_full", nombre: "Full Front Lever", dificultad: 10, descripcion: "Ambas piernas estiradas y juntas" }
    ],
    
    variantes: []
  },

  back_lever: {
    nombre: "Back Lever Hold",
    musculoPrincipal: "pecho",
    musculos: {
      principal: "pecho",
      secundarios: ["deltoides", "core"]
    },
    nivel: "avanzado",
    dificultad: 9,
    equipamiento: ["barra"],
    repsOptimas: { min: 10, max: 60 },
    tempo: "isométrico",
    descansoSeries: 120,
    descripcion: "Cuelga de barra, cuerpo horizontal hacia atrás",
    
    regresiones: [
      { id: "bl_tuck", nombre: "Back Lever Tuck", dificultad: 7, descripcion: "Piernas dobladas" },
      { id: "bl_single", nombre: "Back Lever Single Leg", dificultad: 8, descripcion: "Una pierna estirada" }
    ],
    
    progresiones: [
      { id: "bl_full", nombre: "Full Back Lever", dificultad: 10, descripcion: "Piernas totalmente estiradas" }
    ],
    
    variantes: []
  }
};