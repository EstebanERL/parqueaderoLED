/**
 * Calcula el valor a pagar según la tarifa y el tiempo de permanencia.
 * @param {Date} entrada
 * @param {Date} salida
 * @param {{unidad:'minuto'|'hora'|'dia'|'fraccion', valor:number, valor_fraccion_minutos:number}} tarifa
 * @returns {{ minutos:number, total:number }}
 */
function calcularCobro(entrada, salida, tarifa) {
  const ms = salida.getTime() - entrada.getTime();
  const minutos = Math.max(1, Math.ceil(ms / 60000)); // mínimo 1 min
  let total = 0;

  switch (tarifa.unidad) {
    case 'minuto':
      total = minutos * Number(tarifa.valor);
      break;
    case 'hora': {
      const horas = Math.ceil(minutos / 60);
      total = horas * Number(tarifa.valor);
      break;
    }
    case 'dia': {
      const dias = Math.ceil(minutos / (60 * 24));
      total = dias * Number(tarifa.valor);
      break;
    }
    case 'fraccion': {
      const bloque = tarifa.valor_fraccion_minutos || 15;
      const fracciones = Math.ceil(minutos / bloque);
      total = fracciones * Number(tarifa.valor);
      break;
    }
    default:
      total = minutos * Number(tarifa.valor);
  }
  return { minutos, total: Math.round(total * 100) / 100 };
}

function generarCodigoTicket() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TK-${ts}-${rnd}`;
}

module.exports = { calcularCobro, generarCodigoTicket };
