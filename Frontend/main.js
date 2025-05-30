const API_URL = 'https://web-6dmv.onrender.com/peliculas';

async function cargarPeliculas() {
  try {
    const res = await fetch(API_URL);
    const peliculas = await res.json();

    const tbody = document.querySelector('#tablaPeliculas tbody');
    tbody.innerHTML = '';

    peliculas.forEach(p => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${p.idpelicula}</td>
        <td>${p.titulo}</td>
        <td>${p.director || ''}</td>
        <td>${p.genero}</td>
        <td>${p.anio || ''}</td>
        <td><img src="${p.imagen || ''}" alt="img" width="50"></td>
        <td><a href="${p.url || '#'}" target="_blank">Ver</a></td>
        <td><button class="btn-eliminar" data-id="${p.idpelicula}">Eliminar</button></td>
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error('Error al cargar películas:', err);
    alert('Error al cargar películas');
  }
}

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-eliminar')) {
    const id = e.target.getAttribute('data-id');
    if (confirm('¿Estás seguro de que deseas eliminar esta película?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.mensaje);
        cargarPeliculas();
      } catch (err) {
        console.error('Error al eliminar película:', err);
        alert('Error al eliminar película');
      }
    }
  }
});

document.getElementById('formularioPeliculas').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value;
  const director = document.getElementById('director').value;
  const genero = document.getElementById('genero').value;
  const anio = parseInt(document.getElementById('anio').value) || null;
  const imagen = document.getElementById('imagen').value;
  const url = document.getElementById('url').value;

  const nuevaPelicula = { titulo, director, genero, anio, imagen, url };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaPelicula)
    });

    const data = await res.json();
    alert(data.mensaje || 'Película agregada');
    e.target.reset();
    cargarPeliculas();
  } catch (err) {
    console.error('Error al agregar película:', err);
    alert('Error al agregar película');
  }
});

cargarPeliculas();
