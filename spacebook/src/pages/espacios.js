import { espaciosAPI } from '../api/db.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let editingId = null; // ID del espacio en edición

// Renderiza la tabla de espacios
export function renderEspacios() {
  const lista = espaciosAPI.getAll();
  const tbody = document.getElementById('espacios-tbody');

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin espacios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(e => `
    <tr>
      <td>${e.nombre}</td>
      <td>${e.tipo}</td>
      <td>${e.capacidad} personas</td>
      <td>${e.ubicacion}</td>
      <td>
        <span class="status ${e.estado === 'disponible' ? 'status-aprobada' : 'status-cancelada'}">
          ${e.estado}
        </span>
      </td>
      <td><div class="actions">
        <button class="btn btn-ghost btn-sm"  data-action="edit"   data-id="${e.id}">✏️</button>
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${e.id}">🗑</button>
      </div></td>
    </tr>
  `).join('');

  // Delegación de eventos en la tabla
  tbody.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    if (btn.dataset.action === 'edit')   openEditEspacio(id);
    if (btn.dataset.action === 'delete') handleDelete(id);
  });
}

// Abrir modal para nuevo espacio
export function openNewEspacioModal() {
  editingId = null;
  document.getElementById('modal-espacio-title').textContent = 'Nuevo espacio';
  clearForm();
  openModal('modal-espacio');
}

// Abrir modal en modo edición
function openEditEspacio(id) {
  editingId = id;
  const e = espaciosAPI.getAll().find(e => e.id === id);
  document.getElementById('modal-espacio-title').textContent = 'Editar espacio';
  document.getElementById('e-nombre').value    = e.nombre;
  document.getElementById('e-tipo').value      = e.tipo;
  document.getElementById('e-capacidad').value = e.capacidad;
  document.getElementById('e-ubicacion').value = e.ubicacion;
  document.getElementById('e-estado').value    = e.estado;
  openModal('modal-espacio');
}

// Guardar espacio (POST o PUT)
export function saveEspacio() {
  const nombre    = document.getElementById('e-nombre').value.trim();
  const tipo      = document.getElementById('e-tipo').value;
  const capacidad = parseInt(document.getElementById('e-capacidad').value);
  const ubicacion = document.getElementById('e-ubicacion').value.trim();
  const estado    = document.getElementById('e-estado').value;

  if (!nombre || !capacidad || !ubicacion) {
    showToast('Completa todos los campos', 'error'); return;
  }

  if (editingId) {
    espaciosAPI.update(editingId, { nombre, tipo, capacidad, ubicacion, estado }); // PUT
    showToast('Espacio actualizado', 'success');
  } else {
    espaciosAPI.create({ nombre, tipo, capacidad, ubicacion, estado }); // POST
    showToast('Espacio creado', 'success');
  }

  closeModal('modal-espacio');
  renderEspacios();
}

function handleDelete(id) {
  if (!confirm('¿Eliminar este espacio?')) return;
  espaciosAPI.remove(id); // DELETE
  showToast('Espacio eliminado');
  renderEspacios();
}

function clearForm() {
  ['e-nombre', 'e-capacidad', 'e-ubicacion'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('e-tipo').value   = 'Sala de reuniones';
  document.getElementById('e-estado').value = 'disponible';
}
