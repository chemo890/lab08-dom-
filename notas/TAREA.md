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

**Qué agregué:** una clase `Tarea` con constructor, cuatro atributos (`id`, `titulo`, `prioridad`, `completada`) y dos métodos (`alternarEstado`, `coincideCon`). También agregué prioridades, filtros por estado, estadísticas, porcentaje de avance, guardado con `localStorage`, deshacer eliminaciones y una presentación por secciones.

**Por qué:** antes se usaban los elementos del DOM como fuente de datos. Ahora cada tarea existe como un objeto independiente. Un arreglo conserva las tareas y `actualizarVista()` construye el DOM a partir de ese estado. Esto permite calcular cantidades, guardar información y reutilizar la misma regla de búsqueda.

**Qué cambió:** el usuario puede elegir una prioridad, consultar solo pendientes o completadas y ver el avance actualizado. El estado permanece al recargar el mismo navegador. Al agregar una tarea se limpian los filtros para mostrarla inmediatamente. Una eliminación individual o la limpieza de completadas se puede deshacer mientras la página siga abierta. Si no hay coincidencias, se ofrece quitar los filtros.

**Cómo está dividida la página:** navegación, resumen de tareas, formulario, tarjeta de progreso y lista con buscador. En el archivo `app.js` hay seis partes comentadas: objetos, referencias al DOM, estado, creación y actualización del DOM, eventos e inicio.

Código principal de la versión final, tal como está en `tarea/app.js`:

```js
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
```

## Donde uso DOM, eventos y objetos

| Parte | Código final | Qué hace |
| --- | --- | --- |
| DOM: seleccionar | Parte 2: `document.querySelector()` y `querySelectorAll()` | Obtiene formulario, campos, lista, mensajes y filtros. |
| DOM: crear | Parte 4: `crearElemento()` y `crearTarjeta()` | Usa `document.createElement()` para construir `li`, botones, títulos y etiquetas de prioridad. |
| DOM: insertar y modificar | Parte 4: `actualizarVista()` | Usa `createDocumentFragment()`, `appendChild()`, `replaceChildren()`, `textContent`, `hidden` y atributos ARIA para mostrar el estado actual. |
| DOM: eliminar | Parte 5: listener de la lista, acción `borrar` | Ejecuta `boton.closest("li").remove()` y retira la tarea del arreglo. |
| Evento `submit` | Parte 5: `formulario.addEventListener("submit", ...)` | Evita recargar, valida el título y la prioridad, crea una instancia y actualiza la página. |
| Evento `input` | Parte 5: listeners de `campoTitulo` y `buscador` | Actualiza el contador de caracteres, despeja errores y filtra resultados mientras se escribe. |
| Evento `click` | Parte 5: lista, filtros, limpieza y deshacer | Completa, borra, cambia filtros, limpia completadas o restaura eliminaciones. |
| Objetos: clase propia | Parte 1: `class Tarea` | Define datos y comportamiento de cada tarea; es distinta de `Producto` y `Carrito`. |
| Objetos: instancias | Partes 3 y 5: `new Tarea(...)` y arreglo `tareas` | Crea, conserva, busca y modifica los objetos de la lista. |
| Objetos: métodos | Partes 1, 4 y 5: `alternarEstado()` y `coincideCon()` | Alterna el estado y busca ignorando mayúsculas y tildes. |

La validación se muestra en `#mensaje` con `textContent`; no se utiliza `alert`. Se rechazan títulos vacíos, de menos de 3 o más de 80 caracteres, prioridades inválidas y títulos duplicados. El contenido del usuario se inserta como texto, nunca como HTML.

## Pruebas realizadas

Las versiones se verificaron antes de publicarlas en el repositorio. Se ejecutó JavaScript con Node y una simulación mínima del DOM para enviar eventos a los controles reales del programa. También se comprobó la sintaxis con `node --check`. Estos resultados comprueban la lógica y los eventos; no sustituyen una revisión visual manual en un navegador.

### Version 1

| Acción | Resultado esperado | Resultado obtenido | Cumple |
| --- | --- | --- | --- |
| Cargar v1 | Tres elementos creados con createElement | Tres elementos li creados | Sí |
| Ver resumen v1 | 3 tareas de ejemplo. | 3 tareas de ejemplo. | Sí |

### Version 2

| Acción | Resultado esperado | Resultado obtenido | Cumple |
| --- | --- | --- | --- |
| Enviar título vacío | Mensaje visible sin agregar una tarea | Escribe una tarea de entre 3 y 80 caracteres. | Sí |
| Agregar Leer apuntes | Nueva tarea sin recargar | Dos tareas en la lista | Sí |
| Buscar apuntes | Solo Leer apuntes visible | Una tarea visible | Sí |
| Marcar tarea | Título tachado | Título tachado | Sí |
| Borrar tarea | Elemento eliminado y contador actualizado | 1 tareas en tu lista. | Sí |

### Version 3

| Acción | Resultado esperado | Resultado obtenido | Cumple |
| --- | --- | --- | --- |
| Cargar la versión final | 4 tareas, 3 pendientes, 1 completada y 25% de avance | 4 tareas; 3 pendientes; 1 completada; 25% | Sí |
| Enviar el formulario vacío | Mensaje visible sin crear una tarea | Escribe una tarea de al menos 3 caracteres. | Sí |
| Enviar un título de 2 caracteres | Rechazo con mensaje de validación | Título rechazado; lista sin cambios | Sí |
| Agregar Leer apuntes con prioridad alta | Nueva tarjeta, total 5 y formulario limpio | Tarea agregada con prioridad Alta; total 5; formulario limpio | Sí |
| Agregar LEER ÁPUNTES otra vez | Evitar duplicados aunque cambien mayúsculas o tildes | Esa tarea ya está en tu lista. Prueba con otra. | Sí |
| Escribir Leer en el campo del título | Actualizar el contador con input | 4 / 80; error anterior despejado | Sí |
| Buscar LABORATORIO | Una coincidencia sin cambiar el total general | Una tarjeta visible; total general 5 | Sí |
| Buscar paúsa | Encontrar pausa ignorando tildes | Hacer una pausa sin pantallas | Sí |
| Buscar un texto sin coincidencias | Mostrar un estado vacío y un botón para quitar filtros | No hay tareas por aquí; opción Ver todas disponible | Sí |
| Pulsar Ver todas mis tareas | Quitar búsqueda y filtros | Cinco tareas visibles; búsqueda limpia | Sí |
| Elegir el filtro Completadas | Mostrar solo la tarea completada | Una tarea completada visible; filtro activo | Sí |
| Completar Leer apuntes | Cambiar el objeto y actualizar contador, tarjeta y avance | Objeto completado; título tachado; 2 completadas; 40% | Sí |
| Volver Leer apuntes a pendiente | Revertir el estado y el avance | Tarea pendiente; 1 completada; 20% | Sí |
| Borrar Leer apuntes | Eliminar el objeto y su elemento del DOM | Elemento eliminado; total 4; Deshacer disponible | Sí |
| Deshacer la eliminación | Restaurar la tarea y su prioridad | Tarea recuperada con prioridad Alta; total 5 | Sí |
| Limpiar completadas y deshacer | Quitar solo las completadas y permitir recuperarlas | Una completada eliminada y recuperada; pendientes conservadas | Sí |
| Agregar un título con etiquetas HTML | Mostrar el texto literal sin crear una etiqueta img | Etiqueta mostrada como texto; ningún elemento img creado | Sí |
| Enviar un título de 81 caracteres | Rechazar el título excesivamente largo | La tarea debe tener como máximo 80 caracteres. | Sí |
| Recargar con las tareas guardadas | Recuperar seis tareas y los métodos de la clase | Seis tareas recuperadas como instancias de Tarea | Sí |
| Recargar una lista guardada vacía | Conservar el vacío sin recrear ejemplos ni dividir por cero | Lista vacía conservada; progreso 0%; limpieza desactivada | Sí |
| Usar la app con almacenamiento bloqueado | Seguir funcionando y mostrar el estado de guardado | Cuatro tareas visibles; aviso Guardado local no disponible | Sí |

## Por que disene asi mi clase

Diseñé `Tarea` para representar una actividad sin depender de su tarjeta en el DOM. El atributo `id` identifica cada objeto aunque se cambie el orden o se aplique un filtro; `titulo` conserva el texto que escribió el usuario; `prioridad` indica la importancia y determina la etiqueta visible; y `completada` permite distinguir pendientes y terminadas. El método `alternarEstado()` reúne el cambio de estado en un único lugar, mientras que `coincideCon()` encapsula la comparación del título para buscar sin distinguir tildes o mayúsculas. La clase valida el título y la prioridad al construirse. La representación visual queda en `crearTarjeta()` y `actualizarVista()`, lo que permite reconstruir la interfaz y recuperar los métodos al leer datos guardados mediante `new Tarea(...)`.

## Observaciones

- `preventDefault()` permite enviar el formulario sin recargar la página.
- La delegación de `click` en la lista sirve para las tareas originales y las nuevas.
- Las estadísticas usan todas las tareas; la búsqueda y los filtros solamente cambian lo que se ve.
- Guardar atributos con JSON no conserva métodos. Al cargar, se reconstruyen instancias de `Tarea`.
- Una lista guardada vacía permanece vacía al recargar. Los ejemplos se muestran cuando no existe un estado guardado.
- El guardado es local al navegador y al origen de la página; no sincroniza dispositivos. La opción Deshacer conserva la última eliminación mientras la página sigue abierta.

## Conclusiones

Las tres iteraciones muestran el paso desde contenido generado con DOM hasta un componente que responde a eventos y administra objetos. En v1 aprendí a crear elementos; en v2 agregué acciones del usuario y validación visible; en v3 separé los datos de su representación para buscar, calcular y guardar de forma coherente. El resultado permite organizar tareas y observar cómo una acción cambia los objetos, el DOM y el resumen al mismo tiempo.

## Entrega e historial

- [Página publicada](https://chemo890.github.io/lab08-dom-/tarea/).
- [Código final](../tarea/app.js) y [estructura HTML](../tarea/index.html).
- [Historial de commits](https://github.com/chemo890/lab08-dom-/commits/main/).
- v1: `Tarea v1: estructura del componente y DOM`.
- v2: `Tarea v2: agregar eventos y validacion visible`.
- v3: `Tarea v3: componente con clases y enlaces en README`.

El repositorio existente se llama `lab08-dom-`, con un guion al final. Por eso la URL correcta contiene `/lab08-dom-/tarea/`. Se conserva el contenido de la parte guiada y se agrega la carpeta `tarea/`.
