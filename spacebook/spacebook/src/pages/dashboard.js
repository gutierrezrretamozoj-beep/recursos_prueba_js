import { DB } from '../api/db.js';

// Renderiza las estadísticas generales del sistema
export function renderDashboard() {
  const total     = DB.reservas.length;
  const pendiente = DB.reservas.filter(r => r.estado === 'pendiente').length;
  const aprobada  = DB.reservas.filter(r => r.estado === 'aprobada').length;
  const espacios  = DB.espacios.length;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${total}</div>
      <div class="stat-label">Total reservas</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color:var(--yellow)">${pendiente}</div>
      <div class="stat-label">Pendientes</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color:var(--green)">${aprobada}</div>
      <div class="stat-label">Aprobadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color:var(--accent)">${espacios}</div>
      <div class="stat-label">Espacios</div>
    </div>
  `;
}
