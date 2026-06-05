import { DB, reservasAPI } from '../api/db.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let currentUser = null;
let editingId   = null; // ID de la reserva en edición (null = nueva)

// Inyectar el usuario logueado desde main.js
export function initReservas(user) {
  currentUser = user;
}

// Renderiza la tabla de reservas según el rol
export function renderReservas() {
  // Admin ve todas; user solo las suyas
  const lista = currentUser.role === 'admin'
    ? reservasAPI.getAll()
    : reservasAPI.getByUser(currentUser.id);

  document.getElementById('reservas-title').textContent =
    currentUser.role === 'admin' ? 'Todas las reservas' : 'Mis reservas';
  document.getElementById('reservas-sub').textContent =
    currentUser.role === 'admin'
      ? 'Gestión completa de reservas'
      : 'Tus reservas personales';

  const tbody = document.getElementById('reservas-tbody');

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin reservas aún</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(r => buildRow(r)).join('');
  attachRowEvents();
}

// Construye el HTML de una fila
function buildRow(r) {
  const espacio = DB.espacios.find(e => e.id === r.espacioId);
  const owner   = DB.users.find(u => u.id === r.userId);
  const isOwner = r.userId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';

  // Botones según reglas de negocio
  let btns = '';
  if (isAdmin) {
    btns += `<button class="btn btn-ghost btn-sm" data-action="edit"   data-id="${r.id}">✏️</button>`;
    if (r.estado === 'pendiente') {
      btns += `<button class="btn btn-ghost btn-sm" style="color:var(--green)" data-action="aprobar"  data-id="${r.id}">✓</button>`;
      btns += `<button class="btn btn-ghost btn-sm" style="color:var(--red)"   data-action="rechazar" data-id="${r.id}">✗</button>`;
    }
    btns += `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${r.id}">🗑</button>`;
  } else if (isOwner) {
    if (r.estado === 'pendiente')
      btns += `<button class="btn btn-ghost btn-sm"  data-action="edit"     data-id="${r.id}">✏️</button>`;
    if (r.estado !== 'cancelada' && r.estado !== 'rechazada')
      btns += `<button class="btn btn-danger btn-sm" data-action="cancelar" data-id="${r.id}">✗ Cancelar</button>`;
  }

  return `
    <tr>
      <td>
        ${espacio ? espacio.nombre : '—'}
        ${isAdmin ? `<br><small style="color:var(--muted)">${owner?.name || ''}</small>` : ''}
      </td>
      <td>${r.fecha}</td>
      <td>${r.inicio} – ${r.fin}</td>
      <td>${r.motivo}</td>
      <td><span class="status status-${r.estado}">${r.estado}</span></td>
      <td><div class="actions">${btns}</div></td>
    </tr>
  `;
}

// Delega eventos de los botones de la tabla
function attachRowEvents() {
  document.getElementById('reservas-tbody').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id     = parseInt(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === 'edit')     openEditModal(id);
    if (action === 'delete')   handleDelete(id);
    if (action === 'aprobar')  cambiarEstado(id, 'aprobada');
    if (action === 'rechazar') cambiarEstado(id, 'rechazada');
    if (action === 'cancelar') cambiarEstado(id, 'cancelada');
  });
}

// ── Abrir modal de nueva reserva ──
export function openNewReservaModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Nueva reserva';
  document.getElementById('f-estado').parentElement.style.display =
    currentUser.role === 'admin' ? 'block' : 'none';

  populateEspaciosSelect();
  clearForm();
  openModal('modal-reserva');
}

// ── Abrir modal en modo edición ──
function openEditModal(id) {
  const r = DB.reservas.find(r => r.id === id);

  // Guard: user solo edita sus pendientes
  if (currentUser.role !== 'admin' && (r.userId !== currentUser.id || r.estado !== 'pendiente')) {
    showToast('No puedes editar esta reserva', 'error');
    return;
  }

  editingId = id;
  document.getElementById('modal-title').textContent = 'Editar reserva';
  document.getElementById('f-estado').parentElement.style.display =
    currentUser.role === 'admin' ? 'block' : 'none';

  populateEspaciosSelect();

  // Pre-cargar datos de la reserva
  document.getElementById('f-espacio').value = r.espacioId;
  document.getElementById('f-fecha').value   = r.fecha;
  document.getElementById('f-inicio').value  = r.inicio;
  document.getElementById('f-fin').value     = r.fin;
  document.getElementById('f-motivo').value  = r.motivo;
  document.getElementById('f-estado').value  = r.estado;

  openModal('modal-reserva');
}

// ── Guardar reserva (POST o PUT) ──
export function saveReserva() {
  const espacioId = parseInt(document.getElementById('f-espacio').value);
  const fecha     = document.getElementById('f-fecha').value;
  const inicio    = document.getElementById('f-inicio').value;
  const fin       = document.getElementById('f-fin').value;
  const motivo    = document.getElementById('f-motivo').value.trim();
  const estado    = currentUser.role === 'admin'
    ? document.getElementById('f-estado').value
    : 'pendiente'; // user siempre crea en pendiente

  // Validaciones básicas
  if (!fecha || !inicio || !fin || !motivo) {
    showToast('Completa todos los campos', 'error'); return;
  }
  if (inicio >= fin) {
    showToast('La hora de fin debe ser mayor a la de inicio', 'error'); return;
  }

  // Validar reserva duplicada — mismo espacio, fecha y horario solapado
  const conflicto = DB.reservas.find(r =>
    r.id !== editingId &&
    r.espacioId === espacioId &&
    r.fecha === fecha &&
    r.estado !== 'cancelada' && r.estado !== 'rechazada' &&
    !(fin <= r.inicio || inicio >= r.fin)
  );
  if (conflicto) { showToast('Ya existe una reserva en ese horario', 'error'); return; }

  if (editingId) {
    reservasAPI.update(editingId, { espacioId, fecha, inicio, fin, motivo, estado }); // PUT
    showToast('Reserva actualizada', 'success');
  } else {
    reservasAPI.create({ userId: currentUser.id, espacioId, fecha, inicio, fin, motivo, estado }); // POST
    showToast('Reserva creada', 'success');
  }

  closeModal('modal-reserva');
  renderReservas();
}

// ── Cambiar estado de una reserva (PATCH) ──
function cambiarEstado(id, estado) {
  reservasAPI.update(id, { estado });
  showToast(`Reserva ${estado}`, 'success');
  renderReservas();
}

// ── Eliminar reserva (DELETE) ──
function handleDelete(id) {
  if (!confirm('¿Eliminar esta reserva?')) return;
  reservasAPI.remove(id);
  showToast('Reserva eliminada');
  renderReservas();
}

// ── Helpers ──
function populateEspaciosSelect() {
  const sel = document.getElementById('f-espacio');
  sel.innerHTML = DB.espacios
    .filter(e => e.estado === 'disponible')
    .map(e => `<option value="${e.id}">${e.nombre} (${e.tipo})</option>`)
    .join('');
}

function clearForm() {
  ['f-fecha', 'f-inicio', 'f-fin', 'f-motivo'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-estado').value = 'pendiente';
}
