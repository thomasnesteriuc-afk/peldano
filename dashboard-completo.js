/**
 * DASHBOARD-COMPLETO.JS
 * Dashboard de progreso con gráficos RPE histórico
 * - Selector de fechas (custom)
 * - Gráficos interactivos
 * - Descargable como JSON
 */

const dashboardProgreso = {
  // OBTENER DATOS RPE EN RANGO DE FECHAS
  obtenerRPEEnRango(fechaInicio, fechaFin) {
    let datos = [];
    let fecha = new Date(fechaInicio);
    
    while (fecha <= fechaFin) {
      let fechaString = fecha.toDateString();
      let historialDia = JSON.parse(localStorage.getItem(`sesion_${fechaString}`) || '{}');
      
      if (historialDia.rpePromedio !== undefined) {
        datos.push({
          fecha: fechaString,
          rpePromedio: historialDia.rpePromedio,
          cantidadEjercicios: historialDia.ejercicios ? historialDia.ejercicios.length : 0
        });
      }
      
      fecha.setDate(fecha.getDate() + 1);
    }
    
    return datos;
  },

  // CALCULAR ESTADÍSTICAS
  calcularEstadisticas(datos) {
    if (datos.length === 0) return null;
    
    let rpes = datos.map(d => d.rpePromedio);
    let suma = rpes.reduce((a, b) => a + b, 0);
    let promedio = suma / rpes.length;
    let max = Math.max(...rpes);
    let min = Math.min(...rpes);
    
    return {
      promedio: (promedio).toFixed(1),
      maximo: max,
      minimo: min,
      totalSesiones: datos.length,
      tendencia: rpes[rpes.length - 1] > rpes[0] ? "📈 SUBIENDO" : "📉 BAJANDO"
    };
  },

  // OBTENER PESO CORPORAL HISTÓRICO
  obtenerPesoEnRango(fechaInicio, fechaFin) {
    let datos = [];
    let fecha = new Date(fechaInicio);
    
    while (fecha <= fechaFin) {
      let fechaString = fecha.toDateString();
      let peso = JSON.parse(localStorage.getItem(`peso_${fechaString}`) || 'null');
      
      if (peso) {
        datos.push({
          fecha: fechaString,
          peso: peso
        });
      }
      
      fecha.setDate(fecha.getDate() + 1);
    }
    
    return datos;
  },

  // OBTENER RÉCORDS PERSONALES
  obtenerRecordsPorEjercicio() {
    let records = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key.startsWith('record_')) {
        let ejercicio = key.replace('record_', '');
        records[ejercicio] = JSON.parse(localStorage.getItem(key));
      }
    }
    
    return records;
  },

  // ÁRBOL DE HABILIDADES
  arbolHabilidades() {
    let habilidades = [
      {
        nombre: "Pull-up Strict",
        niveles: ["Australian Row", "Band-Assisted", "Negative", "Strict", "Close Grip", "Archer", "One-Arm"],
        actual: 3 // placeholder
      },
      {
        nombre: "Push-up Strict",
        niveles: ["Incline", "Strict", "Diamond", "Pseudo Planche", "Planche"],
        actual: 2
      },
      {
        nombre: "Planche",
        niveles: ["Tuck Planche", "Advanced Tuck", "Single Leg Tuck", "Straddle", "Full Planche"],
        actual: 1
      },
      {
        nombre: "Handstand",
        niveles: ["Wall-assisted", "Wall Sit", "Handstand Hold", "Free Standing", "Handstand Push-up"],
        actual: 2
      },
      {
        nombre: "L-Sit",
        niveles: ["Tuck", "Single Leg", "V-Sit", "Full L-Sit", "V-Sit Tucked"],
        actual: 1
      }
    ];
    
    return habilidades;
  },

  // DESCARGAR DATOS COMO JSON
  descargarJSON(datos, nombreArchivo = "progreso") {
    let json = JSON.stringify(datos, null, 2);
    let blob = new Blob([json], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    console.log(`✅ Descargado: ${link.download}`);
  }
};

// ============================================================
// UI - RENDERIZAR DASHBOARD
// ============================================================

function renderTabDashboard() {
  let hoy = new Date();
  let hace4Semanas = new Date(hoy.getTime() - 28 * 24 * 60 * 60 * 1000);
  
  let html = `
    <div style="padding:16px; color:var(--text);">
      
      <!-- SELECTOR DE FECHAS -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">📅 SELECCIONA RANGO DE FECHAS</p>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div>
            <label style="font-size:12px; color:var(--text-dim);">Desde:</label>
            <input type="date" id="fecha-inicio" value="${hace4Semanas.toISOString().split('T')[0]}"
              style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--text-dim); background:var(--bg); color:var(--text);">
          </div>
          <div>
            <label style="font-size:12px; color:var(--text-dim);">Hasta:</label>
            <input type="date" id="fecha-fin" value="${hoy.toISOString().split('T')[0]}"
              style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--text-dim); background:var(--bg); color:var(--text);">
          </div>
        </div>
        
        <button onclick="actualizarDashboard()" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
          🔄 Cargar Datos
        </button>
      </div>
      
      <!-- ESTADÍSTICAS RPE -->
      <div id="stats-box" style="display:none; background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">📊 ESTADÍSTICAS RPE</p>
        <div id="stats-contenido"></div>
      </div>
      
      <!-- GRÁFICO RPE HISTÓRICO -->
      <div id="grafico-box" style="display:none; background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">📈 RPE HISTÓRICO</p>
        <canvas id="canvas-rpe" width="400" height="200" style="width:100%; max-height:250px; border-radius:6px; background:var(--bg);"></canvas>
      </div>
      
      <!-- ÁRBOL DE HABILIDADES -->
      <div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">
        <p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px;">🌳 ÁRBOL DE HABILIDADES</p>
        <div id="arbol-contenido"></div>
      </div>
      
      <!-- DESCARGAR DATOS -->
      <div style="background:var(--panel); border-radius:12px; padding:16px;">
        <button onclick="descargarDatos()" style="width:100%; padding:12px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
          ⬇️ DESCARGAR DATOS (JSON)
        </button>
        <p style="font-size:12px; color:var(--text-dim); text-align:center; margin-top:8px;">Descarga tu progreso en formato JSON</p>
      </div>
    </div>
  `;
  
  setTimeout(mostrarArbol, 500);
  
  return html;
}

function actualizarDashboard() {
  let fechaInicio = document.getElementById('fecha-inicio').value;
  let fechaFin = document.getElementById('fecha-fin').value;
  
  if (!fechaInicio || !fechaFin) {
    alert('Selecciona ambas fechas');
    return;
  }
  
  let datos = dashboardProgreso.obtenerRPEEnRango(
    new Date(fechaInicio),
    new Date(fechaFin)
  );
  
  if (datos.length === 0) {
    alert('No hay datos en ese rango de fechas');
    document.getElementById('stats-box').style.display = 'none';
    document.getElementById('grafico-box').style.display = 'none';
    return;
  }
  
  // Mostrar estadísticas
  let stats = dashboardProgreso.calcularEstadisticas(datos);
  let statsHtml = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <div style="background:var(--bg); padding:10px; border-radius:6px; text-align:center;">
        <p style="margin:0; font-size:12px; color:var(--text-dim);">RPE Promedio</p>
        <p style="margin:0; font-size:18px; font-weight:700; color:var(--accent);">${stats.promedio}</p>
      </div>
      <div style="background:var(--bg); padding:10px; border-radius:6px; text-align:center;">
        <p style="margin:0; font-size:12px; color:var(--text-dim);">Sesiones</p>
        <p style="margin:0; font-size:18px; font-weight:700; color:var(--accent);">${stats.totalSesiones}</p>
      </div>
      <div style="background:var(--bg); padding:10px; border-radius:6px; text-align:center;">
        <p style="margin:0; font-size:12px; color:var(--text-dim);">Máximo RPE</p>
        <p style="margin:0; font-size:18px; font-weight:700; color:#FF5722;">${stats.maximo}</p>
      </div>
      <div style="background:var(--bg); padding:10px; border-radius:6px; text-align:center;">
        <p style="margin:0; font-size:12px; color:var(--text-dim);">Tendencia</p>
        <p style="margin:0; font-size:14px; font-weight:700;">${stats.tendencia}</p>
      </div>
    </div>
  `;
  document.getElementById('stats-contenido').innerHTML = statsHtml;
  document.getElementById('stats-box').style.display = 'block';
  
  // Dibujar gráfico
  dibujarGraficoRPE(datos);
  document.getElementById('grafico-box').style.display = 'block';
  
  // Guardar datos para descargar
  window.datosParaDescargar = { stats, datos, fechaInicio, fechaFin };
}

function dibujarGraficoRPE(datos) {
  let canvas = document.getElementById('canvas-rpe');
  if (!canvas || !canvas.getContext) return;
  
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = 'var(--bg)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar línea de RPE
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  let padding = 30;
  let width = canvas.width - padding * 2;
  let height = canvas.height - padding * 2;
  
  datos.forEach((d, idx) => {
    let x = padding + (idx / (datos.length - 1 || 1)) * width;
    let y = canvas.height - padding - (d.rpePromedio / 10) * height;
    
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  
  ctx.stroke();
  
  // Puntos
  ctx.fillStyle = '#4CAF50';
  datos.forEach((d, idx) => {
    let x = padding + (idx / (datos.length - 1 || 1)) * width;
    let y = canvas.height - padding - (d.rpePromedio / 10) * height;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Etiquetas Y (RPE)
  ctx.fillStyle = '#888';
  ctx.font = '11px Arial';
  for (let i = 0; i <= 10; i += 2) {
    let y = canvas.height - padding - (i / 10) * height;
    ctx.fillText(i, padding - 20, y);
  }
  
  console.log('✅ Gráfico RPE dibujado');
}

function mostrarArbol() {
  let habilidades = dashboardProgreso.arbolHabilidades();
  
  let html = habilidades.map(h => `
    <div style="background:var(--bg); padding:10px; border-radius:6px; margin-bottom:10px;">
      <p style="margin:0 0 6px; font-weight:600; font-size:13px;">${h.nombre}</p>
      <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
        ${h.niveles.map((n, idx) => `
          <span style="padding:4px 8px; border-radius:4px; font-size:11px; background:${idx < h.actual ? 'var(--accent)' : idx === h.actual ? '#FFC107' : '#555'}; color:white;">
            ${n}
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  document.getElementById('arbol-contenido').innerHTML = html;
}

function descargarDatos() {
  if (!window.datosParaDescargar) {
    alert('Carga datos primero (clickea "Cargar Datos")');
    return;
  }
  
  let descarga = {
    generado: new Date().toISOString(),
    estadisticas: window.datosParaDescargar.stats,
    rango: {
      desde: window.datosParaDescargar.fechaInicio,
      hasta: window.datosParaDescargar.fechaFin
    },
    sesiones: window.datosParaDescargar.datos
  };
  
  dashboardProgreso.descargarJSON(descarga, 'progreso');
}

console.log('✅ dashboard-completo.js cargado');
