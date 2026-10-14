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

**Qué agregué:** formulario, validación visible, buscador y botones para marcar y borrar. Se utilizan `submit`, `input` y `click`.

**Por qué:** la lista debe responder a lo que necesita el usuario. `preventDefault()` evita recargar la página al enviar el formulario.

**Qué cambió:** el usuario puede agregar una tarea válida, buscar, tachar tareas y eliminar sus elementos del DOM. Los datos todavía se manejan directamente desde los elementos y se pierden al recargar.

```js
// V2: eventos submit, input y click.
const lista = document.querySelector("#lista-tareas");
const formulario = document.querySelector("#formulario");
const titulo = document.querySelector("#titulo");
const mensaje = document.querySelector("#mensaje");
const buscador = document.querySelector("#buscador");
const resumen = document.querySelector("#resumen");

function agregarTarea(texto) {
  const elemento = document.createElement("li");
  const nombre = document.createElement("span");
  nombre.textContent = texto;
  const marcar = document.createElement("button");
  marcar.textContent = "Marcar / desmarcar";
  marcar.addEventListener("click", () => {
    const completada = elemento.classList.toggle("completada");
    nombre.style.textDecoration = completada ? "line-through" : "none";
  });
  const borrar = document.createElement("button");
  borrar.textContent = "Borrar";
  borrar.addEventListener("click", () => {
    elemento.remove();
    actualizarResumen();
  });
  elemento.append(nombre, marcar, borrar);
  lista.appendChild(elemento);
  actualizarResumen();
}

function actualizarResumen() {
  resumen.textContent = `${lista.children.length} tareas en tu lista.`;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = titulo.value.trim();
  if (texto.length < 3 || texto.length > 80) {
    mensaje.textContent = "Escribe una tarea de entre 3 y 80 caracteres.";
    return;
  }
  agregarTarea(texto);
  formulario.reset();
  buscador.value = "";
  Array.from(lista.children).forEach((elemento) => { elemento.hidden = false; });
  mensaje.textContent = "Tarea agregada.";
});

buscador.addEventListener("input", () => {
  const busqueda = buscador.value.toLowerCase().trim();
  Array.from(lista.children).forEach((elemento) => {
    elemento.hidden = !elemento.querySelector("span").textContent.toLowerCase().includes(busqueda);
  });
});

agregarTarea("Practicar JavaScript");
```

## Version 3: con clases y objetos

Siguiente iteración: modelar las tareas con una clase propia.

## Donde uso DOM, eventos y objetos

Se completará la tabla al terminar la tercera versión.

## Pruebas realizadas

Verificación ejecutada con Node y una simulación mínima del DOM; no sustituye una revisión visual en un navegador.

| Acción | Resultado esperado | Resultado obtenido | Cumple |
| --- | --- | --- | --- |
| Enviar título vacío | Mensaje visible sin agregar una tarea | Escribe una tarea de entre 3 y 80 caracteres. | Sí |
| Agregar Leer apuntes | Nueva tarea sin recargar | Dos tareas en la lista | Sí |
| Buscar apuntes | Solo Leer apuntes visible | Una tarea visible | Sí |
| Marcar tarea | Título tachado | Título tachado | Sí |
| Borrar tarea | Elemento eliminado y contador actualizado | 1 tareas en tu lista. | Sí |

## Por que disene asi mi clase

Se documentará cuando se implemente la clase en v3.
