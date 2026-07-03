const API = "/api/turnos";

const form = document.getElementById("form-turno");
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const errorBox = document.getElementById("form-error");
const btnSubmit = document.getElementById("btn-submit");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
const btnHoy = document.getElementById("btn-hoy");
const editFlag = document.getElementById("edit-flag");
const ledger = document.getElementById("ledger");
const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtro-estado");
const toastStack = document.getElementById("toast-stack");
const modalOverlay = document.getElementById("modal-overlay");
const modalDesc = document.getElementById("modal-desc");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmar = document.getElementById("modal-confirmar");

let turnos = [];
let filtroTexto = "";
let filtroTipoEstado = "todos";
let editandoId = null;
let idAEliminar = null;

/* ---------- Utilidades de fecha ---------- */

function hoyISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function horaAhora() {
  return new Date().toTimeString().slice(0, 5);
}

function formatearFechaLarga(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  const texto = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function esHoy(fechaISO) {
  return fechaISO === hoyISO();
}

fechaInput.value = hoyISO();
horaInput.value = horaAhora();

btnHoy.addEventListener("click", () => {
  fechaInput.value = hoyISO();
  horaInput.value = horaAhora();
  mostrarToast("Fecha y hora actualizadas al momento actual.", "exito");
});

/* ---------- Toasts ---------- */

function mostrarToast(mensaje, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  toastStack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("saliendo");
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

/* ---------- Carga inicial ---------- */

async function cargarTurnos() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("No se pudo cargar la agenda.");
    turnos = await res.json();
    render();
  } catch (err) {
    ledger.innerHTML = `<p class="empty-state">${err.message} Recargá la página para reintentar.</p>`;
  }
}

/* ---------- Filtro y búsqueda ---------- */

function coincideBusqueda(t) {
  const pasaTexto =
    !filtroTexto ||
    t.apellido.toLowerCase().includes(filtroTexto) ||
    t.nombre.toLowerCase().includes(filtroTexto) ||
    String(t.dni).includes(filtroTexto);
  const pasaEstado = filtroTipoEstado === "todos" || t.estado === filtroTipoEstado;
  return pasaTexto && pasaEstado;
}

/* ---------- Estadísticas ---------- */

function actualizarStats() {
  const hoy = hoyISO();
  const deHoy = turnos.filter((t) => t.fecha === hoy);
  const pendientesHoy = deHoy.filter((t) => t.estado !== "atendido").length;
  const atendidosHoy = deHoy.filter((t) => t.estado === "atendido").length;

  animarNumero("stat-hoy", deHoy.length);
  animarNumero("stat-pendientes", pendientesHoy);
  animarNumero("stat-atendidos", atendidosHoy);
  animarNumero("stat-total", turnos.length);
}

function animarNumero(id, valor) {
  const el = document.getElementById(id);
  if (el.textContent !== String(valor)) {
    el.textContent = valor;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
}

/* ---------- Render ---------- */

function render() {
  actualizarStats();

  const visibles = turnos.filter(coincideBusqueda);

  if (visibles.length === 0) {
    const hayFiltro = filtroTexto || filtroTipoEstado !== "todos";
    ledger.innerHTML = `<p class="empty-state">${
      hayFiltro
        ? "No hay turnos que coincidan con la búsqueda o el filtro."
        : "Todavía no cargaste ningún turno. Completá el formulario para agregar el primero."
    }</p>`;
    return;
  }

  const grupos = {};
  for (const t of visibles) {
    grupos[t.fecha] = grupos[t.fecha] || [];
    grupos[t.fecha].push(t);
  }
  const fechasOrdenadas = Object.keys(grupos).sort();

  ledger.innerHTML = fechasOrdenadas
    .map((fecha) => {
      const filas = grupos[fecha].map((t) => filaTurno(t)).join("");
      return `
        <div class="day-group">
          <div class="day-heading">
            <span>${formatearFechaLarga(fecha)}</span>
            ${esHoy(fecha) ? '<span class="tag-hoy">Hoy</span>' : ""}
          </div>
          ${filas}
        </div>
      `;
    })
    .join("");
}

function filaTurno(t) {
  const atendido = t.estado === "atendido";
  return `
    <div class="turno-row" data-id="${t.id}">
      <div class="turno-hora">${t.hora}</div>
      <div class="turno-info" data-action="editar" data-id="${t.id}" title="Tocar para editar este turno">
        <div class="turno-nombre">${escapar(t.apellido)}, ${escapar(t.nombre)}</div>
        <div class="turno-meta">
          <span>DNI <span class="dni-value">${escapar(t.dni)}</span></span>
          <span>${escapar(t.obraSocial)}</span>
          ${t.motivo ? `<span>${escapar(t.motivo)}</span>` : ""}
        </div>
      </div>
      <button class="estado-toggle ${atendido ? "atendido" : "pendiente"}" data-action="toggle" data-id="${t.id}">
        ${atendido ? "Atendido" : "Pendiente"}
      </button>
      <button class="btn-editar" data-action="editar" data-id="${t.id}" title="Editar turno" aria-label="Editar turno">✎</button>
      <button class="btn-borrar" data-action="borrar" data-id="${t.id}" title="Eliminar turno" aria-label="Eliminar turno">✕</button>
    </div>
  `;
}

function escapar(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ---------- Validación en vivo ---------- */

const validadores = {
  nombre: (v) => (v.trim().length >= 2 ? "" : "Ingresá el nombre."),
  apellido: (v) => (v.trim().length >= 2 ? "" : "Ingresá el apellido."),
  dni: (v) => (/^\d{6,9}$/.test(v.trim()) ? "" : "Ingresá un DNI válido (solo números)."),
  obraSocial: (v) => (v.trim().length >= 2 ? "" : "Ingresá la obra social."),
};

for (const campo of Object.keys(validadores)) {
  const input = document.getElementById(campo);
  input.addEventListener("blur", () => validarCampo(campo));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalido")) validarCampo(campo);
  });
}

function validarCampo(campo) {
  const input = document.getElementById(campo);
  const hint = document.querySelector(`[data-hint-for="${campo}"]`);
  const mensaje = validadores[campo](input.value);
  if (mensaje) {
    input.classList.add("invalido");
    input.classList.remove("valido");
    hint.textContent = mensaje;
  } else {
    input.classList.remove("invalido");
    input.classList.add("valido");
    hint.textContent = "";
  }
  return !mensaje;
}

function validarTodo() {
  return Object.keys(validadores)
    .map((c) => validarCampo(c))
    .every(Boolean);
}

/* ---------- Alta / edición ---------- */

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;

  if (!validarTodo() || !fechaInput.value || !horaInput.value) {
    errorBox.textContent = "Revisá los campos marcados en rojo.";
    errorBox.hidden = false;
    return;
  }

  const datos = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    dni: form.dni.value.trim(),
    obraSocial: form.obraSocial.value.trim(),
    fecha: form.fecha.value,
    hora: form.hora.value,
    motivo: form.motivo.value.trim(),
  };

  btnSubmit.disabled = true;
  btnSubmit.textContent = editandoId ? "Guardando…" : "Agregando…";

  try {
    if (editandoId) {
      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editandoId, ...datos }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "No se pudo guardar el cambio.");
      const actualizado = await res.json();
      const idx = turnos.findIndex((t) => t.id === editandoId);
      turnos[idx] = actualizado;
      mostrarToast(`Turno de ${actualizado.nombre} ${actualizado.apellido} actualizado.`, "exito");
      salirModoEdicion();
    } else {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "No se pudo guardar el turno.");
      const guardado = await res.json();
      turnos.push(guardado);
      mostrarToast(`Turno agregado para ${guardado.nombre} ${guardado.apellido}.`, "exito");
      form.reset();
      fechaInput.value = hoyISO();
      horaInput.value = horaAhora();
      limpiarValidacion();
      form.nombre.focus();
    }
    render();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
    mostrarToast(err.message, "error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = editandoId ? "Guardar cambios" : "Agregar turno";
  }
});

function limpiarValidacion() {
  for (const campo of Object.keys(validadores)) {
    const input = document.getElementById(campo);
    input.classList.remove("valido", "invalido");
    document.querySelector(`[data-hint-for="${campo}"]`).textContent = "";
  }
}

function entrarModoEdicion(turno) {
  editandoId = turno.id;
  form.nombre.value = turno.nombre;
  form.apellido.value = turno.apellido;
  form.dni.value = turno.dni;
  form.obraSocial.value = turno.obraSocial;
  form.fecha.value = turno.fecha;
  form.hora.value = turno.hora;
  form.motivo.value = turno.motivo || "";
  limpiarValidacion();
  errorBox.hidden = true;

  editFlag.hidden = false;
  btnSubmit.textContent = "Guardar cambios";
  btnCancelarEdicion.hidden = false;

  document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  form.nombre.focus();
}

function salirModoEdicion() {
  editandoId = null;
  form.reset();
  fechaInput.value = hoyISO();
  horaInput.value = horaAhora();
  limpiarValidacion();
  editFlag.hidden = true;
  btnSubmit.textContent = "Agregar turno";
  btnCancelarEdicion.hidden = true;
}

btnCancelarEdicion.addEventListener("click", () => {
  salirModoEdicion();
  mostrarToast("Edición cancelada.", "info");
});

/* ---------- Acciones sobre filas ---------- */

ledger.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const turno = turnos.find((t) => t.id === id);
  if (!turno) return;

  if (action === "editar") {
    entrarModoEdicion(turno);
  }

  if (action === "toggle") {
    const nuevoEstado = turno.estado === "atendido" ? "pendiente" : "atendido";
    turno.estado = nuevoEstado;
    render();
    try {
      await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      mostrarToast(
        nuevoEstado === "atendido" ? "Marcado como atendido." : "Marcado como pendiente.",
        "exito"
      );
    } catch {
      mostrarToast("No se pudo actualizar el estado.", "error");
    }
  }

  if (action === "borrar") {
    idAEliminar = id;
    modalDesc.textContent = `Se va a eliminar el turno de ${turno.nombre} ${turno.apellido} (DNI ${turno.dni}). Esta acción no se puede deshacer.`;
    modalOverlay.hidden = false;
    modalConfirmar.focus();
  }
});

/* ---------- Modal de confirmación ---------- */

function cerrarModal() {
  modalOverlay.hidden = true;
  idAEliminar = null;
}

modalCancelar.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) cerrarModal();
});

modalConfirmar.addEventListener("click", async () => {
  if (!idAEliminar) return;
  const id = idAEliminar;
  const turno = turnos.find((t) => t.id === id);
  const fila = ledger.querySelector(`.turno-row[data-id="${id}"]`);
  if (fila) fila.classList.add("saliendo");
  cerrarModal();

  setTimeout(async () => {
    turnos = turnos.filter((t) => t.id !== id);
    render();
    try {
      await fetch(API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (turno) mostrarToast(`Turno de ${turno.nombre} ${turno.apellido} eliminado.`, "info");
      if (editandoId === id) salirModoEdicion();
    } catch {
      mostrarToast("No se pudo eliminar el turno en el servidor.", "error");
    }
  }, 180);
});

/* ---------- Búsqueda y filtro ---------- */

buscador.addEventListener("input", (e) => {
  filtroTexto = e.target.value.trim().toLowerCase();
  render();
});

filtroEstado.addEventListener("change", (e) => {
  filtroTipoEstado = e.target.value;
  render();
});

cargarTurnos();
