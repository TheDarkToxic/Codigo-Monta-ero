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
  // Volver a dibujar las tarjetas con el mes nuevo (ver TODO 2).
  dibujarTarjetas();
}

// 5) Cada vez que la persona cambie el mes, volver a filtrar.
monthSelect.addEventListener("change", elegirMes);

// 6) Filtrar también al abrir la página (queda elegido el mes más reciente).
elegirMes();

// TODO 2: recorrer y pintar una tarjeta por proveedor.
//   - Une cada indicador con su proveedor por id_proveedor.
//   - Crea una tarjeta en #proveedores con el nombre y los indicadores.

// Revisa si un dato falta (vacío, nulo o que no es un número).
function faltaDato(valor) {
  return valor === null || valor === undefined || valor === "" || isNaN(Number(valor));
}

// Muestra un número con 1 decimal y coma: 86 -> "86,0". Si falta, "sin dato".
function conUnDecimal(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return Number(valor).toFixed(1).replace(".", ",");
}

// Igual que la anterior, pero agrega el símbolo de porcentaje: "80,0 %".
function conPorcentaje(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return conUnDecimal(valor) + " %";
}

// La meta se muestra sin decimales: 90 -> "90".
function sinDecimales(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return Number(valor).toFixed(0);
}

// Busca en la lista "proveedores" el que tiene ese código (P001, P002...).
// Si no lo encuentra, devuelve undefined (vacío).
function buscarProveedor(idProveedor) {
  return proveedores.find(function (proveedor) {
    return proveedor.id_proveedor === idProveedor;
  });
}

// Agrega a la tarjeta una línea del tipo "Etiqueta: valor".
function agregarLinea(tarjeta, etiqueta, valor) {
  const linea = document.createElement("p");
  linea.textContent = etiqueta + ": " + valor;
  tarjeta.appendChild(linea);
}

// Borra las tarjetas anteriores y crea una por cada indicador del mes elegido.
function dibujarTarjetas() {
  providersContainer.innerHTML = "";  // limpiar lo que había

  for (const indicador of indicadoresDelMes) {
    // Unir el indicador con su proveedor usando el código.
    const proveedor = buscarProveedor(indicador.id_proveedor);

    // El nombre y el correo salen de "proveedores" (acuerdo en CLAUDE.md).
    // Si no encontramos al proveedor, usamos el nombre que trae el indicador.
    const nombre = proveedor ? proveedor.nombre : indicador.nombre_proveedor;
    const correo = proveedor && proveedor.correo ? proveedor.correo : "sin dato";

    // Crear la tarjeta. Los estilos "card", "ok" y "fail" ya están en estilos.css.
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("card");
    if (indicador.calificacion === "Cumple") {
      tarjeta.classList.add("ok");      // franja verde
    } else if (indicador.calificacion === "No cumple") {
      tarjeta.classList.add("fail");    // franja de color de "No cumple"
    }

    // Título de la tarjeta: el nombre del proveedor.
    const titulo = document.createElement("h2");
    titulo.textContent = nombre;
    tarjeta.appendChild(titulo);

    // Una línea por cada dato.
    agregarLinea(tarjeta, "Código", indicador.id_proveedor);
    agregarLinea(tarjeta, "Correo", correo);
    agregarLinea(tarjeta, "OTIF", conPorcentaje(indicador.pct_otif));
    agregarLinea(tarjeta, "Nivel de inventario", conPorcentaje(indicador.pct_nivel_inventario));
    agregarLinea(tarjeta, "NS integral", conUnDecimal(indicador.pct_ns_integral));
    agregarLinea(tarjeta, "Meta", sinDecimales(indicador.meta));
    agregarLinea(tarjeta, "Calificación", indicador.calificacion || "sin dato");

    // Avisos (ver TODO 3). Una tarjeta puede tener varios avisos.
    const avisoCorreo = revisarCorreo(proveedor ? proveedor.correo : "");
    if (avisoCorreo !== "") {
      agregarAviso(tarjeta, avisoCorreo);
      tarjeta.classList.add("warning");  // resaltar la tarjeta con problema de correo
    }
    if (faltanDatos(indicador)) {
      agregarAviso(tarjeta, "Faltan datos");
    }

    // Mensaje completo (ver TODO 3), un párrafo por parte.
    const subtitulo = document.createElement("h3");
    subtitulo.textContent = "Mensaje";
    tarjeta.appendChild(subtitulo);
    for (const parrafo of armarMensaje(indicador, proveedor, nombre)) {
      const p = document.createElement("p");
      p.textContent = parrafo;
      tarjeta.appendChild(p);
    }

    // Poner la tarjeta en la página.
    providersContainer.appendChild(tarjeta);
  }
}

// TODO 3: armar el mensaje y avisar si falta el correo.
//   - Escribe el texto del correo con los valores del proveedor.
//   - Si el correo está vacío o no es válido, muestra un aviso en esa tarjeta.
//
// Ojo: aquí solo hay funciones (function ...), no variables sueltas.
// Así se pueden usar desde dibujarTarjetas(), que se ejecuta antes de llegar a esta parte.

// Revisa el correo según la regla de CLAUDE.md.
// Devuelve el texto del aviso, o "" (texto vacío) si el correo es válido.
function revisarCorreo(correo) {
  // Sin correo: vacío, nulo o solo espacios.
  if (!correo || correo.trim() === "") {
    return "Sin correo registrado";
  }
  // No tiene @.
  if (!correo.includes("@")) {
    return "Correo no válido (le falta @)";
  }
  // Partir el correo por la @: "nombre@empresa.example" -> ["nombre", "empresa.example"]
  const partes = correo.split("@");
  const unaSolaArroba = partes.length === 2;
  const algoAntes = partes[0] !== "";
  const puntoDespues = unaSolaArroba && partes[1].includes(".");
  if (unaSolaArroba && algoAntes && puntoDespues) {
    return "";  // correo válido: no hay aviso
  }
  return "Correo no válido";
}

// Revisa si al indicador le falta alguno de los datos que usa el mensaje.
// Devuelve true (sí faltan) o false (está completo).
function faltanDatos(indicador) {
  const camposNumericos = ["lineas", "lineas_otif", "pct_otif", "pct_nivel_inventario", "pct_ns_integral", "meta"];
  for (const campo of camposNumericos) {
    if (faltaDato(indicador[campo])) {
      return true;
    }
  }
  // La calificación es texto, por eso se revisa aparte.
  if (!indicador.calificacion) {
    return true;
  }
  return false;
}

// Muestra un número entero (como las líneas) o "sin dato" si falta.
function entero(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return String(valor);
}

// Arma el mensaje completo para un proveedor, con el texto de CLAUDE.md.
// Devuelve una lista de párrafos: [cuerpo, final, cierre].
function armarMensaje(indicador, proveedor, nombre) {
  // Saludo: con el contacto, o "equipo de ..." si no hay contacto.
  let saludo;
  if (proveedor && proveedor.contacto) {
    saludo = "Hola, " + proveedor.contacto + ".";
  } else {
    saludo = "Hola, equipo de " + nombre + ".";
  }

  // Cuerpo del mensaje con los valores del mes.
  const cuerpo = saludo +
    " Compartimos los indicadores de nivel de servicio de " + nombre +
    " para " + mesEnLetras(indicador.periodo) + ":" +
    " de " + entero(indicador.lineas) + " líneas, " +
    entero(indicador.lineas_otif) + " llegaron a tiempo y completas" +
    " (OTIF " + conPorcentaje(indicador.pct_otif) + ")." +
    " Nivel de inventario: " + conPorcentaje(indicador.pct_nivel_inventario) + "." +
    " NS integral: " + conUnDecimal(indicador.pct_ns_integral) +
    " frente a una meta de " + sinDecimales(indicador.meta) + "." +
    " Calificación del mes: " + (indicador.calificacion || "sin dato") + ".";

  // Final según la calificación.
  let final = "";
  if (indicador.calificacion === "Cumple") {
    final = "Gracias por mantener este nivel de servicio.";
  } else if (indicador.calificacion === "No cumple") {
    final = "Le pedimos enviarnos un plan de acción para mejorar estos resultados.";
  }
  // Si no hay calificación, no ponemos final (la tarjeta ya dirá «Faltan datos»).

  const cierre = "Cordialmente, Abastecimiento y Compras – Industrias Haceb.";

  // Devolver solo los párrafos que tienen texto.
  return [cuerpo, final, cierre].filter(function (parrafo) {
    return parrafo !== "";
  });
}

// Agrega un aviso a la tarjeta, con el estilo "warning-text" de estilos.css.
function agregarAviso(tarjeta, texto) {
  const aviso = document.createElement("p");
  aviso.classList.add("warning-text");
  aviso.textContent = "⚠ " + texto;
  tarjeta.appendChild(aviso);
}
