/**
 * TRACKING-RPE.JS
 * Registra RPE por ejercicio después de cada sesión
 * Me costó (8-9) | Cumplí (7) | Me sobró (5-6)
 */

// ===== ESTRUCTURA DE DATOS PARA TRACKING =====
const trackingRPE = {
  sesiones: [] // Array de sesiones completadas
};

// ===== CARGAR TRACKING DESDE LOCALSTORAGE =====
function cargarTrackingRPE() {
  const guardado = localStorage.getItem('trackingRPE');
  if (guardado) {
    try {
      Object.assign(trackingRPE, JSON.parse(guardado));
      console.log('✅ Tracking RPE cargado:', trackingRPE.sesiones.length, 'sesiones');
    } catch (e) {
      console.error('❌ Error cargando tracking:', e);
    }
  }
}

// ===== GUARDAR TRACKING EN LOCALSTORAGE =====
function guardarTrackingRPE() {
  localStorage.setItem('trackingRPE', JSON.stringify(trackingRPE));
  console.log('💾 Tracking RPE guardado');
}

// ===== REGISTRAR SESIÓN CON RPE POR EJERCICIO =====
function registrarSesionRPE(ejercicios, fecha = new Date().toDateString()) {
  /**
   * ejercicios = [
   *   { id: 'pullup', nombre: 'Pull-up', rpe: 7 },
   *   { id: 'pushup', nombre: 'Push-up', rpe: 8 },
   *   ...
   * ]
   */
  
  if (!Array.isArray(ejercicios) || ejercicios.length === 0) {
    console.error('❌ ejercicios debe ser un array no vacío');
    return false;
  }

  const sesion = {
    fecha: fecha,
    ejercicios: ejercicios.map(ej => ({
      id: ej.id,
      nombre: ej.nombre,
      rpe: ej.rpe, // 5-9
      rpeLabel: obtenerRPELabel(ej.rpe)
    }))
  };

  trackingRPE.sesiones.push(sesion);
  guardarTrackingRPE();

  console.log('✅ Sesión registrada:', sesion);
  return true;
}

// ===== CONVERTIR RPE A LABEL =====
function obtenerRPELabel(rpe) {
  if (rpe >= 8) return 'Me costó';
  if (rpe === 7) return 'Cumplí';
  if (rpe <= 6) return 'Me sobró';
  return 'Desconocido';
}

// ===== OBTENER ÚLTIMAS N SESIONES =====
function obtenerUltimasSesiones(n = 2) {
  return trackingRPE.sesiones.slice(-n);
}

// ===== OBTENER HISTORIAL DE UN EJERCICIO =====
function obtenerHistorialEjercicio(idEjercicio, ultimas = 4) {
  /**
   * Devuelve las últimas N sesiones donde apareció este ejercicio
   */
  const historial = [];
  
  for (let i = trackingRPE.sesiones.length - 1; i >= 0 && historial.length < ultimas; i--) {
    const sesion = trackingRPE.sesiones[i];
    const ejercicio = sesion.ejercicios.find(e => e.id === idEjercicio);
    
    if (ejercicio) {
      historial.unshift({
        fecha: sesion.fecha,
        rpe: ejercicio.rpe,
        rpeLabel: ejercicio.rpeLabel
      });
    }
  }
  
  return historial;
}

// ===== CALCULAR RPE PROMEDIO DE LA SEMANA =====
function calcularRPEPromedioSemana() {
  const hoy = new Date();
  const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const sesionesEstaSemana = trackingRPE.sesiones.filter(s => {
    const fechaSesion = new Date(s.fecha);
    return fechaSesion >= hace7dias && fechaSesion <= hoy;
  });

  if (sesionesEstaSemana.length === 0) return null;

  let sumaRPE = 0;
  let cantidadEjercicios = 0;

  sesionesEstaSemana.forEach(sesion => {
    sesion.ejercicios.forEach(ej => {
      sumaRPE += ej.rpe;
      cantidadEjercicios++;
    });
  });

  return (sumaRPE / cantidadEjercicios).toFixed(1);
}

// ===== RENDERIZAR FORMULARIO DE RPE =====
function renderFormularioRPE(ejercicios) {
  /**
   * Crea un formulario para que el usuario registre RPE por ejercicio
   * ejercicios = array de ejercicios de la sesión actual
   */
  
  let html = '<div style="background:var(--panel); border-radius:12px; padding:16px; margin-bottom:16px;">';
  html += '<p style="font-weight:700; color:var(--accent-strong); margin:0 0 12px; font-size:15px;">📊 ¿Cómo fue la sesión?</p>';
  html += '<p style="font-size:13px; color:var(--text-dim); margin:0 0 16px;">Registra RPE por ejercicio</p>';

  ejercicios.forEach((ej, idx) => {
    const id = `rpe-select-${idx}`;
    html += `<div style="margin-bottom:12px; padding:10px; background:var(--bg); border-radius:8px;">`;
    html += `<label style="font-weight:500; font-size:13px; display:block; margin-bottom:6px;">${ej.nombre}</label>`;
    html += `<select id="${id}" data-ejercicio="${ej.id}" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--accent); background:var(--panel); color:var(--text); font-size:13px;">`;
    html += `<option value="">-- Selecciona --</option>`;
    html += `<option value="5">Me sobró (5)</option>`;
    html += `<option value="6">Me sobró (6)</option>`;
    html += `<option value="7">Cumplí (7)</option>`;
    html += `<option value="8">Me costó (8)</option>`;
    html += `<option value="9">Me costó (9)</option>`;
    html += `</select>`;
    html += `</div>`;
  });

  html += `<button class="primary" id="guardar-rpe" style="width:100%; padding:12px; font-size:14px;">Guardar RPE de esta sesión</button>`;
  html += '</div>';

  return html;
}

// ===== MANEJAR GUARDADO DE RPE =====
function manejarGuardadoRPE() {
  const boton = document.getElementById('guardar-rpe');
  
  if (!boton) return;

  boton.addEventListener('click', () => {
    const selects = document.querySelectorAll('[data-ejercicio]');
    const ejerciciosRPE = [];
    let todoCompleto = true;

    selects.forEach(select => {
      const rpeValue = select.value;
      
      if (!rpeValue) {
        todoCompleto = false;
        select.style.borderColor = 'var(--error)';
        return;
      }

      const ejercicioID = select.getAttribute('data-ejercicio');
      const ejercicioLabel = select.parentElement.querySelector('label').textContent;

      ejerciciosRPE.push({
        id: ejercicioID,
        nombre: ejercicioLabel,
        rpe: parseInt(rpeValue)
      });
    });

    if (!todoCompleto) {
      alert('⚠️ Por favor selecciona RPE para todos los ejercicios');
      return;
    }

    registrarSesionRPE(ejerciciosRPE);
    alert('✅ Sesión registrada exitosamente');
    boton.disabled = true;
    boton.textContent = 'Guardado ✓';
  });
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
  cargarTrackingRPE();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cargarTrackingRPE();
  });
} else {
  cargarTrackingRPE();
}

console.log('✅ tracking-rpe.js cargado');
console.log('Funciones disponibles:');
console.log('  - registrarSesionRPE(ejercicios)');
console.log('  - obtenerHistorialEjercicio(idEjercicio)');
console.log('  - calcularRPEPromedioSemana()');
console.log('  - renderFormularioRPE(ejercicios)');
