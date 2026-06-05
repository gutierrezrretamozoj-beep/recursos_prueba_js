// Base de datos en memoria — simula json-server
// Para conectar json-server real: reemplaza las funciones por fetch() a http://localhost:3000
export const DB = {
  users: [
    { id: 1, name: "Administrador", email: "admin@test.com", password: "Admin123*", role: "admin" },
    { id: 2, name: "Juan Pérez",    email: "user1@test.com", password: "User123*",  role: "user" },
    { id: 3, name: "Ana García",    email: "user2@test.com", password: "User123*",  role: "user" }
  ],
  espacios: [
    { id: 1, nombre: "Sala Azul",    tipo: "Sala de reuniones", capacidad: 8,  ubicacion: "Piso 2", estado: "disponible" },
    { id: 2, nombre: "Oficina 301",  tipo: "Oficina privada",   capacidad: 4,  ubicacion: "Piso 3", estado: "disponible" },
    { id: 3, nombre: "Auditorio A",  tipo: "Auditorio",         capacidad: 80, ubicacion: "Piso 1", estado: "disponible" },
    { id: 4, nombre: "Cowork Norte", tipo: "Coworking",         capacidad: 20, ubicacion: "Piso 4", estado: "disponible" }
  ],
  reservas: [
    { id: 1, userId: 2, espacioId: 1, fecha: "2025-06-10", inicio: "09:00", fin: "10:00", motivo: "Reunión de equipo",       estado: "pendiente" },
    { id: 2, userId: 3, espacioId: 3, fecha: "2025-06-11", inicio: "14:00", fin: "16:00", motivo: "Presentación cliente",    estado: "aprobada"  }
  ]
};

// ── Helpers para simular GET / POST / PUT / DELETE ──

export const reservasAPI = {
  getAll: ()          => [...DB.reservas],
  getByUser: (uid)    => DB.reservas.filter(r => r.userId === uid),
  create: (data)      => {
    const item = { id: nextId(DB.reservas), ...data };
    DB.reservas.push(item);
    return item;
  },
  update: (id, data)  => {
    const i = DB.reservas.findIndex(r => r.id === id);
    DB.reservas[i] = { ...DB.reservas[i], ...data };
    return DB.reservas[i];
  },
  remove: (id)        => { DB.reservas = DB.reservas.filter(r => r.id !== id); }
};

export const espaciosAPI = {
  getAll: ()          => [...DB.espacios],
  create: (data)      => {
    const item = { id: nextId(DB.espacios), ...data };
    DB.espacios.push(item);
    return item;
  },
  update: (id, data)  => {
    const i = DB.espacios.findIndex(e => e.id === id);
    DB.espacios[i] = { ...DB.espacios[i], ...data };
    return DB.espacios[i];
  },
  remove: (id)        => { DB.espacios = DB.espacios.filter(e => e.id !== id); }
};

export const usersAPI = {
  findByCredentials: (email, pass) => DB.users.find(u => u.email === email && u.password === pass),
  findById: (id)                   => DB.users.find(u => u.id === id)
};

// Genera el siguiente ID autoincremental
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}
