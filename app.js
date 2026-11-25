// =====================================================================
// ProveeMensajes Haceb – lógica de la página
// Los datos (proveedores e indicadores) vienen de datos.js, que se carga antes.
// El archivo está dividido en 12 partes. Las partes 1 a 11 solo preparan
// funciones; la parte 12 (al final) es la que arranca la página.
// =====================================================================


// ---------------------------------------------------------------------
// PARTE 1. Revisar que los datos cargaron y ubicar los elementos de la página
// ---------------------------------------------------------------------

// Comprueba que datos.js se cargó y que trae las listas que necesitamos.
// "typeof ... !== 'undefined'" evita un error si la lista ni siquiera existe.
const datosListos =
  typeof proveedores !== "undefined" && Array.isArray(proveedores) &&
  typeof indicadores !== "undefined" && Array.isArray(indicadores);

// Elementos de la página que usamos varias veces.
const monthSelect = document.getElementById("month");
const contenedorTarjetas = document.getElementById("tarjetas");
const contenedorResumen = document.getElementById("resumen");
const buscador = document.getElementById("buscador");
const botonesFiltro = document.querySelectorAll(".filtro");
const botonCSV = document.getElementById("descargar-csv");

// Aquí guardamos los indicadores del mes elegido (se llena en la Parte 6).
let indicadoresDelMes = [];


// ---------------------------------------------------------------------
// PARTE 2. Formatos: textos, números y meses
// ---------------------------------------------------------------------

// Nombres de los meses en español. La posición 0 es enero, la 1 es febrero, etc.
const NOMBRES_MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// Convierte cualquier valor en texto sin espacios al inicio ni al final.
// Si el valor no existe (null o undefined), devuelve "" (texto vacío).
function textoLimpio(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }
  return String(valor).trim();
}

// Convierte un periodo como "2026-10" en texto: "octubre de 2026".
// Si el periodo viene mal escrito, lo muestra tal cual (o "sin dato" si está vacío).
function mesEnLetras(periodo) {
  const texto = textoLimpio(periodo);
  const partes = texto.split("-");          // "2026-10" -> ["2026", "10"]
  const anio = partes[0];
  const numeroMes = Number(partes[1]);      // "10" -> 10
  const esValido = partes.length === 2 && anio !== "" &&
    Number.isInteger(numeroMes) && numeroMes >= 1 && numeroMes <= 12;
  if (!esValido) {
    return texto || "sin dato";
  }
  return NOMBRES_MESES[numeroMes - 1] + " de " + anio;
}

// Revisa si un dato numérico falta: vacío, nulo, solo espacios o que no es un número.
function faltaDato(valor) {
  if (textoLimpio(valor) === "") {
    return true;
  }
  return isNaN(Number(valor));
}

// Número entero (como las líneas): 10 -> "10". Si falta, "sin dato".
function entero(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return String(Number(valor));
}

// Número con 1 decimal y coma: 86 -> "86,0". Si falta, "sin dato".
function conUnDecimal(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return Number(valor).toFixed(1).replace(".", ",");
}

// Porcentaje con 1 decimal: 80 -> "80,0 %". Si falta, "sin dato".
function conPorcentaje(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return conUnDecimal(valor) + " %";
}

// Número sin decimales (la meta): 90 -> "90". Si falta, "sin dato".
function sinDecimales(valor) {
  if (faltaDato(valor)) {
    return "sin dato";
  }
  return Number(valor).toFixed(0);
}


// ---------------------------------------------------------------------
// PARTE 3. Proveedor y correo
// ---------------------------------------------------------------------

// Busca en la lista "proveedores" el que tiene ese código (P001, P002...).
// Si no lo encuentra, devuelve undefined (vacío).
function buscarProveedor(idProveedor) {
  return proveedores.find(function (proveedor) {
    return proveedor.id_proveedor === idProveedor;
  });
}

// Revisa el correo según la regla de CLAUDE.md.
// Devuelve el texto del aviso, o "" (texto vacío) si el correo es válido.
function revisarCorreo(correo) {
  const texto = textoLimpio(correo);
  // Sin correo: vacío o solo espacios.
  if (texto === "") {
    return "Sin correo registrado";
  }
  // No tiene @.
  if (!texto.includes("@")) {
    return "Correo no válido (le falta @)";
  }
  // Partir el correo por la @: "nombre@empresa.example" -> ["nombre", "empresa.example"]
  const partes = texto.split("@");
  const unaSolaArroba = partes.length === 2;
  const algoAntes = partes[0] !== "";
  const puntoDespues = unaSolaArroba && partes[1].includes(".");
  if (unaSolaArroba && algoAntes && puntoDespues) {
    return "";  // correo válido: no hay aviso
  }
  return "Correo no válido";
}

// Reúne en un solo lugar los datos del proveedor de un indicador.
// Así las tarjetas, el resumen, los filtros y el CSV usan siempre lo mismo.
function datosDelProveedor(indicador) {
  const proveedor = buscarProveedor(indicador.id_proveedor);
  const correo = textoLimpio(proveedor ? proveedor.correo : "");
  // El nombre sale de "proveedores" (acuerdo en CLAUDE.md).
  // Si no está, usamos el que trae el indicador; si tampoco, "sin dato".
  const nombre = textoLimpio(proveedor ? proveedor.nombre : "") ||
    textoLimpio(indicador.nombre_proveedor) || "sin dato";
  return {
    codigo: textoLimpio(indicador.id_proveedor) || "sin dato",
    nombre: nombre,
    contacto: textoLimpio(proveedor ? proveedor.contacto : ""),
    correo: correo,                       // "" si no tiene
    avisoCorreo: revisarCorreo(correo)    // "" si el correo es válido
  };
}


// ---------------------------------------------------------------------
// PARTE 4. Avisos de la tarjeta
// ---------------------------------------------------------------------

// La calificación solo puede ser «Cumple» o «No cumple» (CLAUDE.md).
function esCalificacionValida(calificacion) {
  return calificacion === "Cumple" || calificacion === "No cumple";
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
  return !esCalificacionValida(indicador.calificacion);
}

// Lista de avisos de un proveedor. Una tarjeta puede tener varios.
function listaDeAvisos(indicador, datos) {
  const avisos = [];
  if (datos.avisoCorreo !== "") {
    avisos.push(datos.avisoCorreo);
  }
  // También faltan datos si no sabemos el código o el nombre del proveedor.
  if (faltanDatos(indicador) || datos.codigo === "sin dato" || datos.nombre === "sin dato") {
    avisos.push("Faltan datos");
  }
  return avisos;
}


// ---------------------------------------------------------------------
// PARTE 5. El mensaje (texto de CLAUDE.md)
// ---------------------------------------------------------------------

// Arma el mensaje completo para un proveedor.
// Devuelve una lista de párrafos: [cuerpo, final, cierre].
function armarMensaje(indicador, datos) {
  // Saludo: con el contacto, o "equipo de ..." si no hay contacto.
  let saludo;
  if (datos.contacto !== "") {
    saludo = "Hola, " + datos.contacto + ".";
  } else {
    saludo = "Hola, equipo de " + datos.nombre + ".";
  }

  // Cuerpo del mensaje con los valores del mes.
  const cuerpo = saludo +
    " Compartimos los indicadores de nivel de servicio de " + datos.nombre +
    " para " + mesEnLetras(indicador.periodo) + ":" +
    " de " + entero(indicador.lineas) + " líneas, " +
    entero(indicador.lineas_otif) + " llegaron a tiempo y completas" +
    " (OTIF " + conPorcentaje(indicador.pct_otif) + ")." +
    " Nivel de inventario: " + conPorcentaje(indicador.pct_nivel_inventario) + "." +
    " NS integral: " + conUnDecimal(indicador.pct_ns_integral) +
    " frente a una meta de " + sinDecimales(indicador.meta) + "." +
    " Calificación del mes: " + (textoLimpio(indicador.calificacion) || "sin dato") + ".";

  // Final según la calificación.
  // Si no hay calificación válida, no ponemos final (la tarjeta dirá «Faltan datos»).
  let final = "";
  if (indicador.calificacion === "Cumple") {
    final = "Gracias por mantener este nivel de servicio.";
  } else if (indicador.calificacion === "No cumple") {
    final = "Le pedimos enviarnos un plan de acción para mejorar estos resultados.";
  }

  const cierre = "Cordialmente, Abastecimiento y Compras – Industrias Haceb.";

  // Devolver solo los párrafos que tienen texto.
  return [cuerpo, final, cierre].filter(function (parrafo) {
    return parrafo !== "";
  });
}

// El mensaje como un solo texto: los párrafos separados por una línea en blanco.
// Lo usan el botón «Copiar mensaje», el borrador de correo y el CSV.
function textoDelMensaje(indicador, datos) {
  return armarMensaje(indicador, datos).join("\n\n");
}


// ---------------------------------------------------------------------
// PARTE 6. Elegir el mes (TODO 1)
// ---------------------------------------------------------------------

// Llena la lista de meses, del más reciente al más antiguo.
// Devuelve cuántos meses encontró.
function llenarMeses() {
  // Juntar los periodos sin repetir (y sin vacíos).
  const periodos = [];
  for (const indicador of indicadores) {
    const periodo = textoLimpio(indicador.periodo);
    if (periodo !== "" && !periodos.includes(periodo)) {
      periodos.push(periodo);
    }
  }

  // Como tienen la forma "AAAA-MM", ordenarlos como texto funciona bien.
  periodos.sort();
  periodos.reverse();

  // Una opción por periodo: el valor interno es "2026-10" y se ve "octubre de 2026".
  for (const periodo of periodos) {
    const opcion = document.createElement("option");
    opcion.value = periodo;
    opcion.textContent = mesEnLetras(periodo);
    monthSelect.appendChild(opcion);
  }
  return periodos.length;
}

// Deja solo los indicadores del mes elegido y vuelve a dibujar todo.
function elegirMes() {
  const periodoElegido = monthSelect.value;
  indicadoresDelMes = indicadores.filter(function (indicador) {
    return textoLimpio(indicador.periodo) === periodoElegido;
  });
  dibujarResumen();
  dibujarTarjetas();
}


// ---------------------------------------------------------------------
// PARTE 7. Filtros y buscador (Ronda 4)
// Solo cambian qué tarjetas se ven. El resumen sigue contando todo el mes.
// ---------------------------------------------------------------------

// Decide si una tarjeta se muestra, según el botón activo y el texto del buscador.
function pasaFiltros(indicador, datos) {
  // 1) Filtro por botón.
  const botonActivo = document.querySelector(".filtro.activo");
  const filtro = botonActivo ? botonActivo.dataset.filtro : "todos";

  if (filtro === "no-cumple" && indicador.calificacion !== "No cumple") {
    return false;
  }
  if (filtro === "aviso-correo" && datos.avisoCorreo === "") {
    return false;
  }

  // 2) Buscador: nombre o código, sin importar mayúsculas o minúsculas.
  const busqueda = buscador.value.trim().toLowerCase();
  if (busqueda === "") {
    return true;  // buscador vacío: no filtra nada
  }
  const enNombre = datos.nombre.toLowerCase().includes(busqueda);
  const enCodigo = datos.codigo.toLowerCase().includes(busqueda);
  return enNombre || enCodigo;
}

// Al hacer clic en un botón de filtro: marcarlo como activo y volver a dibujar.
function activarFiltro(boton) {
  for (const otro of botonesFiltro) {
    otro.classList.remove("activo");
    otro.setAttribute("aria-pressed", "false");  // ayuda a lectores de pantalla
  }
  boton.classList.add("activo");
  boton.setAttribute("aria-pressed", "true");
  dibujarTarjetas();
}


// ---------------------------------------------------------------------
// PARTE 8. Dibujar las tarjetas (TODO 2 y TODO 3)
// ---------------------------------------------------------------------

// Agrega a la tarjeta una línea del tipo "Etiqueta: valor".
function agregarLinea(tarjeta, etiqueta, valor) {
  const linea = document.createElement("p");
  linea.textContent = etiqueta + ": " + valor;
  tarjeta.appendChild(linea);
}

// Agrega un aviso a la tarjeta, con el estilo "warning-text" de estilos.css.
function agregarAviso(tarjeta, texto) {
  const aviso = document.createElement("p");
  aviso.classList.add("warning-text");
  aviso.textContent = "⚠ " + texto;
  tarjeta.appendChild(aviso);
}

// Crea un botón de acción (los de abajo de cada tarjeta).
function crearBotonAccion(texto) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.classList.add("accion");
  boton.textContent = texto;
  return boton;
}

// Crea la tarjeta completa de un proveedor.
function crearTarjeta(indicador, datos) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("card");
  if (indicador.calificacion === "Cumple") {
    tarjeta.classList.add("ok");        // franja verde
  } else if (indicador.calificacion === "No cumple") {
    tarjeta.classList.add("fail");      // franja roja
  }
  if (datos.avisoCorreo !== "") {
    tarjeta.classList.add("warning");   // tarjeta resaltada en amarillo
  }

  // Título: el nombre del proveedor.
  const titulo = document.createElement("h2");
  titulo.textContent = datos.nombre;
  tarjeta.appendChild(titulo);

  // Etiqueta de color: verde «Cumple» o roja «No cumple».
  if (esCalificacionValida(indicador.calificacion)) {
    const etiqueta = document.createElement("span");
    etiqueta.classList.add("etiqueta");
    etiqueta.classList.add(indicador.calificacion === "Cumple" ? "cumple" : "no-cumple");
    etiqueta.textContent = indicador.calificacion;
    tarjeta.appendChild(etiqueta);
  }

  // Una línea por cada dato.
  agregarLinea(tarjeta, "Código", datos.codigo);
  agregarLinea(tarjeta, "Correo", datos.correo || "(vacío)");
  agregarLinea(tarjeta, "OTIF", conPorcentaje(indicador.pct_otif));
  agregarLinea(tarjeta, "Nivel de inventario", conPorcentaje(indicador.pct_nivel_inventario));
  agregarLinea(tarjeta, "NS integral", conUnDecimal(indicador.pct_ns_integral));
  agregarLinea(tarjeta, "Meta", sinDecimales(indicador.meta));
  agregarLinea(tarjeta, "Calificación", textoLimpio(indicador.calificacion) || "sin dato");

  // Avisos (de correo y de datos). Se muestran todos.
  for (const aviso of listaDeAvisos(indicador, datos)) {
    agregarAviso(tarjeta, aviso);
  }

  // Mensaje completo, un párrafo por parte.
  const subtitulo = document.createElement("h3");
  subtitulo.textContent = "Mensaje";
  tarjeta.appendChild(subtitulo);
  for (const parrafo of armarMensaje(indicador, datos)) {
    const p = document.createElement("p");
    p.textContent = parrafo;
    tarjeta.appendChild(p);
  }

  // Botones: copiar el mensaje y abrir un borrador de correo.
  const acciones = document.createElement("div");
  acciones.classList.add("acciones");

  const botonCopiar = crearBotonAccion("Copiar mensaje");
  botonCopiar.addEventListener("click", function () {
    copiarMensaje(textoDelMensaje(indicador, datos), botonCopiar);
  });
  acciones.appendChild(botonCopiar);

  const botonCorreo = crearBotonAccion("Abrir en mi correo");
  if (datos.avisoCorreo !== "") {
    // Correo vacío o no válido: el botón no se puede usar.
    botonCorreo.disabled = true;
    botonCorreo.title = "No se puede: " + datos.avisoCorreo;
  } else {
    botonCorreo.addEventListener("click", function () {
      abrirBorrador(datos.correo, indicador, textoDelMensaje(indicador, datos));
    });
  }
  acciones.appendChild(botonCorreo);

  tarjeta.appendChild(acciones);
  return tarjeta;
}

// Borra las tarjetas anteriores y crea una por cada indicador que pase los filtros.
function dibujarTarjetas() {
  contenedorTarjetas.innerHTML = "";  // limpiar lo que había

  for (const indicador of indicadoresDelMes) {
    const datos = datosDelProveedor(indicador);
    if (pasaFiltros(indicador, datos)) {
      contenedorTarjetas.appendChild(crearTarjeta(indicador, datos));
    }
  }

  // Si ninguna tarjeta pasó el filtro o la búsqueda, avisar.
  if (contenedorTarjetas.children.length === 0) {
    mostrarMensajeEnPagina("No hay proveedores que coincidan.", "sin-resultados");
  }
}

// Muestra un texto en el lugar de las tarjetas (sin resultados o error de carga).
function mostrarMensajeEnPagina(texto, estilo) {
  contenedorTarjetas.innerHTML = "";
  const p = document.createElement("p");
  p.classList.add(estilo);
  p.textContent = texto;
  contenedorTarjetas.appendChild(p);
}


// ---------------------------------------------------------------------
// PARTE 9. Resumen del mes (Ronda 3)
// Cuenta todo el mes, sin importar filtros ni buscador.
// ---------------------------------------------------------------------

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
    // La misma revisión de correo que las tarjetas, para que siempre coincidan.
    if (datosDelProveedor(indicador).avisoCorreo !== "") {
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

  contenedorResumen.innerHTML = "";  // limpiar el resumen anterior
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
    contenedorResumen.appendChild(caja);
  }
}


// ---------------------------------------------------------------------
// PARTE 10. Copiar el mensaje y abrir el borrador de correo (Ronda 5)
// ---------------------------------------------------------------------

// Copia el texto y muestra en el botón «¡Copiado!» (o «No se pudo copiar») por 2 segundos.
function copiarMensaje(texto, boton) {
  function mostrarResultado(textoBoton) {
    boton.textContent = textoBoton;
    // Si ya había un temporizador (clic repetido), lo cancelamos y empezamos de nuevo.
    clearTimeout(boton.temporizador);
    boton.temporizador = setTimeout(function () {
      boton.textContent = "Copiar mensaje";
    }, 2000);
  }

  function intentarFormaAntigua() {
    const funciono = copiarFormaAntigua(texto);
    mostrarResultado(funciono ? "¡Copiado!" : "No se pudo copiar");
  }

  // Forma moderna de copiar. Si el navegador no la permite, usamos la forma antigua.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function () {
      mostrarResultado("¡Copiado!");
    }, intentarFormaAntigua);
  } else {
    intentarFormaAntigua();
  }
}

// Forma antigua de copiar: pone el texto en una caja invisible, lo selecciona y lo copia.
// Devuelve true si funcionó y false si no.
function copiarFormaAntigua(texto) {
  const caja = document.createElement("textarea");
  caja.value = texto;
  caja.style.position = "fixed";
  caja.style.opacity = "0";
  document.body.appendChild(caja);
  caja.select();
  let funciono = false;
  try {
    funciono = document.execCommand("copy");
  } catch (error) {
    funciono = false;
  }
  document.body.removeChild(caja);
  return funciono;
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


// ---------------------------------------------------------------------
// PARTE 11. Descargar los mensajes del mes en CSV (Ronda 5)
// ---------------------------------------------------------------------

// Prepara un valor para el CSV: lo encierra entre comillas y duplica las comillas internas.
// Así un punto y coma dentro del texto no daña las columnas.
function celdaCSV(valor) {
  return '"' + textoLimpio(valor).replace(/"/g, '""') + '"';
}

// Arma el texto CSV con TODOS los proveedores del mes elegido (sin importar filtros).
function armarCSV() {
  const filas = [];
  filas.push(["Código", "Proveedor", "Correo", "Calificación", "Aviso", "Mensaje"].map(celdaCSV).join(";"));

  for (const indicador of indicadoresDelMes) {
    const datos = datosDelProveedor(indicador);
    const fila = [
      datos.codigo,
      datos.nombre,
      datos.correo || "(vacío)",
      textoLimpio(indicador.calificacion) || "sin dato",
      listaDeAvisos(indicador, datos).join(" / "),
      // En el CSV el mensaje va en una sola línea: cada salto de línea (o grupo de saltos)
      // se cambia por un espacio. Las tarjetas y el botón «Copiar mensaje» no cambian.
      textoDelMensaje(indicador, datos).replace(/\s*\n+\s*/g, " ")
    ];
    filas.push(fila.map(celdaCSV).join(";"));
  }

  // "\r\n" es el salto de línea que espera Excel en Windows.
  return filas.join("\r\n");
}

// Crea el archivo y lo descarga. No usa internet: el archivo se arma aquí mismo.
function descargarCSV() {
  // "﻿" (BOM) al inicio le dice a Excel que el archivo usa UTF-8, así las tildes se ven bien.
  const contenido = "﻿" + armarCSV();
  const archivo = new Blob([contenido], { type: "text/csv;charset=utf-8" });
  const direccion = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = direccion;
  enlace.download = "mensajes_proveedores_" + monthSelect.value + ".csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  // Liberar la memoria un momento después, cuando la descarga ya empezó.
  setTimeout(function () {
    URL.revokeObjectURL(direccion);
  }, 1000);
}


// ---------------------------------------------------------------------
// PARTE 12. Arrancar la página
// ---------------------------------------------------------------------

// Desactiva el selector, los filtros, el buscador y la descarga (cuando no hay datos).
function desactivarControles() {
  monthSelect.disabled = true;
  buscador.disabled = true;
  botonCSV.disabled = true;
  for (const boton of botonesFiltro) {
    boton.disabled = true;
  }
}

if (!datosListos) {
  // Sin datos.js la página no se detiene: explica qué pasó.
  mostrarMensajeEnPagina(
    "No se pudieron cargar los datos. Revisa que el archivo datos.js esté en la misma carpeta que index.html.",
    "error-carga"
  );
  desactivarControles();
} else if (llenarMeses() === 0) {
  // datos.js cargó, pero no trae ningún mes.
  mostrarMensajeEnPagina("No hay indicadores para mostrar en datos.js.", "error-carga");
  desactivarControles();
} else {
  // Conectar cada control con lo que debe hacer.
  monthSelect.addEventListener("change", elegirMes);
  buscador.addEventListener("input", dibujarTarjetas);
  botonCSV.addEventListener("click", descargarCSV);
  for (const boton of botonesFiltro) {
    boton.addEventListener("click", function () {
      activarFiltro(boton);
    });
  }

  // Primer dibujo: queda elegido el mes más reciente.
  elegirMes();
}
