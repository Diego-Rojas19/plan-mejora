const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuración desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'veterinaria',
  waitForConnections: true,
  connectionLimit: 10
};

let pool;

// Función para crear el pool de conexiones con reintentos
async function initDb() {
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    try {
      pool = mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      console.log('Conectado a MySQL correctamente');
      connection.release();
      return;
    } catch (err) {
      console.log(`Esperando MySQL... intento ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error('No se pudo conectar a MySQL después de varios intentos');
  process.exit(1);
}

// GET /mascotas - Listar todas las mascotas
app.get('/mascotas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mascotas');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las mascotas' });
  }
});

// GET /mascotas/:id - Obtener una mascota por id
app.get('/mascotas/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mascotas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la mascota' });
  }
});

// POST /mascotas - Registrar una nueva mascota
app.post('/mascotas', async (req, res) => {
  try {
    const { nombre, especie, edad, peso } = req.body;
    if (!nombre || !especie || edad === undefined || peso === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, especie, edad, peso' });
    }
    const [result] = await pool.query(
      'INSERT INTO mascotas (nombre, especie, edad, peso) VALUES (?, ?, ?, ?)',
      [nombre, especie, edad, peso]
    );
    res.status(201).json({ id: result.insertId, nombre, especie, edad, peso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la mascota' });
  }
});

// PUT /mascotas/:id - Actualizar una mascota
app.put('/mascotas/:id', async (req, res) => {
  try {
    const { nombre, especie, edad, peso } = req.body;
    if (!nombre || !especie || edad === undefined || peso === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, especie, edad, peso' });
    }
    const [result] = await pool.query(
      'UPDATE mascotas SET nombre = ?, especie = ?, edad = ?, peso = ? WHERE id = ?',
      [nombre, especie, edad, peso, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json({ id: Number(req.params.id), nombre, especie, edad, peso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la mascota' });
  }
});

// DELETE /mascotas/:id - Eliminar una mascota
app.delete('/mascotas/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM mascotas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la mascota' });
  }
});

// Iniciar servidor después de conectar a la BD
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en el puerto ${PORT}`);
  });
});
