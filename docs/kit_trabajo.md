# Kit de trabajo – Hackatón EstudIA con Industrias Haceb

## Objetivo
Construir un MVP que, a partir de una tabla de indicadores, genere el mensaje de cada proveedor. Los datos del kit son una versión simplificada y ficticia: los datos reales tienen más tablas y no incluyen correos.

## Archivos del kit

### Datos (en la carpeta datos/)
- **proveedores.csv:** 12 proveedores con su contacto y correo.
- **ordenes.csv:** líneas de orden de compra de agosto a octubre de 2026.
- **indicadores_mensuales.csv:** los indicadores de cada proveedor por mes. Es la tabla desde la que se arman los mensajes.

### Plantilla de inicio, ruta A (en la carpeta principal)
- **index.html:** la estructura de la página. Se abre con doble clic.
- **estilos.css:** la apariencia de la página.
- **app.js:** confirma en la consola que los datos cargaron y deja tres TODO por resolver.
- **datos.js:** los tres archivos CSV como arreglos de JavaScript: `proveedores`, `ordenes` e `indicadores`.

Los cuatro archivos de la plantilla deben estar en la misma carpeta. No se usa `fetch` con archivos locales, porque falla al abrir el HTML con doble clic.

## Datos y cálculos

### Columnas de proveedores.csv
id_proveedor, nombre, nit, contacto, correo (puede venir vacío o mal escrito), ciudad, modelo_abastecimiento (Orden de compra, Inhouse o Consignación).

### Columnas de indicadores_mensuales.csv
periodo, id_proveedor, nombre_proveedor, lineas, lineas_a_tiempo, lineas_completas, lineas_otif, pct_otif, pct_nivel_inventario, pct_ns_integral, meta, calificacion.

### Cálculos
- **% OTIF** = líneas OTIF / líneas × 100. Una línea cuenta solo si llega a tiempo y completa.
- **NS integral** = promedio simple de OTIF y nivel de inventario. Haceb define la fórmula real.
- **Calificación:** «Cumple» si el NS integral llega a la meta (90); si no, «No cumple».
- **Ejemplo:** P006 en octubre de 2026 tiene 8 de 10 líneas OTIF (80,0 %) y NS integral 86,0, así que «No cumple».

### Datos clave
- 12 proveedores (P001 a P012) y 3 meses: 2026-08, 2026-09 y 2026-10.
- **P011** no tiene correo.
- **P012** tiene el correo mal escrito (le falta la @).

## Rutas para el MVP (se elige una)
- **A. Página web** que genera los mensajes, a partir de la plantilla. ← la que elegimos
- **B. Hoja de cálculo** que arma el texto con fórmulas.
- **C. Script** que lee los datos y escribe los mensajes.

### Mínimo para cualquier ruta
1. Leer los indicadores de un mes.
2. Producir un mensaje por proveedor con sus valores.
3. Avisar cuando un proveedor no tiene correo válido.

## Reglas
- No enviar a correos reales. Los del kit terminan en `.example` y no existen.
- No subir ni pegar en una IA los datos reales de la plataforma de Haceb.
- Si usamos IA, debemos poder explicar y validar lo que genera.

## Plan de pruebas
1. Preparar 5 o 6 pruebas centradas en lo esencial del MVP.
2. En clase: una prueba con alguien de otro equipo. Explicar el MVP en dos minutos y observar en silencio.
3. Durante la semana: pruebas con al menos 5 personas.
4. Llegar el 28 de noviembre con los resultados. La presentación final es el 3 de diciembre.

### Tabla de pruebas
#, Qué probamos, Cómo, Resultado esperado, Resultado obtenido.

### Preguntas para los usuarios (sin adjetivos como «fácil», «rápido», «útil» o «intuitivo»)
- ¿Cómo fue el proceso de…?
- ¿Qué fue lo primero que pensaste cuando…?
- ¿Qué es lo que más tiempo te toma?
- ¿Qué te impediría usarla?