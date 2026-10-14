"use strict";

// PARTE 1 · OBJETOS: cada tarea reúne sus datos y su comportamiento.
function normalizarTexto(texto) {
  return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function validarTitulo(texto) {
  if (texto.trim().length < 3) return "Escribe una tarea de al menos 3 caracteres.";
  if (texto.trim().length > 80) return "La tarea debe tener como máximo 80 caracteres.";
  return "";
}

class Tarea {
  constructor(id, titulo, prioridad = "media", completada = false) {
    if (typeof titulo !== "string" || validarTitulo(titulo)) throw new Error("Título inválido.");
    if (!["baja", "media", "alta"].includes(prioridad)) throw new Error("Prioridad inválida.");
    this.id = id;
    this.titulo = titulo.trim();
    this.prioridad = prioridad;
    this.completada = completada;
  }

  alternarEstado() {
    this.completada = !this.completada;
  }

  coincideCon(busqueda) {
    return normalizarTexto(this.titulo).includes(normalizarTexto(busqueda));
  }
}

// PARTE 2 · DOM: referencias a los controles que ya existen en el HTML.
const formulario = document.querySelector("#formulario");
const campoTitulo = document.querySelector("#titulo");
const campoPrioridad = document.querySelector("#prioridad");
const mensaje = document.querySelector("#mensaje");
const contador = document.querySelector("#contador");
const buscador = document.querySelector("#buscador");
const botonesFiltro = document.querySelectorAll("[data-filtro]");
const lista = document.querySelector("#lista-tareas");
const estadoVacio = document.querySelector("#estado-vacio");
const botonLimpiarFiltros = document.querySelector("#limpiar-filtros");
const botonLimpiarCompletadas = document.querySelector("#limpiar-completadas");
const aviso = document.querySelector("#aviso");
const avisoTexto = document.querySelector("#aviso-texto");
const botonDeshacer = document.querySelector("#deshacer");
const textoGuardado = document.querySelector("#guardado-texto");

// PARTE 3 · ESTADO: el arreglo de objetos es la fuente de los datos.
const CLAVE_ALMACENAMIENTO = "lab08-dom-mi-dia-v3";
let filtroActual = "todas";
let ultimaEliminacion = [];

function crearId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tarea-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function tareasDeEjemplo() {
  return [
    new Tarea(crearId(), "Terminar la tarea del laboratorio", "alta"),
    new Tarea(crearId(), "Practicar JavaScript 20 minutos", "media"),
    new Tarea(crearId(), "Hacer una pausa sin pantallas", "baja"),
    new Tarea(crearId(), "Repasar los eventos del DOM", "media", true)
  ];
}

function cargarTareas() {
  try {
    const guardadas = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (guardadas === null) return tareasDeEjemplo();
    const datos = JSON.parse(guardadas);
    if (!Array.isArray(datos)) throw new Error("Datos inválidos.");
    const ids = new Set();
    return datos.map((dato) => {
      if (!dato || typeof dato.id !== "string" || !dato.id || ids.has(dato.id) || typeof dato.completada !== "boolean") {
        throw new Error("Datos inválidos.");
      }
      ids.add(dato.id);
      // JSON conserva los atributos; new Tarea recupera también los métodos.
      return new Tarea(dato.id, dato.titulo, dato.prioridad, dato.completada);
    });
  } catch {
    textoGuardado.textContent = "No se pudieron recuperar las tareas";
    return tareasDeEjemplo();
  }
}

let tareas = cargarTareas();

function guardarTareas() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(tareas));
    textoGuardado.textContent = "Guardado en este navegador";
  } catch {
    textoGuardado.textContent = "Guardado local no disponible";
  }
}

// PARTE 4 · DOM DINÁMICO: construir tarjetas y actualizar el resumen.
function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearTarjeta(tarea) {
  const elemento = crearElemento("li", `task-item${tarea.completada ? " completada" : ""}`);
  elemento.dataset.id = tarea.id;

  const marcar = crearElemento("button", "task-check", tarea.completada ? "✓" : "");
  marcar.type = "button";
  marcar.setAttribute("data-accion", "alternar");
  marcar.setAttribute("data-id", tarea.id);
  marcar.setAttribute("role", "checkbox");
  marcar.setAttribute("aria-checked", String(tarea.completada));
  marcar.setAttribute("aria-label", `${tarea.completada ? "Volver a pendiente" : "Completar"}: ${tarea.titulo}`);

  const texto = crearElemento("div", "task-text");
  // textContent muestra el título literalmente, incluso si contiene etiquetas.
  texto.append(
    crearElemento("span", "task-title", tarea.titulo),
    crearElemento("span", "task-caption", tarea.completada ? "Un paso más, ¡bien hecho!" : "Lista para cuando tú lo estés")
  );

  const nombresPrioridad = {alta: "Alta", media: "Media", baja: "Baja"};
  const prioridad = crearElemento("span", `priority priority-${tarea.prioridad}`, nombresPrioridad[tarea.prioridad]);
  prioridad.setAttribute("aria-label", `Prioridad ${tarea.prioridad}`);
  const borrar = crearElemento("button", "task-delete", "×");
  borrar.type = "button";
  borrar.setAttribute("data-accion", "borrar");
  borrar.setAttribute("data-id", tarea.id);
  borrar.setAttribute("aria-label", `Eliminar: ${tarea.titulo}`);
  borrar.title = `Eliminar ${tarea.titulo}`;

  elemento.append(marcar, texto, prioridad, borrar);
  return elemento;
}

function actualizarVista() {
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = tareas.length - completadas;
  const porcentaje = tareas.length ? Math.round(completadas / tareas.length * 100) : 0;

  document.querySelector("#total").textContent = tareas.length;
  document.querySelector("#pendientes").textContent = pendientes;
  document.querySelector("#completadas").textContent = completadas;
  document.querySelector("#cuenta-todas").textContent = tareas.length;
  document.querySelector("#cuenta-pendientes").textContent = pendientes;
  document.querySelector("#cuenta-completadas").textContent = completadas;
  document.querySelector("#progreso").textContent = `${porcentaje}%`;
  document.querySelector("#anillo-progreso").style.strokeDashoffset = 257.61 * (1 - porcentaje / 100);
  document.querySelector("#progreso-mensaje").textContent = tareas.length === 0
    ? "Tu próximo paso te espera."
    : pendientes === 0 ? "¡Todo listo! Disfruta tu pausa." : `${completadas} de ${tareas.length} tareas completadas.`;
  botonLimpiarCompletadas.disabled = completadas === 0;

  botonesFiltro.forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.dataset.filtro === filtroActual));
  });

  const visibles = tareas.filter((tarea) => {
    const coincideEstado = filtroActual === "todas"
      || (filtroActual === "pendientes" && !tarea.completada)
      || (filtroActual === "completadas" && tarea.completada);
    return coincideEstado && tarea.coincideCon(buscador.value);
  });

  const fragmento = document.createDocumentFragment();
  visibles.forEach((tarea) => fragmento.appendChild(crearTarjeta(tarea)));
  lista.replaceChildren(fragmento);
  lista.hidden = visibles.length === 0;
  estadoVacio.hidden = visibles.length > 0;
  document.querySelector("#resultado").textContent = `${visibles.length} de ${tareas.length} ${tareas.length === 1 ? "tarea" : "tareas"}`;

  document.querySelector("#vacio-titulo").textContent = tareas.length === 0 ? "Un espacio para empezar." : "No hay tareas por aquí.";
  document.querySelector("#vacio-mensaje").textContent = tareas.length === 0
    ? "Agrega tu primera tarea desde el formulario."
    : "Prueba otra búsqueda o cambia el filtro.";
  botonLimpiarFiltros.hidden = tareas.length === 0;
}

function mostrarMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = `form-message ${tipo}`.trim();
  campoTitulo.setAttribute("aria-invalid", String(tipo === "error"));
}

function reiniciarFiltros() {
  buscador.value = "";
  filtroActual = "todas";
  actualizarVista();
}

function registrarEliminacion(elementos) {
  ultimaEliminacion = elementos;
  avisoTexto.textContent = elementos.length === 1 ? "Tarea eliminada." : `${elementos.length} tareas eliminadas.`;
  aviso.hidden = false;
}

// PARTE 5 · EVENTOS: submit valida, input busca, click modifica los objetos.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const titulo = campoTitulo.value.trim();
  const error = validarTitulo(titulo);
  if (error) {
    mostrarMensaje(error, "error");
    campoTitulo.focus();
    return;
  }
  if (!["baja", "media", "alta"].includes(campoPrioridad.value)) {
    mostrarMensaje("Selecciona una prioridad válida.", "error");
    campoPrioridad.focus();
    return;
  }
  if (tareas.some((tarea) => normalizarTexto(tarea.titulo) === normalizarTexto(titulo))) {
    mostrarMensaje("Esa tarea ya está en tu lista. Prueba con otra.", "error");
    campoTitulo.focus();
    return;
  }

  tareas.unshift(new Tarea(crearId(), titulo, campoPrioridad.value));
  guardarTareas();
  formulario.reset();
  contador.textContent = "0 / 80";
  reiniciarFiltros();
  mostrarMensaje("Tarea agregada. Ya tienes tu próximo paso.", "success");
  campoTitulo.focus();
});

campoTitulo.addEventListener("input", () => {
  contador.textContent = `${campoTitulo.value.length} / 80`;
  if (mensaje.classList.contains("error")) {
    mostrarMensaje("Dale un nombre claro y empieza cuando quieras.");
  }
});

buscador.addEventListener("input", actualizarVista);

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    filtroActual = boton.dataset.filtro;
    actualizarVista();
  });
});

// Delegación: un solo listener atiende también a las tareas recién creadas.
lista.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton || !lista.contains(boton)) return;
  const indice = tareas.findIndex((tarea) => tarea.id === boton.dataset.id);
  if (indice === -1) return;

  if (boton.dataset.accion === "alternar") {
    tareas[indice].alternarEstado();
    guardarTareas();
    actualizarVista();
    // Conserva el foco después de reconstruir las tarjetas.
    const siguienteBoton = Array.from(lista.querySelectorAll("[data-accion]")).find((control) =>
      control.dataset.id === boton.dataset.id && control.dataset.accion === "alternar"
    );
    if (siguienteBoton) siguienteBoton.focus();
  } else if (boton.dataset.accion === "borrar") {
    const [tarea] = tareas.splice(indice, 1);
    boton.closest("li").remove();
    registrarEliminacion([{tarea, indice}]);
    guardarTareas();
    actualizarVista();
    botonDeshacer.focus();
  }
});

botonLimpiarCompletadas.addEventListener("click", () => {
  const eliminadas = tareas.map((tarea, indice) => ({tarea, indice})).filter((elemento) => elemento.tarea.completada);
  if (eliminadas.length === 0) return;
  tareas = tareas.filter((tarea) => !tarea.completada);
  registrarEliminacion(eliminadas);
  guardarTareas();
  actualizarVista();
  botonDeshacer.focus();
});

botonDeshacer.addEventListener("click", () => {
  const recuperables = ultimaEliminacion.filter(({tarea}) => !tareas.some((existente) =>
    normalizarTexto(existente.titulo) === normalizarTexto(tarea.titulo)
  ));
  recuperables.forEach(({tarea, indice}) => tareas.splice(Math.min(indice, tareas.length), 0, tarea));
  const cantidad = recuperables.length;
  ultimaEliminacion = [];
  aviso.hidden = true;
  guardarTareas();
  reiniciarFiltros();
  mostrarMensaje(cantidad ? "Eliminación deshecha. Tus tareas están de vuelta." : "La tarea ya está en tu lista.", "success");
  campoTitulo.focus();
});

botonLimpiarFiltros.addEventListener("click", reiniciarFiltros);

// PARTE 6 · INICIO: fecha, primera vista y persistencia del estado inicial.
const fecha = document.querySelector("#fecha");
fecha.textContent = new Intl.DateTimeFormat("es-PE", {weekday: "long", day: "numeric", month: "long"}).format(new Date());
actualizarVista();
guardarTareas();
