# Cómo funciona ProveeMensajes Haceb

Esta guía explica el proyecto para alguien que nunca ha programado. Los ejemplos usan los datos ficticios del kit, sobre todo tres proveedores de **octubre de 2026**:

| Código | Proveedor | Contacto | Correo | Lo que lo hace especial |
|---|---|---|---|---|
| P006 | Vidrios Templados Medellín Ltda. | Felipe Giraldo | compras@vidriostemplados.example | Correo bien escrito, pero **no cumple** la meta |
| P011 | Disolventes Químicos Andino Ltda. | Valentina López | *(vacío)* | **No tiene correo** |
| P012 | Tuercas y Pernos El Carmen S.A.S. | Sebastián Marín | compras.tuercasypernos.example | Correo **mal escrito: le falta la @** |

---

## 1. Qué hace cada archivo

Piensen en la página como una casa:

| Archivo | En la casa sería… | Qué hace |
|---|---|---|
| `index.html` | Las paredes y los cuartos | Dice **qué hay** en la página: el encabezado, la lista de meses, el botón del CSV, el resumen, los filtros, el buscador y el espacio vacío donde aparecen las tarjetas. |
| `estilos.css` | La pintura y los muebles | Dice **cómo se ve**: el azul del encabezado, el verde de «Cumple», el rojo de «No cumple», el amarillo de los avisos, el tamaño de la letra y cómo se acomoda todo en un celular. |
| `app.js` | La electricidad | Dice **qué hace** la página: lee los datos, arma los mensajes, revisa los correos, dibuja las tarjetas y responde a los botones. |
| `datos.js` | La despensa | Guarda los **datos del kit** en tres listas: `proveedores` (12), `indicadores` (36: 12 proveedores × 3 meses) y `ordenes` (434 líneas de órdenes de compra). **No se modifica.** |
| `datos/*.csv` | Una copia de la despensa | Los mismos datos en formato de tabla, para abrirlos en Excel y consultarlos. La página no los usa. |
| `docs/` | El manual del reto | Explica el reto de Haceb y el kit de trabajo. |
| `CLAUDE.md` | Las reglas de la obra | Lo que acordamos: qué debe hacer el MVP, el texto del mensaje, los colores y las pruebas. |

**Orden de carga:** `index.html` carga primero `datos.js` y después `app.js`. Así, cuando `app.js` empieza a trabajar, los datos ya están listos.

**Sin internet:** la página no descarga nada de internet. Todo está en la carpeta, por eso funciona con doble clic en `index.html`.

---

## 2. `app.js` parte por parte

`app.js` está dividido en 12 partes numeradas.
- Las partes **1 a 11** solo preparan herramientas (llamadas *funciones*). Una función es como una receta: está escrita, pero no se cocina hasta que alguien la pide.
- La parte **12** es la que pone la página en marcha y usa esas recetas.

### Parte 1. Revisar que los datos cargaron y ubicar los elementos de la página
- Primero comprueba que `datos.js` se cargó y trae las listas `proveedores` e `indicadores`. El resultado queda guardado en `datosListos` (sí o no).
- Después ubica en la página los elementos que va a usar: la lista de meses, el espacio de las tarjetas, el resumen, el buscador, los botones de filtro y el botón del CSV.
- Por último, prepara una lista vacía, `indicadoresDelMes`, que se llenará con los registros del mes elegido.

### Parte 2. Formatos: textos, números y meses
Recetas para mostrar los datos como pide CLAUDE.md:
- `mesEnLetras`: convierte `"2026-10"` en **«octubre de 2026»**.
- `conUnDecimal`: convierte `86` en **«86,0»**, con un decimal y coma.
- `conPorcentaje`: convierte `80` en **«80,0 %»**.
- `sinDecimales`: muestra la meta como **«90»**.
- `entero`: muestra las líneas, por ejemplo **«10»**.
- `faltaDato`: revisa si un número falta (vacío, nulo o que no es número). En ese caso, las recetas anteriores escriben **«sin dato»**.
- `textoLimpio`: quita los espacios sobrantes al inicio y al final de un texto.

### Parte 3. Proveedor y correo
- `buscarProveedor`: dado un código como `P006`, busca a ese proveedor en la lista `proveedores`.
- `revisarCorreo`: aplica la regla del correo (explicada en la sección 4).
- `datosDelProveedor`: reúne en un solo paquete el código, el nombre, el contacto, el correo y el aviso de correo de un proveedor. Lo usan las tarjetas, el resumen, los filtros y el CSV, para que todos digan siempre lo mismo.

  Ejemplo con P011: código «P011», nombre «Disolventes Químicos Andino Ltda.», contacto «Valentina López», correo vacío y aviso «Sin correo registrado».

### Parte 4. Avisos de la tarjeta
- `esCalificacionValida`: la calificación solo puede ser «Cumple» o «No cumple».
- `faltanDatos`: revisa si al registro le falta algún número del mensaje o si la calificación no es válida.
- `listaDeAvisos`: junta todos los avisos de un proveedor. Una tarjeta puede tener varios, por ejemplo uno de correo y otro de «Faltan datos».
  - P012 → «Correo no válido (le falta @)».
  - P006 → ningún aviso.

### Parte 5. El mensaje
- `armarMensaje` llena el texto de CLAUDE.md con los datos del proveedor y lo entrega en tres párrafos: cuerpo, final y cierre. Para **P006 en octubre** queda así:

  > Hola, Felipe Giraldo. Compartimos los indicadores de nivel de servicio de Vidrios Templados Medellín Ltda. para octubre de 2026: de 10 líneas, 8 llegaron a tiempo y completas (OTIF 80,0 %). Nivel de inventario: 91,9 %. NS integral: 86,0 frente a una meta de 90. Calificación del mes: No cumple.
  >
  > Le pedimos enviarnos un plan de acción para mejorar estos resultados.
  >
  > Cordialmente, Abastecimiento y Compras – Industrias Haceb.

  - Si la calificación fuera «Cumple», el segundo párrafo diría «Gracias por mantener este nivel de servicio.»
  - Si no hubiera contacto, el saludo diría «Hola, equipo de [nombre del proveedor].»
- `textoDelMensaje` une los tres párrafos en un solo texto. Lo usan el botón de copiar, el borrador de correo y el CSV.

### Parte 6. Elegir el mes
- `llenarMeses`:
  1. recorre los 36 indicadores y anota cada mes una sola vez (2026-08, 2026-09, 2026-10);
  2. los ordena del más reciente al más antiguo;
  3. los pone en la lista desplegable escritos en letras.
- `elegirMes`: deja en `indicadoresDelMes` solo los registros del mes elegido (12 en octubre) y pide redibujar el resumen y las tarjetas.

### Parte 7. Filtros y buscador
- `pasaFiltros` decide si una tarjeta se muestra:
  - con **«Solo No cumple»**, deja solo las que no cumplen;
  - con **«Solo con aviso de correo»**, deja solo las que tienen problema de correo (P011 y P012);
  - con el **buscador**, deja solo las que tienen el texto escrito en el nombre o en el código, sin importar mayúsculas. «p006», «P006» y «VIDRIOS» encuentran la misma tarjeta.
- `activarFiltro`: resalta el botón al que se le hizo clic, apaga los demás y redibuja las tarjetas.

### Parte 8. Dibujar las tarjetas
- `crearTarjeta` arma la tarjeta de un proveedor, en este orden:
  1. el nombre;
  2. la etiqueta verde o roja;
  3. código, correo, OTIF, nivel de inventario, NS integral, meta y calificación;
  4. los avisos en amarillo;
  5. el mensaje;
  6. los botones «Copiar mensaje» y «Abrir en mi correo».
- Si el correo tiene problema, como en P011 y P012:
  - la tarjeta se pinta de amarillo;
  - el botón de correo queda gris y desactivado.
- `dibujarTarjetas`: borra las tarjetas anteriores y crea una por cada registro del mes que pase los filtros. Si no queda ninguna, escribe «No hay proveedores que coincidan.»
- `agregarLinea`, `agregarAviso`, `crearBotonAccion` y `mostrarMensajeEnPagina` son recetas pequeñas que ayudan a construir la tarjeta.

### Parte 9. Resumen del mes
- `dibujarResumen` cuenta sobre **todo el mes**, sin importar filtros ni buscador, y dibuja 4 cajas. En octubre:
  - **12** mensajes generados;
  - **4** cumplen;
  - **8** no cumplen;
  - **2** tienen aviso de correo (P011 y P012).

### Parte 10. Copiar el mensaje y abrir el borrador
- `copiarMensaje`: copia el mensaje. El botón muestra «¡Copiado!» durante 2 segundos, o «No se pudo copiar» si el navegador no lo permitió.
- `copiarFormaAntigua`: un plan B para navegadores que no aceptan la forma moderna de copiar.
- `abrirBorrador`: abre tu programa de correo con un **borrador** que ya trae destinatario, asunto («Indicadores de nivel de servicio – octubre de 2026») y mensaje. **Nunca envía nada solo:** la persona revisa y decide.

### Parte 11. Descargar el CSV
- `armarCSV`:
  - arma una tabla con los 12 proveedores del mes y estas columnas: Código, Proveedor, Correo, Calificación, Aviso y Mensaje;
  - separa las columnas con punto y coma;
  - pone el mensaje en una sola línea, para que las filas de Excel no queden altas.
- `celdaCSV`: pone cada valor entre comillas, para que un punto y coma dentro del texto no corra las columnas.
- `descargarCSV`:
  - crea el archivo, por ejemplo `mensajes_proveedores_2026-10.csv`, y lo descarga;
  - al inicio lleva una marca invisible (llamada **BOM**) que le avisa a Excel cómo leer las tildes.

### Parte 12. Arrancar la página
Es la única parte que se ejecuta sola al abrir la página:
- **Si `datos.js` no cargó**, muestra un recuadro rojo que explica qué revisar. Además, con la receta `desactivarControles`, pone en gris la lista de meses, los filtros, el buscador y el botón del CSV.
- **Si `datos.js` cargó pero no trae meses**, avisa que no hay indicadores.
- **Si todo está bien:**
  1. conecta cada control con su receta (la lista de meses, el buscador, el botón CSV y los filtros);
  2. hace el primer dibujo con el mes más reciente.

---

## 3. El recorrido completo: de elegir un mes a ver las tarjetas

Ejemplo: la persona abre la página y cambia el mes a **octubre de 2026**.

1. **La persona elige «octubre de 2026»** en la lista. Por dentro, esa opción vale `"2026-10"`.
2. **La página reacciona.** En la Parte 12 conectamos la lista de meses con `elegirMes`, así que el navegador la ejecuta sola.
3. **Se filtran los datos.** `elegirMes` revisa los 36 indicadores y se queda con los 12 de `"2026-10"`, que guarda en `indicadoresDelMes`.
4. **Se dibuja el resumen.** `dibujarResumen` cuenta los 12 registros y muestra 12 / 4 / 8 / 2.
5. **Se dibujan las tarjetas.** `dibujarTarjetas` borra las tarjetas viejas y recorre los 12 registros uno por uno. Con **P006**, por ejemplo:
   1. `datosDelProveedor` busca P006 en `proveedores` y trae nombre, contacto «Felipe Giraldo» y correo. `revisarCorreo` dice que el correo es válido, así que no hay aviso.
   2. `pasaFiltros` revisa el filtro activo y el buscador. Con «Todos» y el buscador vacío, P006 pasa.
   3. `crearTarjeta` arma la tarjeta:
      - franja y etiqueta roja «No cumple»;
      - OTIF «80,0 %», NS integral «86,0» y meta «90»;
      - el mensaje que arma `armarMensaje`;
      - los dos botones.
   4. La tarjeta se agrega a la página.
6. **Lo mismo con los otros 11.** Con P011 y P012, `revisarCorreo` devuelve un aviso. Por eso sus tarjetas salen amarillas, con el aviso visible y el botón de correo desactivado. Pero **su mensaje se genera igual**.
7. **La persona ve las 12 tarjetas.** Todo esto ocurre en una fracción de segundo.

Si después la persona hace clic en un filtro o escribe en el buscador, se repite solo el paso 5. El resumen no cambia, porque siempre cuenta todo el mes.

---

## 4. Cómo se decide si un correo es válido

La receta `revisarCorreo` revisa el correo paso a paso. Primero quita los espacios sobrantes. Luego hace estas preguntas en orden, y la primera que falla decide el aviso:

1. **¿Está vacío?** → aviso «**Sin correo registrado**». Es el caso de **P011**.
2. **¿Le falta la @?** → aviso «**Correo no válido (le falta @)**». Es el caso de **P012**, que tiene `compras.tuercasypernos.example`.
3. **¿Tiene una sola @, algo antes de la @ y un punto después?**
   - Si cumple las tres → **correo válido**, sin aviso. Es el caso de **P006**, con `compras@vidriostemplados.example`.
   - Si falla alguna → aviso «**Correo no válido**».

Más ejemplos:

| Correo | Resultado | Por qué |
|---|---|---|
| *(vacío)* — P011 | Sin correo registrado | No hay nada escrito |
| `compras.tuercasypernos.example` — P012 | Correo no válido (le falta @) | No tiene @ |
| `compras@vidriostemplados.example` — P006 | Válido | Una @, algo antes y un punto después |
| `compras@@empresa.example` | Correo no válido | Tiene dos @ |
| `@empresa.example` | Correo no válido | No hay nada antes de la @ |
| `compras@empresa` | Correo no válido | No hay punto después de la @ |

**Qué pasa cuando hay aviso:**
- la tarjeta se pinta de amarillo;
- el aviso aparece con ⚠;
- el botón «Abrir en mi correo» queda desactivado;
- el proveedor cuenta en la caja «Con aviso de correo» del resumen;
- **el mensaje se genera igual**, para que el equipo pueda copiarlo y enviarlo cuando consiga el correo correcto.

**Qué no hace esta regla:** no comprueba que el correo **exista**. Solo revisa que esté bien escrito. Los correos del kit terminan en `.example` y no existen.

---

## 5. Preguntas que podría hacernos el jurado

**1. ¿La página envía correos automáticamente?**
No. El botón «Abrir en mi correo» solo abre un borrador en el programa de correo de la persona. Ella lo revisa y decide si lo envía.

**2. ¿De dónde salen los números? ¿Los calculan ustedes?**
No los recalculamos. Vienen ya calculados en `datos.js` (OTIF, nivel de inventario, NS integral, meta y calificación) y los mostramos tal cual, con un decimal y coma. Así evitamos introducir errores nuevos.

**3. ¿Cómo comprobaron que los mensajes son correctos?**
Con las pruebas de CLAUDE.md:
- octubre genera 12 mensajes;
- P006 muestra OTIF 80,0 %, NS integral 86,0 y «No cumple»;
- P011 y P012 muestran su aviso de correo;
- P001 en agosto muestra 98,7 y «Cumple».

Los resultados están en `PRUEBAS.md`.

**4. ¿Qué pasa con un proveedor sin correo, como P011?**
Su tarjeta sale en amarillo con el aviso «Sin correo registrado» y el botón de correo desactivado. El mensaje se genera igual y se puede copiar. Así el equipo sabe que debe conseguir el correo antes de enviarlo.

**5. ¿Funciona sin internet?**
Sí. Todo está en la carpeta: los datos en `datos.js` y la lógica en `app.js`. Basta con dar doble clic en `index.html`. No usamos librerías externas.

**6. ¿Qué hay que hacer para usarla el próximo mes?**
Actualizar `datos.js` con los indicadores nuevos, con el mismo formato. El mes nuevo aparece solo en la lista, el más reciente de primero, y los mensajes se generan sin tocar el código.

**7. ¿Qué pasa si falta un dato o si falta el archivo de datos?**
- **Si falta un dato**, el mensaje dice «sin dato» en ese lugar y la tarjeta muestra el aviso «Faltan datos».
- **Si falta `datos.js`**, la página muestra un recuadro rojo que explica qué revisar.

En ningún caso la página se detiene.

**8. ¿Qué limitaciones tiene y qué mejorarían después?**
- **Correos:** solo revisa que estén bien escritos, no que existan.
- **Buscador:** distingue tildes («metalicas» no encuentra «Metálicas»).
- **Actualización:** `datos.js` se actualiza a mano.

Como mejoras siguientes:
- leer los datos directamente desde el sistema de compras;
- guardar un registro de qué mensajes ya se enviaron.
