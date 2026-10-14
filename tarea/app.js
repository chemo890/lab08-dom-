// V1: seleccionar, crear e insertar elementos del DOM.
const lista = document.querySelector("#lista-tareas");
const resumen = document.querySelector("#resumen");
const titulos = ["Repasar los eventos del DOM", "Practicar JavaScript", "Documentar el laboratorio"];

titulos.forEach((titulo) => {
  const elemento = document.createElement("li");
  elemento.textContent = titulo;
  lista.appendChild(elemento);
});

resumen.textContent = `${titulos.length} tareas de ejemplo.`;
