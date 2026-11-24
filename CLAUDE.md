# Proyecto: ProveeMensajes Haceb (MVP – Ruta A)

## Cómo debes ayudarnos
- Somos principiantes: nunca hemos programado.
- Explica siempre en español y con palabras sencillas.
- Antes de cambiar archivos, dime en 2 o 3 líneas qué vas a hacer y por qué.
- Haz cambios pequeños, uno a la vez, y al terminar dime cómo comprobar que funciona.
- Escribe comentarios en español dentro del código.
- Si algo no está claro, pregúntame antes de suponer.

## El reto
Industrias Haceb envía cada mes, a mano, un correo a cada proveedor nacional con sus indicadores de nivel de servicio. Eso consume tiempo del equipo de Abastecimiento y Compras y puede generar errores en la información enviada. Queremos un MVP que, a partir de la tabla de indicadores, genere el mensaje de cada proveedor.

Más detalle en `docs/reto_haceb.md` y `docs/kit_trabajo.md`.

## Lo mínimo que debe hacer el MVP
1. Leer los indicadores de un mes.
2. Producir un mensaje por proveedor con sus valores.
3. Avisar cuando un proveedor no tiene correo válido.

## Funciones extra (después de lo mínimo)
- Selector de mes y resumen: mensajes generados, cuántos cumplen, cuántos no cumplen y cuántos tienen aviso de correo.
- Una tarjeta por proveedor con etiqueta verde «Cumple» o roja «No cumple».
- Tarjetas con problema de correo resaltadas en amarillo.
- Filtros, buscador, botón para copiar el mensaje, botón para abrir un borrador de correo (nunca envía solo) y descarga de los mensajes en CSV.

## Archivos
- `index.html`: estructura de la página.
- `estilos.css`: apariencia.
- `app.js`: lógica. Trae tres TODO por resolver.
- `datos.js`: datos del kit (`proveedores`, `ordenes` e `indicadores`). **No lo modifiques.**
- `datos/`: los mismos datos en CSV, solo para consulta.
- `docs/`: el reto y el resumen del kit.

## Reglas técnicas
- La página debe abrir con doble clic en index.html, sin servidor ni internet.
- No uses `fetch` ni cargues archivos locales: los datos vienen de `datos.js`.
- No uses librerías externas.
- No cambies los nombres de los archivos.
- Mantén el código simple y fácil de explicar.

## Reglas del kit
- No enviar correos reales. Los del kit terminan en `.example` y no existen.
- No usar datos reales de Haceb. Solo los datos ficticios del kit.
- Debemos poder explicar y validar todo lo que generes.

## Datos clave
- 12 proveedores (P001 a P012) y 3 meses: 2026-08, 2026-09 y 2026-10.
- Meta del NS integral: 90. «Cumple» si llega a la meta; si no, «No cumple».
- Mostrar los decimales con coma (86,0).
- P011 no tiene correo. P012 tiene el correo mal escrito (le falta la @).

## Texto del mensaje
> Hola, [contacto]. Compartimos los indicadores de nivel de servicio de [nombre del proveedor] para [mes en letras] de [año]: de [líneas] líneas, [líneas OTIF] llegaron a tiempo y completas (OTIF [% OTIF] %). Nivel de inventario: [% nivel de inventario] %. NS integral: [% NS integral] frente a una meta de [meta]. Calificación del mes: [calificación].

- Si cumple, termina con: «Gracias por mantener este nivel de servicio.»
- Si no cumple, termina con: «Le pedimos enviarnos un plan de acción para mejorar estos resultados.»
- Cierre: «Cordialmente, Abastecimiento y Compras – Industrias Haceb.»

## Pruebas que debe pasar
1. Octubre de 2026: 12 mensajes, uno por proveedor.
2. P006 en octubre: OTIF 80,0 %, NS integral 86,0 y «No cumple».
3. P011: aviso de que no tiene correo; el mensaje igual se genera.
4. P012: aviso de correo no válido porque le falta la @.
5. Agosto de 2026, P001: NS integral 98,7 y «Cumple».
6. Una persona de otro equipo genera los mensajes de un mes sin ayuda.

## Diseño
- Encabezado azul oscuro (#1F3864), fondo claro y letra de 15 px o más.
- Verde para «Cumple», rojo para «No cumple» y amarillo para los avisos de correo.
- Debe verse bien también en un celular.