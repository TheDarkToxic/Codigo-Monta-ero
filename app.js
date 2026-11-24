// Plantilla de inicio: datos.js ya define proveedores e indicadores.
console.log("Proveedores cargados:", proveedores.length);
console.log("Indicadores cargados:", indicadores.length);

const monthSelect = document.getElementById("month");
const providersContainer = document.getElementById("proveedores");

// TODO 1: filtrar los indicadores por mes.
//   - Llena el <select id="month"> con los periodos distintos (campo "periodo").
//   - Al cambiar el mes, deja solo los indicadores de ese periodo.

// TODO 2: recorrer y pintar una tarjeta por proveedor.
//   - Une cada indicador con su proveedor por id_proveedor.
//   - Crea una tarjeta en #proveedores con el nombre y los indicadores.

// TODO 3: armar el mensaje y avisar si falta el correo.
//   - Escribe el texto del correo con los valores del proveedor.
//   - Si el correo está vacío o no es válido, muestra un aviso en esa tarjeta.
