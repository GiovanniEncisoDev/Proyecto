require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.json());
app.use(morgan('dev'));

app.use(cors({
  origin: 'https://proyecto-vbbd.onrender.com',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Obtener todas las películas
app.get('/peliculas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM peliculas ORDER BY idpelicula ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener películas:', error);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});

// Agregar una nueva película
app.post('/peliculas', async (req, res) => {
  const { titulo, director, genero, anio, imagen, url } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({ error: 'Título y género son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO peliculas (titulo, director, genero, anio, imagen, url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [titulo, director, genero, anio, imagen, url]);
    res.status(201).json({ mensaje: 'Película agregada', pelicula: result.rows[0] });
  } catch (error) {
    console.error('Error al agregar película:', error);
    res.status(500).json({ error: 'Error al agregar película' });
  }
});

// Actualizar una película
app.patch('/peliculas/:idpelicula', async (req, res) => {
  const id = parseInt(req.params.idpelicula);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const campos = ['titulo', 'director', 'genero', 'anio', 'imagen', 'url'];
  const valores = [];
  const sets = [];

  campos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      sets.push(`${campo} = $${sets.length + 1}`);
      valores.push(req.body[campo]);
    }
  });

  if (sets.length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  valores.push(id);
  const query = `
    UPDATE peliculas SET ${sets.join(', ')}
    WHERE idpelicula = $${valores.length}
  `;

  try {
    const result = await pool.query(query, valores);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Película no encontrada' });

    res.json({ mensaje: 'Película actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar película:', error);
    res.status(500).json({ error: 'Error al actualizar película' });
  }
});

// Eliminar una película
app.delete('/peliculas/:idpelicula', async (req, res) => {
  const id = parseInt(req.params.idpelicula);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const result = await pool.query('DELETE FROM peliculas WHERE idpelicula = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Película no encontrada' });

    res.json({ mensaje: 'Película eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar película:', error);
    res.status(500).json({ error: 'Error al eliminar película' });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Películas funcionando ✅');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
