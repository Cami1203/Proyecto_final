const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las reseñas
router.get('/', async (req, res) => {
  console.log('GET /reseñas - Obteniendo todas las reseñas');
  try {
    const result = await pool.query('SELECT * FROM reseñas ORDER BY fecha_creacion DESC');
    console.log('Reseñas encontradas:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
});

// Obtener estadísticas de reseñas
router.get('/estadisticas', async (req, res) => {
  console.log('GET /reseñas/estadisticas - Obteniendo estadísticas');
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reseñas,
        ROUND(AVG(calificacion_diseno), 1) as promedio_diseno,
        ROUND(AVG(calificacion_usabilidad), 1) as promedio_usabilidad,
        ROUND(AVG(calificacion_contenido), 1) as promedio_contenido,
        ROUND(AVG(calificacion_velocidad), 1) as promedio_velocidad
      FROM reseñas
    `);
    console.log('Estadísticas obtenidas:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});

// Enviar reseña
router.post('/', async (req, res) => {
  console.log('POST /reseñas - Recibiendo nueva reseña:', req.body);
  try {
    const {
      calificacion_diseno,
      calificacion_usabilidad,
      calificacion_contenido,
      calificacion_velocidad,
      comentario
    } = req.body;

    // Validar que las calificaciones estén entre 1 y 5
    if (!calificacion_diseno || !calificacion_usabilidad || !calificacion_contenido || !calificacion_velocidad) {
      console.log('Error: Faltan calificaciones requeridas');
      return res.status(400).json({
        success: false,
        message: 'Todas las calificaciones son requeridas'
      });
    }

    // Validar que las calificaciones estén en el rango correcto
    if (
      calificacion_diseno < 1 || calificacion_diseno > 5 ||
      calificacion_usabilidad < 1 || calificacion_usabilidad > 5 ||
      calificacion_contenido < 1 || calificacion_contenido > 5 ||
      calificacion_velocidad < 1 || calificacion_velocidad > 5
    ) {
      console.log('Error: Calificaciones fuera de rango');
      return res.status(400).json({
        success: false,
        message: 'Las calificaciones deben estar entre 1 y 5'
      });
    }

    const result = await pool.query(`
      INSERT INTO reseñas (
        calificacion_diseno,
        calificacion_usabilidad,
        calificacion_contenido,
        calificacion_velocidad,
        comentario
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      calificacion_diseno,
      calificacion_usabilidad,
      calificacion_contenido,
      calificacion_velocidad,
      comentario || null
    ]);

    console.log('Reseña guardada exitosamente:', result.rows[0]);
    res.status(201).json({
      success: true,
      message: 'Reseña enviada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar la reseña'
    });
  }
});

module.exports = router; 