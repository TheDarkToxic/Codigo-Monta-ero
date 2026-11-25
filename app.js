// Plantilla de inicio: datos.js ya define proveedores e indicadores.
console.log("Proveedores cargados:", proveedores.length);
console.log("Indicadores cargados:", indicadores.length);

const monthSelect = document.getElementById("month");
const providersContainer = document.getElementById("proveedores");

// TODO 1: filtrar los indicadores por mes.
//   - Llena el <select id="month"> con los periodos distintos (campo "periodo").
//   - Al cambiar el mes, deja solo los indicadores de ese periodo.

// Nombres de los meses en español. La posición 0 es enero, la 1 es febrero, etc.
const NOMBRES_MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// Convierte un periodo como "2026-10" en texto: "octubre de 2026".
function mesEnLetras(periodo) {
  const partes = periodo.split("-");      // "2026-10" -> ["2026", "10"]
  const anio = partes[0];
  const numeroMes = Number(partes[1]);    // "10" -> 10
  return NOMBRES_MESES[numeroMes - 1] + " de " + anio;
}

// Aquí guardamos los indicadores del mes elegido (los usarán los TODO 2 y 3).
let indicadoresDelMes = [];

// 1) Juntar los periodos sin repetir.
const periodos = [];
for (const indicador of indicadores) {
  if (!periodos.includes(indicador.periodo)) {
    periodos.push(indicador.periodo);
  }
}

// 2) Ordenarlos del más reciente al más antiguo.
//    Como tienen la forma "AAAA-MM", ordenarlos como texto funciona bien.
periodos.sort();
periodos.reverse();

// 3) Crear una opción en la lista por cada periodo.
//    El valor interno es "2026-10" y lo que ve la persona es "octubre de 2026".
for (const periodo of periodos) {
  const opcion = document.createElement("option");
  opcion.value = periodo;
  opcion.textContent = mesEnLetras(periodo);
  monthSelect.appendChild(opcion);
}

// 4) Dejar solo los indicadores del mes que está elegido en la lista.
function elegirMes() {
  const periodoElegido = monthSelect.value;
  indicadoresDelMes = indicadores.filter(function (indicador) {
    return indicador.periodo === periodoElegido;
  });
  // Mensaje de comprobación en la consola (F12). Se puede quitar más adelante.
  console.log("Mes elegido:", mesEnLetras(periodoElegido), "- registros:", indicadoresDelMes.length);
}

// 5) Cada vez que la persona cambie el mes, volver a filtrar.
monthSelect.addEventListener("change", elegirMes);

// 6) Filtrar también al abrir la página (queda elegido el mes más reciente).
elegirMes();

// TODO 2: recorrer y pintar una tarjeta por proveedor.
//   - Une cada indicador con su proveedor por id_proveedor.
//   - Crea una tarjeta en #proveedores con el nombre y los indicadores.

// TODO 3: armar el mensaje y avisar si falta el correo.
//   - Escribe el texto del correo con los valores del proveedor.
//   - Si el correo está vacío o no es válido, muestra un aviso en esa tarjeta.
