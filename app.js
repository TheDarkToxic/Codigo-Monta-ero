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
  // Actualizar las 4 cifras del resumen (ver final del archivo).
  dibujarResumen();
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
    const correo = proveedor && proveedor.correo ? proveedor.correo : "(vacío)";

    // Si no pasa el filtro o la búsqueda (Ronda 4), saltar a la siguiente tarjeta.
    if (!pasaFiltros(indicador, proveedor, nombre)) {
      continue;
    }

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

    // Etiqueta de color con la calificación: verde «Cumple» o roja «No cumple».
    if (indicador.calificacion === "Cumple" || indicador.calificacion === "No cumple") {
      const etiqueta = document.createElement("span");
      etiqueta.classList.add("etiqueta");
      etiqueta.classList.add(indicador.calificacion === "Cumple" ? "cumple" : "no-cumple");
      etiqueta.textContent = indicador.calificacion;
      tarjeta.appendChild(etiqueta);
    }

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

    // Botones de la tarjeta (Ronda 5): copiar el mensaje y abrir un borrador de correo.
    const acciones = document.createElement("div");
    acciones.classList.add("acciones");

    const botonCopiar = document.createElement("button");
    botonCopiar.type = "button";
    botonCopiar.classList.add("accion");
    botonCopiar.textContent = "Copiar mensaje";
    botonCopiar.addEventListener("click", function () {
      copiarMensaje(textoDelMensaje(indicador, proveedor, nombre), botonCopiar);
    });
    acciones.appendChild(botonCopiar);

    const botonCorreo = document.createElement("button");
    botonCorreo.type = "button";
    botonCorreo.classList.add("accion");
    botonCorreo.textContent = "Abrir en mi correo";
    if (avisoCorreo !== "") {
      // Correo vacío o no válido: el botón no se puede usar.
      botonCorreo.disabled = true;
      botonCorreo.title = "No se puede: " + avisoCorreo;
    } else {
      botonCorreo.addEventListener("click", function () {
        abrirBorrador(proveedor.correo, indicador, textoDelMensaje(indicador, proveedor, nombre));
      });
    }
    acciones.appendChild(botonCorreo);

    tarjeta.appendChild(acciones);

    // Poner la tarjeta en la página.
    providersContainer.appendChild(tarjeta);
  }

  // Si ninguna tarjeta pasó el filtro o la búsqueda, avisar (Ronda 4).
  if (providersContainer.children.length === 0) {
    const vacio = document.createElement("p");
    vacio.classList.add("sin-resultados");
    vacio.textContent = "No hay proveedores que coincidan.";
    providersContainer.appendChild(vacio);
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

// RESUMEN DEL MES (Ronda 3)
// Cuenta y muestra 4 cifras del mes elegido: mensajes generados, cuántos cumplen,
// cuántos no cumplen y cuántos tienen aviso de correo.
function dibujarResumen() {
  let cumplen = 0;
  let noCumplen = 0;
  let conAvisoCorreo = 0;

  for (const indicador of indicadoresDelMes) {
    if (indicador.calificacion === "Cumple") {
      cumplen = cumplen + 1;
    } else if (indicador.calificacion === "No cumple") {
      noCumplen = noCumplen + 1;
    }
    // Usamos la misma revisión de correo que las tarjetas, para que siempre coincidan.
    const proveedor = buscarProveedor(indicador.id_proveedor);
    if (revisarCorreo(proveedor ? proveedor.correo : "") !== "") {
      conAvisoCorreo = conAvisoCorreo + 1;
    }
  }

  // Se genera un mensaje por cada indicador del mes.
  const cifras = [
    { numero: indicadoresDelMes.length, texto: "Mensajes generados", estilo: "total" },
    { numero: cumplen, texto: "Cumplen", estilo: "cumple" },
    { numero: noCumplen, texto: "No cumplen", estilo: "no-cumple" },
    { numero: conAvisoCorreo, texto: "Con aviso de correo", estilo: "aviso" }
  ];

  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "";  // limpiar el resumen anterior

  for (const cifra of cifras) {
    const caja = document.createElement("div");
    caja.classList.add("cifra");
    caja.classList.add(cifra.estilo);

    const numero = document.createElement("strong");
    numero.textContent = cifra.numero;
    const texto = document.createElement("span");
    texto.textContent = cifra.texto;

    caja.appendChild(numero);
    caja.appendChild(texto);
    resumen.appendChild(caja);
  }
}

// FILTROS Y BUSCADOR (Ronda 4)
// Solo cambian qué tarjetas se ven. El resumen sigue contando todo el mes.

// Decide si una tarjeta se muestra, según el botón activo y el texto del buscador.
// Lee el estado directamente de la página, así no depende de variables sueltas.
function pasaFiltros(indicador, proveedor, nombre) {
  // 1) Filtro por botón.
  const botonActivo = document.querySelector(".filtro.activo");
  const filtro = botonActivo ? botonActivo.dataset.filtro : "todos";

  if (filtro === "no-cumple" && indicador.calificacion !== "No cumple") {
    return false;
  }
  if (filtro === "aviso-correo" && revisarCorreo(proveedor ? proveedor.correo : "") === "") {
    return false;
  }

  // 2) Buscador: nombre o código, sin importar mayúsculas o minúsculas.
  const buscador = document.getElementById("buscador");
  const busqueda = buscador ? buscador.value.trim().toLowerCase() : "";
  if (busqueda === "") {
    return true;  // buscador vacío: no filtra nada
  }
  const enNombre = nombre.toLowerCase().includes(busqueda);
  const enCodigo = indicador.id_proveedor.toLowerCase().includes(busqueda);
  return enNombre || enCodigo;
}

// Al hacer clic en un botón de filtro: marcarlo como activo y volver a dibujar.
const botonesFiltro = document.querySelectorAll(".filtro");
for (const boton of botonesFiltro) {
  boton.addEventListener("click", function () {
    for (const otro of botonesFiltro) {
      otro.classList.remove("activo");
      otro.setAttribute("aria-pressed", "false");  // ayuda a lectores de pantalla
    }
    boton.classList.add("activo");
    boton.setAttribute("aria-pressed", "true");
    dibujarTarjetas();
  });
}

// Cada vez que se escribe o se borra en el buscador, volver a dibujar.
document.getElementById("buscador").addEventListener("input", dibujarTarjetas);

// COPIAR, BORRADOR DE CORREO Y DESCARGA CSV (Ronda 5)

// El mensaje completo como un solo texto: los párrafos separados por una línea en blanco.
function textoDelMensaje(indicador, proveedor, nombre) {
  return armarMensaje(indicador, proveedor, nombre).join("\n\n");
}

// Copia el texto al portapapeles y muestra «¡Copiado!» en el botón por 2 segundos.
function copiarMensaje(texto, boton) {
  function avisarCopiado() {
    boton.textContent = "¡Copiado!";
    setTimeout(function () {
      boton.textContent = "Copiar mensaje";
    }, 2000);
  }

  // Forma moderna de copiar. Si el navegador no la permite, usamos la forma antigua.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(avisarCopiado, function () {
      copiarFormaAntigua(texto);
      avisarCopiado();
    });
  } else {
    copiarFormaAntigua(texto);
    avisarCopiado();
  }
}

// Forma antigua de copiar: pone el texto en una caja invisible, lo selecciona y lo copia.
function copiarFormaAntigua(texto) {
  const caja = document.createElement("textarea");
  caja.value = texto;
  caja.style.position = "fixed";
  caja.style.opacity = "0";
  document.body.appendChild(caja);
  caja.select();
  document.execCommand("copy");
  document.body.removeChild(caja);
}

// Abre un BORRADOR en el programa de correo de la persona (enlace "mailto:").
// No envía nada: la persona revisa el borrador y decide si lo envía.
function abrirBorrador(correo, indicador, mensaje) {
  const asunto = "Indicadores de nivel de servicio – " + mesEnLetras(indicador.periodo);
  // encodeURIComponent convierte tildes, espacios y saltos de línea a un formato válido para el enlace.
  const enlace = "mailto:" + correo +
    "?subject=" + encodeURIComponent(asunto) +
    "&body=" + encodeURIComponent(mensaje);
  window.location.href = enlace;
}

// Lista de avisos de un proveedor (los mismos que muestra su tarjeta).
function listaDeAvisos(indicador, proveedor) {
  const avisos = [];
  const avisoCorreo = revisarCorreo(proveedor ? proveedor.correo : "");
  if (avisoCorreo !== "") {
    avisos.push(avisoCorreo);
  }
  if (faltanDatos(indicador)) {
    avisos.push("Faltan datos");
  }
  return avisos;
}

// Prepara un valor para el CSV: lo encierra entre comillas y duplica las comillas internas.
// Así el punto y coma o los saltos de línea dentro del mensaje no dañan las columnas.
function celdaCSV(valor) {
  const texto = String(valor === null || valor === undefined ? "" : valor);
  return '"' + texto.replace(/"/g, '""') + '"';
}

// Arma el texto CSV con TODOS los proveedores del mes elegido (sin importar filtros).
function armarCSV() {
  const filas = [];
  filas.push(["Código", "Proveedor", "Correo", "Calificación", "Aviso", "Mensaje"].map(celdaCSV).join(";"));

  for (const indicador of indicadoresDelMes) {
    const proveedor = buscarProveedor(indicador.id_proveedor);
    const nombre = proveedor ? proveedor.nombre : indicador.nombre_proveedor;
    const fila = [
      indicador.id_proveedor,
      nombre,
      proveedor && proveedor.correo ? proveedor.correo : "(vacío)",
      indicador.calificacion || "sin dato",
      listaDeAvisos(indicador, proveedor).join(" / "),
      textoDelMensaje(indicador, proveedor, nombre)
    ];
    filas.push(fila.map(celdaCSV).join(";"));
  }

  // "\r\n" es el salto de línea que espera Excel en Windows.
  return filas.join("\r\n");
}

// Crea el archivo y lo descarga. No usa internet: el archivo se arma aquí mismo.
function descargarCSV() {
  // "\uFEFF" (BOM) al inicio le dice a Excel que el archivo usa UTF-8, así las tildes se ven bien.
  const contenido = "\uFEFF" + armarCSV();
  const archivo = new Blob([contenido], { type: "text/csv;charset=utf-8" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = "mensajes_proveedores_" + monthSelect.value + ".csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(enlace.href);
}

document.getElementById("descargar-csv").addEventListener("click", descargarCSV);
