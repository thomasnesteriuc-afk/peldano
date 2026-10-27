/**
 * NUTRICION-COMPLETO.JS
 * Guía de nutrición basada en hábitos y método del plato, sin registro de comidas
 * ni conteo de macros — pensada para sostenerse en el tiempo, no para trackear.
 */

// ============================================================
// PARTE 1: MÉTODO DEL PLATO (sin balanza, sin gramos)
// ============================================================

const metodoDelPlato = {
  slices: [
    { nombre: "Vegetales", color: "#4CAF50", desde: 0, hasta: 180 },
    { nombre: "Proteína", color: "#FF7043", desde: 180, hasta: 270 },
    { nombre: "Carbohidratos", color: "#FFC107", desde: 270, hasta: 360 }
  ],

  porciones: [
    { icono: "🥦", texto: "Vegetales: 2-3 puños por comida" },
    { icono: "🍗", texto: "Proteína: 1-2 palmas por comida" },
    { icono: "🍚", texto: "Carbohidratos: 1-2 puños ahuecados por comida" },
    { icono: "🥑", texto: "Grasas: 1-2 pulgares por comida" }
  ]
};

// ============================================================
// PARTE 2: MENSAJE SEGÚN EL DÍA (flexibilidad de fin de semana)
// ============================================================

const diasSemana = [
  { corta: "D", esFinde: true },
  { corta: "L", esFinde: false },
  { corta: "M", esFinde: false },
  { corta: "M", esFinde: false },
  { corta: "J", esFinde: false },
  { corta: "V", esFinde: false },
  { corta: "S", esFinde: true }
];

function mensajeDelDia() {
  let hoy = new Date().getDay(); // 0 = domingo, 6 = sábado
  let esFinde = diasSemana[hoy].esFinde;

  if (esFinde) {
    return {
      titulo: "🎉 Hoy es findes",
      texto: "No hace falta seguir el plan al pie de la letra. Comé lo que quieras, sin culpa — lo que construye resultados es lo que hacés la mayoría de los días, no la perfección de uno solo."
    };
  }

  return {
    titulo: "📅 Día de semana",
    texto: "Buen momento para sostener tus hábitos de siempre. No hace falta ser perfecto, solo consistente."
  };
}

// ============================================================
// PARTE 3: TIP SEGÚN LA HORA DEL DÍA
// ============================================================

function tipSegunHora() {
  let hora = new Date().getHours();

  if (hora >= 6 && hora < 10) {
    return { titulo: "🌅 Desayuno", texto: "Comé algo con proteína (huevos, yogur) + carbos (avena, pan) para arrancar con energía." };
  }
  if (hora >= 10 && hora < 12) {
    return { titulo: "☀️ Media mañana", texto: "Si vas a entrenar más tarde, una fruta o un puñado de frutos secos te sostiene sin pesar." };
  }
  if (hora >= 12 && hora < 14) {
    return { titulo: "🍽️ Almuerzo", texto: "Armá tu plato con el método de siempre: mitad vegetales, un cuarto proteína, un cuarto carbos." };
  }
  if (hora >= 14 && hora < 18) {
    return { titulo: "🏋️ Pre-entreno", texto: "Si entrenás pronto, priorizá carbos + proteína liviana. Dejá las grasas para después — hacen la digestión más lenta." };
  }
  if (hora >= 18 && hora < 20) {
    return { titulo: "⚡ Post-entreno", texto: "Después de entrenar es buen momento para proteína + carbos — ayuda a la recuperación." };
  }
  if (hora >= 20 && hora < 22) {
    return { titulo: "🌙 Cena", texto: "Cená liviano, 2-3 horas antes de dormir si podés. Proteína + vegetales van bien." };
  }
  return { titulo: "😴 Antes de dormir", texto: "Si tenés hambre antes de dormir, algo con proteína de digestión lenta (yogur, queso) es mejor que algo muy dulce." };
}

// ============================================================
// PARTE 4: TIPS POR OBJETIVO (habitos, no gramos)
// ============================================================

const tipsNutricion = {
  tipsPorObjetivo: {
    hipertrofia: [
      { titulo: "🎯 Comé un poco más", texto: "Si no notás cambios en 2-3 semanas, sumá una porción extra de carbos o proteína por comida." },
      { titulo: "🍗 Proteína en cada plato", texto: "Usá tu palma como referencia: una porción de proteína en cada comida." },
      { titulo: "🌾 Carbos post-entreno", texto: "Comer carbos + proteína después de entrenar ayuda a recuperarte más rápido." },
      { titulo: "😴 Dormí bien", texto: "Dormir bien es tan importante como comer bien para ganar músculo." }
    ],
    fuerza: [
      { titulo: "⚖️ Mantené tu peso estable", texto: "No busques ganar ni bajar peso, solo rendir en tus entrenamientos." },
      { titulo: "🍗 Proteína constante", texto: "Una porción de proteína por comida, sin obsesionarte con el número exacto." },
      { titulo: "🍚 No evites los carbos", texto: "Te dan la energía para sostener series pesadas." }
    ],
    perdida_grasa: [
      { titulo: "🥗 Mitad del plato en vegetales", texto: "Llenan sin sumar muchas calorías — te ayudan a sentirte satisfecho." },
      { titulo: "🍗 Priorizá proteína", texto: "Te ayuda a no perder músculo mientras bajás de peso." },
      { titulo: "💧 Agua antes de comer", texto: "Ayuda a distinguir hambre real de ganas de comer." },
      { titulo: "🚫 Cuidado con lo líquido", texto: "Bebidas azucaradas y alcohol suman calorías sin llenarte. Si podés, evitalas entre semana." }
    ],
    mantenimiento: [
      { titulo: "⚖️ Consistencia, no perfección", texto: "Comé de forma parecida la mayoría de los días." },
      { titulo: "🍽️ El plato como referencia", texto: "Usá el método del plato en vez de contar gramos." }
    ]
  },

  generarTips(objetivo) {
    return this.tipsPorObjetivo[objetivo] || this.tipsPorObjetivo['mantenimiento'];
  },

  tipsGenerales: [
    { titulo: "📊 Consistencia > perfección", texto: "Mejor 80% bien todos los días que 100% perfecto tres días." },
    { titulo: "💧 Hidratación", texto: "Tomá agua durante el día, más si entrenás fuerte." },
    { titulo: "😴 Dormí 7-9 horas", texto: "Dormir bien ayuda tanto como comer bien." },
    { titulo: "🥦 Comé variado y colorido", texto: "Así cubrís más vitaminas y minerales sin pensarlo." },
    { titulo: "🚫 Evitá dietas extremas", texto: "Si no podés sostenerla 3 meses, no te sirve a largo plazo." }
  ]
};

// ============================================================
// PARTE 5: UI - RENDERIZAR PESTAÑA NUTRICIÓN
// ============================================================

function renderTabNutricion() {
  let hoy = new Date().getDay();
  let mensaje = mensajeDelDia();
  let tipHora = tipSegunHora();
  let objetivo = (typeof configUsuario !== 'undefined' && configUsuario.objetoActual) || 'hipertrofia';
  let tipsObjetivo = tipsNutricion.generarTips(objetivo);

  // Dos tips generales, rotando según el día del año (variedad sin ser random cada render)
  let diaDelAnio = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  let generales = tipsNutricion.tipsGenerales;
  let idxA = diaDelAnio % generales.length;
  let idxB = (diaDelAnio + 1) % generales.length;
  let tipsGeneralesHoy = [generales[idxA], generales[idxB]];

  let svgSlices = metodoDelPlato.slices.map(s => {
    let toRad = deg => deg * Math.PI / 180;
    let cx = 100, cy = 100, r = 90;
    let x0 = cx + r * Math.sin(toRad(s.desde)), y0 = cy - r * Math.cos(toRad(s.desde));
    let x1 = cx + r * Math.sin(toRad(s.hasta)), y1 = cy - r * Math.cos(toRad(s.hasta));
    let largeArc = (s.hasta - s.desde) > 180 ? 1 : 0;
    return `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${s.color}" />`;
  }).join('');

  let legendPlato = metodoDelPlato.slices.map(s => `
    <div style="display:flex; align-items:center; gap:8px; font-size:12px; margin-bottom:4px;">
      <span style="width:10px; height:10px; border-radius:3px; background:${s.color}; display:inline-block;"></span>
      <span>${s.nombre}</span>
    </div>
  `).join('');

  let semanaHtml = diasSemana.map((d, idx) => `
    <div style="flex:1; text-align:center;">
      <div style="width:28px; height:28px; margin:0 auto 4px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;
        background:${idx === hoy ? 'var(--accent)' : (d.esFinde ? 'rgba(255,193,7,0.18)' : 'var(--bg)')};
        color:${idx === hoy ? '#fff' : (d.esFinde ? '#FFC107' : 'var(--text-dim)')};
        border:${idx === hoy ? 'none' : '1px solid var(--text-dim)'};">
        ${d.corta}
      </div>
      ${d.esFinde ? '<span style="font-size:14px;">🎉</span>' : ''}
    </div>
  `).join('');

  let html = `
    <div style="padding:16px; color:var(--text);">

      <!-- MÉTODO DEL PLATO -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">🍽️ CÓMO ARMAR TU PLATO</p>
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <svg viewBox="0 0 200 200" width="120" height="120" style="flex-shrink:0;">
            ${svgSlices}
            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg)" stroke-width="3" />
          </svg>
          <div>${legendPlato}</div>
        </div>
        <div style="border-top:1px solid var(--text-dim); margin-top:12px; padding-top:12px;">
          <p style="font-size:12px; color:var(--text-dim); margin:0 0 8px;">Sin balanza — medí con la mano:</p>
          ${metodoDelPlato.porciones.map(p => `
            <div style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:6px;">
              <span style="font-size:16px;">${p.icono}</span>
              <span>${p.texto}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TU SEMANA -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">📅 TU SEMANA</p>
        <div style="display:flex; margin-bottom:14px;">${semanaHtml}</div>
        <div style="background:var(--bg); padding:10px; border-radius:6px;">
          <p style="margin:0 0 4px; font-weight:600; font-size:13px;">${mensaje.titulo}</p>
          <p style="margin:0; font-size:12px; color:var(--text-dim);">${mensaje.texto}</p>
        </div>
      </div>

      <!-- TIP DE AHORA -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px; border-left:3px solid var(--accent);">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 6px;">${tipHora.titulo}</p>
        <p style="margin:0; font-size:13px; color:var(--text-dim);">${tipHora.texto}</p>
      </div>

      <!-- TIPS POR OBJETIVO -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">💡 TIPS PARA TU OBJETIVO</p>
        ${tipsObjetivo.map(tip => `
          <div style="background:var(--bg); padding:10px; border-radius:6px; margin-bottom:8px;">
            <p style="margin:0 0 4px; font-weight:600; font-size:13px;">${tip.titulo}</p>
            <p style="margin:0; font-size:12px; color:var(--text-dim);">${tip.texto}</p>
          </div>
        `).join('')}
      </div>

      <!-- RECORDÁ -->
      <div style="background:var(--panel); border-radius:12px; padding:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">🧠 RECORDÁ</p>
        ${tipsGeneralesHoy.map(tip => `
          <div style="background:var(--bg); padding:10px; border-radius:6px; margin-bottom:8px;">
            <p style="margin:0 0 4px; font-weight:600; font-size:13px;">${tip.titulo}</p>
            <p style="margin:0; font-size:12px; color:var(--text-dim);">${tip.texto}</p>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  return html;
}

console.log('✅ nutricion-completo.js cargado - guía de tips (sin tracking)');
