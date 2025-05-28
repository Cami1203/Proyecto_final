const express = require('express')
const router = express.Router()
const pool = require('../db')
const { isAdmin } = require('../middleware/auth')

// Obtener lista de inventario
router.get('/', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de inventario...')
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        pf.nombre as nombre_producto,
        pf.color_principal,
        pf.color_secundario,
        pf.color_terciario
      FROM inventario i
      JOIN productos_fabricacion pf ON i.producto_id = pf.id
      ORDER BY i.id DESC
    `)
    console.log(`Productos en inventario encontrados: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener inventario:', error)
    res.status(500).json({ message: 'Error al obtener la lista de inventario' })
  }
})

// Obtener notificaciones de inventario
router.get('/notificaciones', isAdmin, async (req, res) => {
  console.log('Obteniendo notificaciones de inventario...')
  try {
    const result = await pool.query(`
      SELECT 
        n.*,
        i.nombre_producto,
        i.cantidad_actual,
        i.cantidad_minima
      FROM notificaciones_inventario n
      JOIN inventario i ON n.producto_id = i.producto_id
      WHERE n.leida = false
      ORDER BY n.fecha_creacion DESC
    `)
    console.log(`Notificaciones encontradas: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    res.status(500).json({ message: 'Error al obtener las notificaciones' })
  }
})

// Marcar notificación como leída
router.patch('/notificaciones/:id/leer', isAdmin, async (req, res) => {
  console.log('Marcando notificación como leída...')
  const { id } = req.params

  try {
    const result = await pool.query(
      `UPDATE notificaciones_inventario 
       SET leida = true
       WHERE id = $1
       RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' })
    }

    console.log('Notificación marcada como leída:', result.rows[0])
    res.json({ message: 'Notificación marcada como leída' })
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error)
    res.status(500).json({ 
      message: 'Error al marcar la notificación como leída',
      details: error.message 
    })
  }
})

// Actualizar stock de un producto
router.put('/:id/stock', isAdmin, async (req, res) => {
  console.log('Actualizando stock de producto...')
  const { id } = req.params
  const { cantidad_nueva } = req.body

  if (!cantidad_nueva || cantidad_nueva < 0) {
    return res.status(400).json({ 
      message: 'La cantidad debe ser un número positivo' 
    })
  }

  try {
    // Usar la función actualizar_stock_inventario
    const result = await pool.query(
      `SELECT actualizar_stock_inventario($1, $2) as success`,
      [id, cantidad_nueva]
    )

    if (!result.rows[0].success) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    // Obtener el producto actualizado
    const productoActualizado = await pool.query(`
      SELECT 
        i.*,
        pf.nombre as nombre_producto,
        pf.color_principal,
        pf.color_secundario,
        pf.color_terciario
      FROM inventario i
      JOIN productos_fabricacion pf ON i.producto_id = pf.id
      WHERE i.producto_id = $1
    `, [id])

    console.log('Stock actualizado:', productoActualizado.rows[0])
    res.json(productoActualizado.rows[0])
  } catch (error) {
    console.error('Error al actualizar stock:', error)
    res.status(500).json({ 
      message: 'Error al actualizar el stock',
      details: error.message 
    })
  }
})

// Actualizar cantidad mínima de un producto
router.put('/:id/cantidad-minima', isAdmin, async (req, res) => {
  console.log('Actualizando cantidad mínima de producto...')
  const { id } = req.params
  const { cantidad_minima } = req.body

  if (!cantidad_minima || cantidad_minima < 0) {
    return res.status(400).json({ 
      message: 'La cantidad mínima debe ser un número positivo' 
    })
  }

  try {
    const result = await pool.query(
      `UPDATE inventario 
       SET cantidad_minima = $1
       WHERE producto_id = $2
       RETURNING *`,
      [cantidad_minima, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    console.log('Cantidad mínima actualizada:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar cantidad mínima:', error)
    res.status(500).json({ 
      message: 'Error al actualizar la cantidad mínima',
      details: error.message 
    })
  }
})

module.exports = router 