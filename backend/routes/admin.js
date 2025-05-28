const express = require('express')
const router = express.Router()
const pool = require('../db')
const { isAdmin } = require('../middleware/auth')
const bcrypt = require('bcrypt')

// Obtener lista de clientes
router.get('/clientes', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de clientes...')
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        nombre, 
        apellido, 
        correo, 
        telefono, 
        direccion, 
        departamento,
        ciudad,
        codigo_postal
      FROM clientes 
      ORDER BY id DESC
    `)
    console.log(`Clientes encontrados: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error detallado al obtener clientes:', error)
    res.status(500).json({ message: 'Error al obtener la lista de clientes' })
  }
})

// Obtener lista de pedidos estándar
router.get('/pedidos', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de pedidos estándar...')
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.cliente_id,
        COALESCE(p.producto_fabricacion_id, 0) as producto_fabricacion_id,
        COALESCE(p.cantidad, 0) as cantidad,
        COALESCE(p.fecha_pedido, CURRENT_TIMESTAMP) as fecha_pedido,
        COALESCE(p.estado_pedido, 'pendiente') as estado_pedido,
        CAST(COALESCE(p.total, 0) AS FLOAT) as total,
        p.pago_id,
        COALESCE(c.nombre, '') as cliente_nombre,
        COALESCE(c.apellido, '') as cliente_apellido,
        COALESCE(c.correo, '') as cliente_correo,
        COALESCE(pf.nombre, '') as nombre_producto
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
      ORDER BY p.fecha_pedido DESC
    `)
    console.log(`Pedidos estándar encontrados: ${result.rows.length}`)
    if (result.rows.length > 0) {
      console.log('Ejemplo de pedido estándar:', result.rows[0])
    }
    res.json(result.rows)
  } catch (error) {
    console.error('Error detallado al obtener pedidos estándar:', error)
    console.error('Stack trace:', error.stack)
    res.status(500).json({ message: 'Error al obtener la lista de pedidos' })
  }
})

// Obtener lista de pedidos personalizados
router.get('/pedidos-personalizados', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de pedidos personalizados...')
  try {
    // Primero verificar la estructura de la tabla
    console.log('Verificando estructura de la tabla pedidos_personalizados...')
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos_personalizados'
      ORDER BY ordinal_position
    `)
    console.log('Estructura de la tabla pedidos_personalizados:', JSON.stringify(tableInfo.rows, null, 2))

    // Verificar si hay datos en la tabla
    const countResult = await pool.query('SELECT COUNT(*) FROM pedidos_personalizados')
    console.log('Total de registros en pedidos_personalizados:', countResult.rows[0].count)

    // Obtener un ejemplo de registro para ver su estructura
    const sampleResult = await pool.query('SELECT * FROM pedidos_personalizados LIMIT 1')
    if (sampleResult.rows.length > 0) {
      console.log('Ejemplo de registro en pedidos_personalizados:', JSON.stringify(sampleResult.rows[0], null, 2))
    }

    const result = await pool.query(`
      SELECT 
        pp.id,
        pp.cliente_id,
        pp.pago_id,
        COALESCE(pp.fecha_creacion, CURRENT_TIMESTAMP) as fecha_creacion,
        COALESCE(pp.estado, 'pendiente') as estado_pedido,
        pp.color_principal,
        COALESCE(pp.color_secundario, '') as color_secundario,
        COALESCE(pp.color_terciario, '') as color_terciario,
        pp.estilo_color,
        pp.tipo_tejido,
        pp.tamanio,
        pp.tamanio_personalizado,
        pp.tipo_cierre,
        COALESCE(pp.dije, '') as dije,
        COALESCE(pp.tipo_mensaje, '') as tipo_mensaje,
        COALESCE(pp.mensaje_nombre, '') as mensaje_nombre,
        COALESCE(pp.mensaje_iniciales, '') as mensaje_iniciales,
        COALESCE(pp.mensaje_frase, '') as mensaje_frase,
        COALESCE(pp.accesorios, ARRAY[]::varchar[]) as accesorios,
        COALESCE(pp.ocasion_especial, '') as ocasion_especial,
        pp.producto_base_id,
        pp.precio_base,
        CAST(COALESCE(pp.precio_final, 0) AS FLOAT) as precio_final,
        COALESCE(pp.notas, '') as notas,
        COALESCE(c.nombre, '') as cliente_nombre,
        COALESCE(c.apellido, '') as cliente_apellido,
        COALESCE(c.correo, '') as cliente_correo,
        COALESCE(pp.estado_fabricacion, 'pendiente') as estado_fabricacion
      FROM pedidos_personalizados pp
      LEFT JOIN clientes c ON pp.cliente_id = c.id
      ORDER BY pp.fecha_creacion DESC
    `)
    console.log(`Pedidos personalizados encontrados: ${result.rows.length}`)
    if (result.rows.length > 0) {
      console.log('Primer pedido personalizado:', JSON.stringify(result.rows[0], null, 2))
    } else {
      console.log('No se encontraron pedidos personalizados')
    }
    res.json(result.rows)
  } catch (error) {
    console.error('Error detallado al obtener pedidos personalizados:', error)
    console.error('Stack trace:', error.stack)
    // Intentar obtener más información sobre el error
    if (error.position) {
      console.error('Posición del error en la consulta:', error.position)
      console.error('Código de error:', error.code)
      console.error('Detalles:', error.detail)
    }
    res.status(500).json({ 
      message: 'Error al obtener la lista de pedidos personalizados',
      details: error.message,
      code: error.code,
      position: error.position
    })
  }
})

// Obtener estadísticas del dashboard
router.get('/dashboard/stats', isAdmin, async (req, res) => {
  console.log('Obteniendo estadísticas del dashboard...')
  try {
    // Obtener total de clientes
    console.log('Consultando total de clientes...')
    const clientesResult = await pool.query('SELECT COUNT(*) FROM clientes')
    const totalClientes = parseInt(clientesResult.rows[0].count) || 0
    console.log(`Total de clientes: ${totalClientes}`)

    // Obtener estadísticas de pedidos estándar
    console.log('Consultando estadísticas de pedidos estándar...')
    const pedidosResult = await pool.query(`
      SELECT 
        COALESCE(COUNT(*), 0) as total,
        COALESCE(COUNT(CASE WHEN estado_pedido = 'pendiente' THEN 1 END), 0) as pendientes,
        COALESCE(SUM(total), 0) as ingresos
      FROM pedidos 
      WHERE fecha_pedido >= DATE_TRUNC('month', CURRENT_DATE)
    `)
    const { total: totalPedidos, pendientes: pedidosPendientes, ingresos: ingresosPedidos } = pedidosResult.rows[0]
    console.log('Estadísticas pedidos estándar:', { totalPedidos, pedidosPendientes, ingresosPedidos })

    // Obtener estadísticas de pedidos personalizados
    console.log('Consultando estadísticas de pedidos personalizados...')
    const pedidosPersonalizadosResult = await pool.query(`
      SELECT 
        COALESCE(COUNT(*), 0) as total,
        COALESCE(COUNT(CASE WHEN estado = 'pendiente' THEN 1 END), 0) as pendientes,
        COALESCE(SUM(precio_final), 0) as ingresos
      FROM pedidos_personalizados 
      WHERE fecha_creacion >= DATE_TRUNC('month', CURRENT_DATE)
    `)
    const { 
      total: totalPedidosPersonalizados, 
      pendientes: pedidosPersonalizadosPendientes,
      ingresos: ingresosPedidosPersonalizados 
    } = pedidosPersonalizadosResult.rows[0]

    // Calcular ingresos totales
    const ingresosTotales = parseFloat(ingresosPedidos || 0) + parseFloat(ingresosPedidosPersonalizados || 0)
    console.log('Ingresos totales:', ingresosTotales)

    const stats = {
      totalClientes,
      totalPedidos: parseInt(totalPedidos || 0),
      pedidosPendientes: parseInt(pedidosPendientes || 0),
      totalPedidosPersonalizados: parseInt(totalPedidosPersonalizados || 0),
      pedidosPersonalizadosPendientes: parseInt(pedidosPersonalizadosPendientes || 0),
      ingresosTotales
    }
    console.log('Estadísticas finales:', stats)
    res.json(stats)
  } catch (error) {
    console.error('Error detallado al obtener estadísticas:', error)
    res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' })
  }
})

// Obtener últimos pedidos
router.get('/dashboard/ultimos-pedidos', isAdmin, async (req, res) => {
  console.log('Obteniendo últimos pedidos para el dashboard...')
  try {
    // Obtener últimos pedidos estándar
    console.log('Consultando últimos pedidos estándar...')
    const pedidosResult = await pool.query(`
      SELECT 
        p.id,
        p.cliente_id,
        COALESCE(p.producto_fabricacion_id, 0) as producto_fabricacion_id,
        COALESCE(p.cantidad, 0) as cantidad,
        COALESCE(p.fecha_pedido, CURRENT_TIMESTAMP) as fecha_pedido,
        COALESCE(p.estado_pedido, 'pendiente') as estado,
        CAST(COALESCE(p.total, 0) AS FLOAT) as total,
        p.pago_id,
        COALESCE(c.nombre, '') as cliente_nombre,
        COALESCE(c.apellido, '') as cliente_apellido,
        'Estándar' as tipo
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.fecha_pedido DESC
      LIMIT 5
    `)
    console.log(`Pedidos estándar encontrados: ${pedidosResult.rows.length}`)
    if (pedidosResult.rows.length > 0) {
      console.log('Primer pedido estándar:', pedidosResult.rows[0])
    }

    // Obtener últimos pedidos personalizados
    console.log('Consultando últimos pedidos personalizados...')
    const pedidosPersonalizadosResult = await pool.query(`
      SELECT 
        pp.id,
        pp.cliente_id,
        pp.pago_id,
        COALESCE(pp.fecha_creacion, CURRENT_TIMESTAMP) as fecha_pedido,
        COALESCE(pp.estado, 'pendiente') as estado,
        CAST(COALESCE(pp.precio_final, 0) AS FLOAT) as total,
        COALESCE(c.nombre, '') as cliente_nombre,
        COALESCE(c.apellido, '') as cliente_apellido,
        'Personalizado' as tipo
      FROM pedidos_personalizados pp
      LEFT JOIN clientes c ON pp.cliente_id = c.id
      ORDER BY pp.fecha_creacion DESC
      LIMIT 5
    `)
    console.log(`Pedidos personalizados encontrados: ${pedidosPersonalizadosResult.rows.length}`)
    if (pedidosPersonalizadosResult.rows.length > 0) {
      console.log('Primer pedido personalizado:', pedidosPersonalizadosResult.rows[0])
    }

    // Combinar y ordenar todos los pedidos por fecha
    const todosLosPedidos = [
      ...pedidosResult.rows,
      ...pedidosPersonalizadosResult.rows
    ].sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
    .slice(0, 10)

    console.log(`Total de pedidos combinados: ${todosLosPedidos.length}`)
    if (todosLosPedidos.length > 0) {
      console.log('Primer pedido combinado:', todosLosPedidos[0])
    }
    res.json(todosLosPedidos)
  } catch (error) {
    console.error('Error detallado al obtener últimos pedidos:', error)
    console.error('Stack trace:', error.stack)
    res.status(500).json({ message: 'Error al obtener últimos pedidos' })
  }
})

// Obtener clientes recientes
router.get('/dashboard/clientes-recientes', isAdmin, async (req, res) => {
  console.log('Obteniendo clientes recientes...')
  try {
    const result = await pool.query(`
      SELECT 
        id,
        COALESCE(nombre, '') as nombre,
        COALESCE(apellido, '') as apellido,
        COALESCE(correo, '') as correo,
        id as fecha_creacion
      FROM clientes
      ORDER BY id DESC
      LIMIT 5
    `)
    console.log(`Clientes recientes encontrados: ${result.rows.length}`)
    if (result.rows.length > 0) {
      console.log('Primer cliente:', result.rows[0])
    }
    res.json(result.rows)
  } catch (error) {
    console.error('Error detallado al obtener clientes recientes:', error)
    res.status(500).json({ message: 'Error al obtener clientes recientes' })
  }
})

// Actualizar estado de fabricación de pedido estándar
router.patch('/pedidos/:id/estado-fabricacion', isAdmin, async (req, res) => {
  console.log('Actualizando estado de fabricación de pedido estándar...')
  const { id } = req.params
  const { estado_fabricacion } = req.body

  // Validar que el estado sea uno de los permitidos
  const estadosPermitidos = ['en fabricacion', 'en empaquetamiento', 'en proceso de entrega', 'entregado']
  if (!estadosPermitidos.includes(estado_fabricacion)) {
    return res.status(400).json({ 
      message: 'Estado de fabricación no válido',
      estadosPermitidos 
    })
  }

  try {
    const result = await pool.query(
      `UPDATE pedidos 
       SET estado_fabricacion = $1
       WHERE id = $2
       RETURNING id, estado_fabricacion`,
      [estado_fabricacion, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    console.log('Estado de fabricación actualizado:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar estado de fabricación:', error)
    res.status(500).json({ 
      message: 'Error al actualizar el estado de fabricación',
      details: error.message 
    })
  }
})

// Actualizar estado de fabricación de pedido personalizado
router.patch('/pedidos-personalizados/:id/estado-fabricacion', isAdmin, async (req, res) => {
  console.log('Actualizando estado de fabricación de pedido personalizado...')
  const { id } = req.params
  const { estado_fabricacion } = req.body

  // Validar que el estado sea uno de los permitidos
  const estadosPermitidos = ['en fabricacion', 'en empaquetamiento', 'en proceso de entrega', 'entregado']
  if (!estadosPermitidos.includes(estado_fabricacion)) {
    return res.status(400).json({ 
      message: 'Estado de fabricación no válido',
      estadosPermitidos 
    })
  }

  try {
    const result = await pool.query(
      `UPDATE pedidos_personalizados 
       SET estado_fabricacion = $1
       WHERE id = $2
       RETURNING id, estado_fabricacion`,
      [estado_fabricacion, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido personalizado no encontrado' })
    }

    console.log('Estado de fabricación actualizado:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar estado de fabricación:', error)
    res.status(500).json({ 
      message: 'Error al actualizar el estado de fabricación',
      details: error.message 
    })
  }
})

// Obtener lista de administradores
router.get('/administradores', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de administradores...')
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        nombre, 
        correo, 
        fecha_creacion
      FROM administradores 
      ORDER BY id DESC
    `)
    console.log(`Administradores encontrados: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener administradores:', error)
    res.status(500).json({ message: 'Error al obtener la lista de administradores' })
  }
})

// Crear nuevo administrador
router.post('/administradores', isAdmin, async (req, res) => {
  console.log('Creando nuevo administrador...')
  const { nombre, correo, contraseña } = req.body

  // Validar campos requeridos
  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ 
      message: 'Todos los campos son requeridos: nombre, correo y contraseña' 
    })
  }

  try {
    // Verificar si el correo ya existe
    const correoExistente = await pool.query(
      'SELECT id FROM administradores WHERE correo = $1',
      [correo]
    )

    if (correoExistente.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe un administrador con este correo electrónico' 
      })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10)

    // Crear el administrador
    const result = await pool.query(
      `INSERT INTO administradores (nombre, correo, contraseña, fecha_creacion) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, nombre, correo, fecha_creacion`,
      [nombre, correo, hashedPassword]
    )

    console.log('Administrador creado:', result.rows[0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al crear administrador:', error)
    res.status(500).json({ 
      message: 'Error al crear el administrador',
      details: error.message 
    })
  }
})

// Actualizar administrador
router.put('/administradores/:id', isAdmin, async (req, res) => {
  console.log('Actualizando administrador...')
  const { id } = req.params
  const { nombre, correo, contraseña } = req.body

  // Validar campos requeridos
  if (!nombre || !correo) {
    return res.status(400).json({ 
      message: 'Los campos nombre y correo son requeridos' 
    })
  }

  try {
    // Verificar si el correo ya existe (excluyendo el administrador actual)
    const correoExistente = await pool.query(
      'SELECT id FROM administradores WHERE correo = $1 AND id != $2',
      [correo, id]
    )

    if (correoExistente.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe otro administrador con este correo electrónico' 
      })
    }

    // Construir la consulta SQL dinámicamente
    let query = 'UPDATE administradores SET nombre = $1, correo = $2'
    const values = [nombre, correo]
    let paramIndex = 3

    // Solo actualizar contraseña si se proporciona
    if (contraseña) {
      query += `, contraseña = $${paramIndex}`
      values.push(contraseña)
      paramIndex++
    }

    query += ` WHERE id = $${paramIndex} RETURNING id, nombre, correo, fecha_creacion`
    values.push(id)

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    console.log('Administrador actualizado:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar administrador:', error)
    res.status(500).json({ 
      message: 'Error al actualizar el administrador',
      details: error.message 
    })
  }
})

// Eliminar administrador
router.delete('/administradores/:id', isAdmin, async (req, res) => {
  console.log('Eliminando administrador...')
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM administradores WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    console.log('Administrador eliminado:', result.rows[0])
    res.json({ message: 'Administrador eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar administrador:', error)
    res.status(500).json({ 
      message: 'Error al eliminar el administrador',
      details: error.message 
    })
  }
})

// Cambiar contraseña de administrador
router.put('/administradores/:id/password', isAdmin, async (req, res) => {
  console.log('Cambiando contraseña de administrador...')
  const { id } = req.params
  const { password } = req.body

  if (!password) {
    return res.status(400).json({ message: 'La contraseña es requerida' })
  }

  try {
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `UPDATE administradores 
       SET contraseña = $1
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    console.log('Contraseña actualizada para el administrador:', result.rows[0].id)
    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    res.status(500).json({ 
      message: 'Error al cambiar la contraseña',
      details: error.message 
    })
  }
})

// Obtener detalles de un pedido personalizado específico
router.get('/pedidos-personalizados/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  console.log('Obteniendo detalles del pedido personalizado:', id);

  try {
    const result = await pool.query(`
      SELECT 
        pp.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        p.estado as estado_pago,
        p.total as monto_pago,
        p.fecha as fecha_pago,
        COALESCE(pp.cantidad, 1) as cantidad
      FROM pedidos_personalizados pp
      JOIN clientes c ON pp.cliente_id = c.id
      JOIN pagos p ON pp.pago_id = p.id
      WHERE pp.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido personalizado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalles del pedido personalizado:', error);
    res.status(500).json({ message: 'Error al obtener los detalles del pedido personalizado' });
  }
});

// Obtener detalles de un pedido estándar específico
router.get('/pedidos/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  console.log('Obteniendo detalles del pedido estándar:', id);

  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        pf.nombre as nombre_producto,
        pf.color_principal,
        pf.color_secundario,
        pf.color_terciario,
        pf.tipo_nudo,
        pf.materiales,
        pf.cantidad_hilo_cm,
        pf.costo_fabricacion,
        pf.precio_venta,
        pf.observaciones,
        pa.estado as estado_pago,
        pa.total as monto_pago,
        pa.fecha as fecha_pago,
        p.estado_fabricacion
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
      JOIN pagos pa ON p.pago_id = pa.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido estándar no encontrado' });
    }

    console.log('Detalles del pedido estándar encontrados:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalles del pedido estándar:', error);
    res.status(500).json({ message: 'Error al obtener los detalles del pedido estándar' });
  }
});

// Obtener productos más vendidos
router.get('/dashboard/productos-mas-vendidos', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      WITH productos_vendidos AS (
        -- Productos de pedidos estándar
        SELECT 
          p.nombre,
          SUM(dp.cantidad) as cantidad
        FROM pedidos pe
        JOIN detalles_pedido dp ON pe.id = dp.pedido_id
        JOIN productos p ON dp.producto_id = p.id
        WHERE pe.estado_pago = 'pagado'
        AND pe.fecha_pedido >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY p.id, p.nombre
        
        UNION ALL
        
        -- Productos de pedidos personalizados
        SELECT 
          'Pedido Personalizado' as nombre,
          COUNT(*) as cantidad
        FROM pedidos_personalizados
        WHERE estado_pago = 'pagado'
        AND fecha_creacion >= DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT 
        nombre,
        SUM(cantidad) as cantidad
      FROM productos_vendidos
      GROUP BY nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `)

    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err)
    res.status(500).json({ message: 'Error al obtener productos más vendidos' })
  }
})

// Obtener lista de productos de fabricación
router.get('/productos-fabricacion', isAdmin, async (req, res) => {
  console.log('Obteniendo lista de productos de fabricación...')
  try {
    const result = await pool.query(`
      SELECT * FROM productos_fabricacion 
      ORDER BY id DESC
    `)
    console.log(`Productos de fabricación encontrados: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener productos de fabricación:', error)
    res.status(500).json({ message: 'Error al obtener la lista de productos de fabricación' })
  }
})

// Crear nuevo producto de fabricación
router.post('/productos-fabricacion', isAdmin, async (req, res) => {
  console.log('Creando nuevo producto de fabricación...')
  const {
    nombre,
    cantidad_hilo_cm,
    color_principal,
    color_secundario,
    color_terciario,
    tipo_nudo,
    materiales,
    costo_fabricacion,
    precio_venta,
    observaciones
  } = req.body

  // Validar campos requeridos
  if (!nombre || !cantidad_hilo_cm || !costo_fabricacion || !precio_venta) {
    return res.status(400).json({ 
      message: 'Los campos nombre, cantidad de hilo, costo y precio son requeridos' 
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO productos_fabricacion (
        nombre, cantidad_hilo_cm, color_principal, color_secundario,
        color_terciario, tipo_nudo, materiales, costo_fabricacion,
        precio_venta, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        nombre,
        cantidad_hilo_cm,
        color_principal || null,
        color_secundario || null,
        color_terciario || null,
        tipo_nudo || null,
        materiales || null,
        costo_fabricacion,
        precio_venta,
        observaciones || null
      ]
    )

    console.log('Producto de fabricación creado:', result.rows[0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al crear producto de fabricación:', error)
    res.status(500).json({ 
      message: 'Error al crear el producto de fabricación',
      details: error.message 
    })
  }
})

// Actualizar producto de fabricación
router.put('/productos-fabricacion/:id', isAdmin, async (req, res) => {
  console.log('Actualizando producto de fabricación...')
  const { id } = req.params
  const {
    nombre,
    cantidad_hilo_cm,
    color_principal,
    color_secundario,
    color_terciario,
    tipo_nudo,
    materiales,
    costo_fabricacion,
    precio_venta,
    observaciones
  } = req.body

  // Validar campos requeridos
  if (!nombre || !cantidad_hilo_cm || !costo_fabricacion || !precio_venta) {
    return res.status(400).json({ 
      message: 'Los campos nombre, cantidad de hilo, costo y precio son requeridos' 
    })
  }

  try {
    const result = await pool.query(
      `UPDATE productos_fabricacion 
       SET nombre = $1,
           cantidad_hilo_cm = $2,
           color_principal = $3,
           color_secundario = $4,
           color_terciario = $5,
           tipo_nudo = $6,
           materiales = $7,
           costo_fabricacion = $8,
           precio_venta = $9,
           observaciones = $10
       WHERE id = $11
       RETURNING *`,
      [
        nombre,
        cantidad_hilo_cm,
        color_principal || null,
        color_secundario || null,
        color_terciario || null,
        tipo_nudo || null,
        materiales || null,
        costo_fabricacion,
        precio_venta,
        observaciones || null,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto de fabricación no encontrado' })
    }

    console.log('Producto de fabricación actualizado:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar producto de fabricación:', error)
    res.status(500).json({ 
      message: 'Error al actualizar el producto de fabricación',
      details: error.message 
    })
  }
})

// Eliminar producto de fabricación
router.delete('/productos-fabricacion/:id', isAdmin, async (req, res) => {
  console.log('Eliminando producto de fabricación...')
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM productos_fabricacion WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto de fabricación no encontrado' })
    }

    console.log('Producto de fabricación eliminado:', result.rows[0])
    res.json({ message: 'Producto de fabricación eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar producto de fabricación:', error)
    res.status(500).json({ 
      message: 'Error al eliminar el producto de fabricación',
      details: error.message 
    })
  }
})

// Rutas para empleados
router.get('/empleados', isAdmin, async (req, res) => {
  try {
    console.log('Obteniendo lista de empleados...')
    const result = await pool.query('SELECT * FROM empleados ORDER BY id DESC')
    console.log(`${result.rows.length} empleados encontrados`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener empleados:', error)
    res.status(500).json({ error: 'Error al obtener empleados' })
  }
})

router.post('/empleados', isAdmin, async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo,
      direccion,
      fecha_inicio,
      fecha_fin,
      rol,
      estado,
      telefono,
      documento_identidad
    } = req.body

    // Validar campos requeridos
    if (!nombre || !apellido || !correo || !direccion || !fecha_inicio || !rol || !estado || !documento_identidad) {
      return res.status(400).json({ error: 'Todos los campos marcados con * son requeridos' })
    }

    // Validar que la fecha de finalización sea posterior a la fecha de inicio
    if (fecha_fin && new Date(fecha_fin) <= new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de finalización debe ser posterior a la fecha de inicio' })
    }

    console.log('Creando nuevo empleado...')
    const result = await pool.query(
      `INSERT INTO empleados (
        nombre, apellido, correo, direccion, fecha_inicio, fecha_fin,
        rol, estado, telefono, documento_identidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [nombre, apellido, correo, direccion, fecha_inicio, fecha_fin || null, rol, estado, telefono, documento_identidad]
    )

    console.log('Empleado creado exitosamente:', result.rows[0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al crear empleado:', error)
    res.status(500).json({ error: 'Error al crear empleado' })
  }
})

router.put('/empleados/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      apellido,
      correo,
      direccion,
      fecha_fin,
      rol,
      estado,
      telefono,
      documento_identidad
    } = req.body

    // Validar campos requeridos (excluyendo fecha_inicio)
    if (!nombre || !apellido || !correo || !direccion || !rol || !estado || !documento_identidad) {
      return res.status(400).json({ error: 'Todos los campos marcados con * son requeridos' })
    }

    // Obtener la fecha de inicio actual del empleado
    const empleadoActual = await pool.query('SELECT fecha_inicio FROM empleados WHERE id = $1', [id])
    if (empleadoActual.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' })
    }

    const fechaInicio = empleadoActual.rows[0].fecha_inicio

    // Validar que la fecha de finalización sea posterior a la fecha de inicio
    if (fecha_fin && new Date(fecha_fin) <= new Date(fechaInicio)) {
      return res.status(400).json({ error: 'La fecha de finalización debe ser posterior a la fecha de inicio' })
    }

    console.log(`Actualizando empleado ID: ${id}...`)
    const result = await pool.query(
      `UPDATE empleados SET
        nombre = $1,
        apellido = $2,
        correo = $3,
        direccion = $4,
        fecha_fin = $5,
        rol = $6,
        estado = $7,
        telefono = $8,
        documento_identidad = $9
      WHERE id = $10 RETURNING *`,
      [nombre, apellido, correo, direccion, fecha_fin || null, rol, estado, telefono, documento_identidad, id]
    )

    console.log('Empleado actualizado exitosamente:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar empleado:', error)
    res.status(500).json({ error: 'Error al actualizar empleado' })
  }
})

router.delete('/empleados/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    console.log(`Eliminando empleado ID: ${id}...`)

    const result = await pool.query('DELETE FROM empleados WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      console.log(`Empleado ID: ${id} no encontrado`)
      return res.status(404).json({ error: 'Empleado no encontrado' })
    }

    console.log('Empleado eliminado exitosamente')
    res.json({ message: 'Empleado eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar empleado:', error)
    res.status(500).json({ error: 'Error al eliminar empleado' })
  }
})

// Obtener todas las reseñas
router.get('/reseñas', isAdmin, async (req, res) => {
  console.log('Obteniendo todas las reseñas...')
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido
      FROM reseñas r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      ORDER BY r.fecha_creacion DESC
    `)
    console.log(`Reseñas encontradas: ${result.rows.length}`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener reseñas:', error)
    res.status(500).json({ message: 'Error al obtener las reseñas' })
  }
})

// Obtener estadísticas de reseñas
router.get('/reseñas/estadisticas', isAdmin, async (req, res) => {
  console.log('Obteniendo estadísticas de reseñas...')
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(calificacion) as promedio,
        COUNT(CASE WHEN calificacion = 5 THEN 1 END) as cinco_estrellas,
        COUNT(CASE WHEN calificacion = 4 THEN 1 END) as cuatro_estrellas,
        COUNT(CASE WHEN calificacion = 3 THEN 1 END) as tres_estrellas,
        COUNT(CASE WHEN calificacion = 2 THEN 1 END) as dos_estrellas,
        COUNT(CASE WHEN calificacion = 1 THEN 1 END) as una_estrella
      FROM reseñas
    `)
    console.log('Estadísticas de reseñas:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error)
    res.status(500).json({ message: 'Error al obtener estadísticas de reseñas' })
  }
})

// Obtener envíos en proceso
router.get('/envios', isAdmin, async (req, res) => {
  try {
    // Obtener pedidos normales en proceso de entrega
    const pedidosNormales = await pool.query(`
      SELECT 
        p.id,
        p.fecha_pedido,
        'normal' as tipo_pedido,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        c.direccion as cliente_direccion,
        c.departamento as cliente_departamento,
        c.ciudad as cliente_ciudad
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      WHERE p.estado_fabricacion = 'en proceso de entrega'
    `);

    // Obtener pedidos personalizados en proceso de entrega
    const pedidosPersonalizados = await pool.query(`
      SELECT 
        pp.id,
        pp.fecha_creacion as fecha_pedido,
        'personalizado' as tipo_pedido,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        c.direccion as cliente_direccion,
        c.departamento as cliente_departamento,
        c.ciudad as cliente_ciudad
      FROM pedidos_personalizados pp
      JOIN clientes c ON pp.cliente_id = c.id
      WHERE pp.estado_fabricacion = 'en proceso de entrega'
    `);

    // Combinar los resultados
    const envios = [...pedidosNormales.rows, ...pedidosPersonalizados.rows];

    res.json(envios);
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    res.status(500).json({ message: 'Error al obtener la lista de envíos' });
  }
});

module.exports = router 