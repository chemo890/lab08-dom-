# Tarea: Mi componente interactivo

## Componente elegido

**Mi día**, una lista de tareas separada en formulario, resumen y lista. Permite organizar actividades de estudio.

## Version 1: solo DOM

**Qué agregué:** una lista de tres tareas de ejemplo, generada con `document.createElement`, y un resumen con su cantidad.

**Por qué:** primero comprobé que podía seleccionar elementos y agregar contenido sin escribir cada tarea en el HTML.

**Qué cambió:** al cargar la página, JavaScript construye la lista. Todavía no permite interactuar.

```js
const lista = document.querySelector("#lista-tareas");
const resumen = document.querySelector("#resumen");
const titulos = ["Repasar los eventos del DOM", "Practicar JavaScript", "Documentar el laboratorio"];

titulos.forEach((titulo) => {
  const elemento = document.createElement("li");
  elemento.textContent = titulo;
  lista.appendChild(elemento);
});

resumen.textContent = `${titulos.length} tareas de ejemplo.`;
```

## Version 2: con eventos

Siguiente iteración: agregar interacción.

## Version 3: con clases y objetos

Siguiente iteración: modelar las tareas con una clase propia.

## Donde uso DOM, eventos y objetos

Se completará la tabla al terminar la tercera versión.

## Pruebas realizadas

Verificación ejecutada con Node y una simulación mínima del DOM; no sustituye una revisión visual en un navegador.

| Acción | Resultado esperado | Resultado obtenido | Cumple |
| --- | --- | --- | --- |
| Cargar v1 | Tres elementos creados con createElement | Tres elementos li creados | Sí |
| Ver resumen v1 | 3 tareas de ejemplo. | 3 tareas de ejemplo. | Sí |

## Por que disene asi mi clase

Se documentará cuando se implemente la clase en v3.
