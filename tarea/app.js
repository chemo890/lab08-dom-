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
