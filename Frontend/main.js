// CAMBIA ESTA URL a la de tu backend en Render
const API_URL = 'https://tu-backend-render.onrender.com/peliculas';

let modoEditar = false;
let peliculaEditarId = null;

async function cargarPeliculas() {
  const res = await fetch(API_URL);
  const peliculas = await res.json();

  const tbody = document.querySelector('#tablaPeliculas tbody');
  tbody.innerHTML = '';

  peliculas.forEach(p => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.idPelicula}</td>
      <td>${p.titulo}</td>
      <td>${p.director}</td>
      <td>${p.genero}</td>
      <td>${p.anio}</td>
      <td><img src="${p.imagen || ''}" alt="img" width="50"></td>
      <td><a href="${p.url || '#'}" target="_blank">Ver</a></td>
      <td>
        <button onclick="eliminar(${p.idPelicula})">Eliminar</button>
        <button onclick="editar(${p.idPelicula})">Modificar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

async function editar(id) {
  const res = await fetch(API_URL);
  const peliculas = await res.json();
  const pelicula = peliculas.find(p => p.idPelicula === id);
  if (!pelicula) return alert("Película no encontrada");

  document.getElementById('titulo').value = pelicula.titulo;
  document.getElementById('director').value = pelicula.director;
  document.getElementById('genero').value = pelicula.genero;
  document.getElementById('anio').value = pelicula.anio;
  document.getElementById('imagen').value = pelicula.imagen || '';
  document.getElementById('url').value = pelicula.url || '';

  modoEditar = true;
  peliculaEditarId = id;
  document.querySelector('#formAgregar button').textContent = 'Guardar cambios';
}

document.getElementById('formAgregar').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    titulo: document.getElementById('titulo').value,
    director: document.getElementById('director').value,
    genero: document.getElementById('genero').value,
    anio: parseInt(document.getElementById('anio').value),
    imagen: document.getElementById('imagen').value,
    url: document.getElementById('url').value,
  };

  const method = modoEditar ? 'PATCH' : 'POST';
  const url = modoEditar ? `${API_URL}/${peliculaEditarId}` : API_URL;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    cargarPeliculas();
    e.target.reset();
    modoEditar = false;
    peliculaEditarId = null;
    document.querySelector('#formAgregar button').textContent = 'Agregar';
  } else {
    alert('Error al guardar la película');
  }
});

async function eliminar(id) {
  if (!confirm('¿Estás seguro de eliminar esta película?')) return;

  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (res.ok) cargarPeliculas();
  else alert('Error al eliminar la película');
}

cargarPeliculas();
