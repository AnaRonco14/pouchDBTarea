const db = new PouchDB('tareas');
const inputName = document.getElementById('nombre');
const inputFecha = document.getElementById('fecha');
const btnAdd = document.getElementById('btnAdd');
const btnList = document.getElementById('btnList');
const lista = document.getElementById('lista');

// Crear tarea con status por defecto 'activo'
btnAdd.addEventListener('click', async () => {
  const nombre = inputName.value.trim();
  const fecha = inputFecha.value || null;

  if (!nombre) {
    alert('Agrega un nombre para la tarea');
    return;
  }

  const tarea = {
    _id: new Date().toISOString(),
    nombre,
    fecha,
    status: 'activo' // <-- status guardado aquí
  };

  try {
    await db.put(tarea);
    inputName.value = '';
    inputFecha.value = '';
    listarTareas();
  } catch (err) {
    console.error('Error guardando tarea', err);
    alert('Ocurrió un error guardando la tarea');
  }
});

// Listar tareas
btnList.addEventListener('click', listarTareas);

async function listarTareas() {
  try {
    const result = await db.allDocs({ include_docs: true, descending: true });
    render(result.rows.map(r => r.doc));
    console.log('Listado', result);
  } catch (err) {
    console.error(err);
  }
}

// Render en DOM
function render(tareas) {
  if (!tareas || tareas.length === 0) {
    lista.innerHTML = '<p>No hay tareas.</p>';
    return;
  }

  lista.innerHTML = '';
  tareas.forEach(t => {
    const div = document.createElement('div');
    div.className = 'tarea';

    const info = document.createElement('div');
    const titulo = document.createElement('div');
    titulo.textContent = t.nombre;
    titulo.className = (t.status === 'activo') ? 'activo' : 'inactivo';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = (t.fecha ? `Fecha: ${t.fecha} • ` : '') + `ID: ${t._id}`;

    info.appendChild(titulo);
    info.appendChild(meta);

    const acciones = document.createElement('div');

    // Botón alternar status
    const btnToggle = document.createElement('button');
    btnToggle.textContent = (t.status === 'activo') ? 'Marcar inactivo' : 'Marcar activo';
    btnToggle.addEventListener('click', async () => {
      try {
        const doc = await db.get(t._id);
        doc.status = (doc.status === 'activo') ? 'inactivo' : 'activo';
        await db.put(doc);
        listarTareas();
      } catch (err) {
        console.error('Error actualizando status', err);
        alert('No se pudo actualizar el status');
      }
    });

    // Botón (opcional) ver detalle
    const btnDetalle = document.createElement('button');
    btnDetalle.textContent = 'Detalle';
    btnDetalle.className = 'btn-secondary';
    btnDetalle.style.marginLeft = '8px';
    btnDetalle.addEventListener('click', () => {
      alert(`Tarea: ${t.nombre}\nFecha: ${t.fecha || '-'}\nStatus: ${t.status}`);
    });

    acciones.appendChild(btnToggle);
    acciones.appendChild(btnDetalle);

    div.appendChild(info);
    div.appendChild(acciones);

    lista.appendChild(div);
  });
}

// Auto listar al cargar la app
listarTareas();

// Escuchar cambios en la DB y refrescar (útil al sincronizar en otras pestañas)
db.changes({ live: true, since: 'now', include_docs: true }).on('change', () => {
  listarTareas();
});
