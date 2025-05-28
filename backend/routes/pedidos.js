const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

// Crear un nuevo pedido
router.post('/', verificarToken, async (req, res) => {
    const { producto_fabricacion_id, cantidad, total, pago_id } = req.body;
    const cliente_id = req.user.id;

    console.log('Datos recibidos en /api/pedidos:', req.body);
    console.log('Cliente ID:', cliente_id);

    try {
        // Validar datos requeridos
        if (!producto_fabricacion_id || !cantidad || !total || !pago_id) {
            console.log('Faltan datos requeridos:', {
                producto_fabricacion_id,
                cantidad,
                total,
                pago_id
            });
            return res.status(400).json({ 
                message: 'Faltan datos requeridos',
                received: req.body
            });
        }

        // Verificar que el producto existe en productos_fabricacion
        const productoCheck = await pool.query(
            'SELECT * FROM productos_fabricacion WHERE id = $1',
            [producto_fabricacion_id]
        );

        console.log('Resultado de búsqueda de producto:', productoCheck.rows);

        if (productoCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Producto no encontrado en la base de datos',
                producto_id: producto_fabricacion_id
            });
        }

        // Verificar que el pago existe
        const pagoCheck = await pool.query(
            'SELECT * FROM pagos WHERE id = $1',
            [pago_id]
        );

        console.log('Resultado de búsqueda de pago:', pagoCheck.rows);

        if (pagoCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Pago no encontrado en la base de datos',
                pago_id: pago_id
            });
        }

        // Crear el pedido
        const pedidoQuery = `
            INSERT INTO pedidos 
            (cliente_id, producto_fabricacion_id, cantidad, total, pago_id, estado_pedido) 
            VALUES ($1, $2, $3, $4, $5, 'pendiente') 
            RETURNING *
        `;
        
        console.log('Query de inserción:', pedidoQuery);
        console.log('Valores a insertar:', [cliente_id, producto_fabricacion_id, cantidad, total, pago_id]);

        const result = await pool.query(pedidoQuery, 
            [cliente_id, producto_fabricacion_id, cantidad, total, pago_id]
        );

        console.log('Resultado de la inserción:', result.rows);

        // Obtener los detalles del producto para la respuesta
        const pedidoConDetalles = await pool.query(
            `SELECT p.*, pf.nombre as nombre_producto, pf.color_principal, 
                    pf.color_secundario, pf.color_terciario, pf.tipo_nudo, 
                    pf.materiales, pf.observaciones
             FROM pedidos p
             JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
             WHERE p.id = $1`,
            [result.rows[0].id]
        );

        console.log('Pedido con detalles:', pedidoConDetalles.rows[0]);

        res.status(201).json(pedidoConDetalles.rows[0]);
    } catch (error) {
        console.error('Error detallado al crear pedido:', {
            message: error.message,
            detail: error.detail,
            code: error.code,
            constraint: error.constraint
        });
        
        res.status(500).json({ 
            message: 'Error al crear el pedido',
            error: error.message,
            details: error.detail || 'No hay detalles adicionales',
            code: error.code,
            constraint: error.constraint
        });
    }
});

// Obtener todos los pedidos de un cliente
router.get('/mis-pedidos', verificarToken, async (req, res) => {
    const cliente_id = req.user.id;
    console.log('Obteniendo pedidos para cliente:', cliente_id);

    try {
        // Obtener pedidos normales
        const pedidosNormalesQuery = `
            SELECT 
                p.id,
                p.cliente_id,
                p.fecha_pedido,
                p.estado_pedido as estado,
                p.total,
                p.pago_id,
                p.cantidad,
                pf.nombre as nombre_producto,
                pa.estado as estado_pago,
                'normal' as tipo_pedido
             FROM pedidos p
             JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
             JOIN pagos pa ON p.pago_id = pa.id
             WHERE p.cliente_id = $1
        `;
        console.log('Query pedidos normales:', pedidosNormalesQuery);
        
        const pedidosNormales = await pool.query(pedidosNormalesQuery, [cliente_id]);
        console.log('Pedidos normales encontrados:', pedidosNormales.rows.length);
        if (pedidosNormales.rows.length > 0) {
            console.log('Ejemplo de pedido normal:', pedidosNormales.rows[0]);
        }

        // Obtener pedidos personalizados
        const pedidosPersonalizadosQuery = `
            SELECT 
                pp.id,
                pp.cliente_id,
                pp.fecha_creacion as fecha_pedido,
                COALESCE(pp.estado, 'pendiente') as estado_pedido,
                COALESCE(pp.precio_final, 0) as total,
                pp.pago_id,
                pp.cantidad,
                COALESCE(pb.nombre, 'Manilla Personalizada') as nombre_producto,
                COALESCE(pa.estado, 'pendiente') as estado_pago,
                'personalizado' as tipo_pedido
             FROM pedidos_personalizados pp
             LEFT JOIN pagos pa ON pp.pago_id = pa.id
             LEFT JOIN productos_base pb ON pp.producto_base_id = pb.id
             WHERE pp.cliente_id = $1
        `;
        console.log('Query pedidos personalizados:', pedidosPersonalizadosQuery);
        
        const pedidosPersonalizados = await pool.query(pedidosPersonalizadosQuery, [cliente_id]);
        console.log('Pedidos personalizados encontrados:', pedidosPersonalizados.rows.length);
        if (pedidosPersonalizados.rows.length > 0) {
            console.log('Ejemplo de pedido personalizado:', pedidosPersonalizados.rows[0]);
        }

        // Verificar si hay pedidos en la base de datos
        const totalPedidosNormales = await pool.query('SELECT COUNT(*) FROM pedidos WHERE cliente_id = $1', [cliente_id]);
        const totalPedidosPersonalizados = await pool.query('SELECT COUNT(*) FROM pedidos_personalizados WHERE cliente_id = $1', [cliente_id]);
        console.log('Total de pedidos normales en BD:', totalPedidosNormales.rows[0].count);
        console.log('Total de pedidos personalizados en BD:', totalPedidosPersonalizados.rows[0].count);

        // Combinar y ordenar todos los pedidos por fecha
        const todosLosPedidos = [
            ...pedidosNormales.rows,
            ...pedidosPersonalizados.rows
        ].sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido));

        console.log('Total de pedidos combinados:', todosLosPedidos.length);
        if (todosLosPedidos.length > 0) {
            console.log('Primer pedido en la lista:', todosLosPedidos[0]);
        }

        res.json(todosLosPedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        console.error('Detalles del error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({ 
            message: 'Error al obtener los pedidos',
            error: error.message
        });
    }
});

// Obtener detalles de un pedido específico
router.get('/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const cliente_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT p.*, pf.*, c.nombre as nombre_cliente, c.correo as correo_cliente
             FROM pedidos p
             JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
             JOIN clientes c ON p.cliente_id = c.id
             WHERE p.id = $1 AND p.cliente_id = $2`,
            [id, cliente_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener detalles del pedido:', error);
        res.status(500).json({ message: 'Error al obtener los detalles del pedido' });
    }
});

// Ruta para crear pedidos normales
router.post('/normal', verificarToken, async (req, res) => {
    console.log('Datos recibidos en /api/pedidos/normal:', req.body);

    try {
        const { producto_fabricacion_id, cantidad, total, pago_id } = req.body;

        // Validar datos requeridos
        if (!producto_fabricacion_id || !cantidad || !total || !pago_id) {
            console.log('Faltan datos requeridos:', {
                producto_fabricacion_id,
                cantidad,
                total,
                pago_id
            });
            return res.status(400).json({ 
                message: 'Faltan datos requeridos',
                received: req.body
            });
        }

        // Verificar que el producto existe
        const productoResult = await pool.query(
            'SELECT * FROM productos_fabricacion WHERE id = $1',
            [producto_fabricacion_id]
        );

        console.log('Resultado de búsqueda de producto:', productoResult.rows);

        if (productoResult.rows.length === 0) {
            return res.status(400).json({ 
                message: 'Producto no encontrado',
                producto_id: producto_fabricacion_id,
                query: 'SELECT * FROM productos_fabricacion WHERE id = $1'
            });
        }

        // Verificar que el pago existe
        const pagoResult = await pool.query(
            'SELECT * FROM pagos WHERE id = $1',
            [pago_id]
        );

        console.log('Resultado de búsqueda de pago:', pagoResult.rows);

        if (pagoResult.rows.length === 0) {
            return res.status(400).json({ 
                message: 'Pago no encontrado',
                pago_id: pago_id,
                query: 'SELECT * FROM pagos WHERE id = $1'
            });
        }

        // Crear el pedido
        const pedidoQuery = `
            INSERT INTO pedidos 
            (cliente_id, producto_fabricacion_id, cantidad, total, pago_id, estado_pedido) 
            VALUES ($1, $2, $3, $4, $5, 'pendiente') 
            RETURNING *
        `;
        
        console.log('Query de inserción:', pedidoQuery);
        console.log('Valores a insertar:', [req.user.id, producto_fabricacion_id, cantidad, total, pago_id]);

        const result = await pool.query(pedidoQuery, 
            [req.user.id, producto_fabricacion_id, cantidad, total, pago_id]
        );

        console.log('Resultado de la inserción:', result.rows);

        res.status(201).json({
            success: true,
            pedido: result.rows[0]
        });
    } catch (error) {
        console.error('Error detallado al crear pedido:', {
            message: error.message,
            detail: error.detail,
            code: error.code,
            constraint: error.constraint,
            stack: error.stack
        });
        
        res.status(500).json({ 
            message: 'Error al crear el pedido',
            error: error.message,
            details: error.detail || 'No hay detalles adicionales',
            code: error.code,
            constraint: error.constraint
        });
    }
});

// Crear un nuevo pago
router.post('/pago', verificarToken, async (req, res) => {
    const { total } = req.body;
    const cliente_id = req.user.id;

    console.log('Datos recibidos en /api/pedidos/pago:', req.body);
    console.log('Cliente ID:', cliente_id);

    try {
        // Validar datos requeridos
        if (!total) {
            console.log('Falta total en la petición');
            return res.status(400).json({ 
                message: 'Falta el total del pago',
                received: req.body
            });
        }

        // Crear el pago
        const pagoQuery = `
            INSERT INTO pagos 
            (cliente_id, total, estado) 
            VALUES ($1, $2, 'pendiente') 
            RETURNING *
        `;
        
        console.log('Query de inserción de pago:', pagoQuery);
        console.log('Valores a insertar:', [cliente_id, total]);

        const result = await pool.query(pagoQuery, [cliente_id, total]);

        console.log('Resultado de la inserción del pago:', result.rows);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error detallado al crear pago:', {
            message: error.message,
            detail: error.detail,
            code: error.code,
            constraint: error.constraint
        });
        
        res.status(500).json({ 
            message: 'Error al crear el pago',
            error: error.message,
            details: error.detail || 'No hay detalles adicionales',
            code: error.code,
            constraint: error.constraint
        });
    }
});

// Buscar pedido por ID (normal o personalizado)
router.get('/buscar/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const cliente_id = req.user.id;

    try {
        // Primero buscar en pedidos normales
        const pedidoNormal = await pool.query(
            `SELECT 
                p.*,
                pf.nombre as nombre_producto,
                pf.color_principal,
                pf.color_secundario,
                pf.color_terciario,
                'normal' as tipo_pedido
            FROM pedidos p
            JOIN productos_fabricacion pf ON p.producto_fabricacion_id = pf.id
            WHERE p.id = $1 AND p.cliente_id = $2`,
            [id, cliente_id]
        );

        if (pedidoNormal.rows.length > 0) {
            console.log('Pedido normal encontrado:', pedidoNormal.rows[0]);
            return res.json(pedidoNormal.rows[0]);
        }

        // Si no se encuentra en pedidos normales, buscar en pedidos personalizados
        const pedidoPersonalizado = await pool.query(
            `SELECT 
                pp.id,
                pp.cliente_id,
                pp.fecha_creacion as fecha_pedido,
                pp.precio_final as total,
                pp.estado as estado_pedido,
                pp.estado_fabricacion,
                pp.color_principal,
                pp.color_secundario,
                pp.color_terciario,
                pp.tipo_tejido,
                pp.tamanio,
                pp.tipo_cierre,
                pp.dije,
                pp.tipo_mensaje,
                pp.mensaje_nombre,
                pp.mensaje_iniciales,
                pp.mensaje_frase,
                pp.accesorios,
                pp.ocasion_especial,
                pp.notas,
                'personalizado' as tipo_pedido
            FROM pedidos_personalizados pp
            WHERE pp.id = $1 AND pp.cliente_id = $2`,
            [id, cliente_id]
        );

        if (pedidoPersonalizado.rows.length > 0) {
            console.log('Pedido personalizado encontrado:', pedidoPersonalizado.rows[0]);
            return res.json(pedidoPersonalizado.rows[0]);
        }

        // Si no se encuentra en ninguna tabla
        console.log('Pedido no encontrado');
        return res.status(404).json({ message: 'Pedido no encontrado' });
    } catch (error) {
        console.error('Error al buscar pedido:', error);
        res.status(500).json({ message: 'Error al buscar el pedido' });
    }
});

// Procesar pago de pedido personalizado
router.post('/pago/procesar-personalizado/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const cliente_id = req.user.id;

    console.log('Procesando pago de pedido personalizado:', id);
    console.log('Cliente ID:', cliente_id);

    try {
        // Verificar que el pedido personalizado existe y pertenece al cliente
        const pedidoCheck = await pool.query(
            `SELECT pp.*, p.estado as estado_pago 
             FROM pedidos_personalizados pp
             JOIN pagos p ON pp.pago_id = p.id
             WHERE pp.id = $1 AND pp.cliente_id = $2`,
            [id, cliente_id]
        );

        if (pedidoCheck.rows.length === 0) {
            console.log('Pedido personalizado no encontrado o no pertenece al cliente');
            return res.status(404).json({ 
                message: 'Pedido personalizado no encontrado',
                pedido_id: id
            });
        }

        const pedido = pedidoCheck.rows[0];

        // Verificar que el pago no esté ya procesado
        if (pedido.estado_pago === 'pagado') {
            console.log('El pago ya fue procesado anteriormente');
            return res.status(400).json({ 
                message: 'El pago ya fue procesado anteriormente',
                pedido_id: id
            });
        }

        // Actualizar el estado del pago
        const pagoResult = await pool.query(
            `UPDATE pagos 
             SET estado = 'pagado'
             WHERE id = $1
             RETURNING *`,
            [pedido.pago_id]
        );

        console.log('Pago actualizado:', pagoResult.rows[0]);

        // Actualizar el estado del pedido personalizado
        const pedidoResult = await pool.query(
            `UPDATE pedidos_personalizados 
             SET estado = 'en proceso'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        console.log('Pedido personalizado actualizado:', pedidoResult.rows[0]);

        res.json({
            success: true,
            message: 'Pago procesado exitosamente',
            pedido: pedidoResult.rows[0]
        });
    } catch (error) {
        console.error('Error al procesar pago de pedido personalizado:', error);
        res.status(500).json({ 
            message: 'Error al procesar el pago',
            error: error.message
        });
    }
});

// Crear pedido personalizado
router.post('/personalizados', verificarToken, async (req, res) => {
    try {
        const cliente_id = req.user.id;
        const {
            color_principal,
            color_secundario,
            color_terciario,
            estilo_color,
            tipo_tejido,
            tamanio,
            tamanio_personalizado,
            tipo_cierre,
            dije,
            tipo_mensaje,
            mensaje_nombre,
            mensaje_iniciales,
            mensaje_frase,
            accesorios,
            ocasion_especial,
            producto_base_id,
            precio_base,
            precio_final,
            notas,
            pago_id,
            cantidad
        } = req.body;

        console.log('Datos recibidos en /api/pedidos/personalizados:', req.body);
        console.log('Cliente ID:', cliente_id);
        console.log('Cantidad recibida:', cantidad);

        // Validar datos requeridos
        if (!color_principal || !tipo_tejido || !tamanio || !pago_id || !precio_final) {
            console.log('Faltan datos requeridos:', {
                color_principal,
                tipo_tejido,
                tamanio,
                pago_id,
                precio_final
            });
            return res.status(400).json({ 
                message: 'Faltan datos requeridos',
                received: req.body
            });
        }

        // Verificar que el pago existe
        const pagoCheck = await pool.query(
            'SELECT * FROM pagos WHERE id = $1',
            [pago_id]
        );

        console.log('Resultado de búsqueda de pago:', pagoCheck.rows);

        if (pagoCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Pago no encontrado',
                pago_id: pago_id
            });
        }

        // Crear el pedido personalizado
        const pedidoQuery = `
            INSERT INTO pedidos_personalizados 
            (cliente_id, color_principal, color_secundario, color_terciario,
             estilo_color, tipo_tejido, tamanio, tamanio_personalizado,
             tipo_cierre, dije, tipo_mensaje, mensaje_nombre,
             mensaje_iniciales, mensaje_frase, accesorios,
             ocasion_especial, producto_base_id, precio_base, precio_final,
             notas, pago_id, estado, cantidad)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'pendiente', $22)
            RETURNING *
        `;
        
        console.log('Query de inserción:', pedidoQuery);
        console.log('Valores a insertar:', [
            cliente_id, color_principal, color_secundario, color_terciario,
            estilo_color, tipo_tejido, tamanio, tamanio_personalizado,
            tipo_cierre, dije, tipo_mensaje, mensaje_nombre,
            mensaje_iniciales, mensaje_frase, accesorios,
            ocasion_especial, producto_base_id, precio_base, precio_final,
            notas, pago_id, cantidad || 1
        ]);

        const result = await pool.query(pedidoQuery, [
            cliente_id, color_principal, color_secundario, color_terciario,
            estilo_color, tipo_tejido, tamanio, tamanio_personalizado,
            tipo_cierre, dije, tipo_mensaje, mensaje_nombre,
            mensaje_iniciales, mensaje_frase, accesorios,
            ocasion_especial, producto_base_id, precio_base, precio_final,
            notas, pago_id, cantidad || 1
        ]);

        console.log('Resultado de la inserción:', result.rows);

        res.status(201).json({
            success: true,
            pedido: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear pedido personalizado:', error);
        res.status(500).json({ 
            message: 'Error al crear el pedido personalizado',
            error: error.message
        });
    }
});

// Actualizar estado de pago (pagar)
router.post('/pago/procesar/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const cliente_id = req.user.id;

    console.log('Procesando pago para pedido:', { id, cliente_id });

    try {
        // Verificar que el pedido existe y pertenece al cliente
        const pedidoCheck = await pool.query(
            `SELECT 
                p.id,
                p.cliente_id,
                p.estado_pedido as estado,
                p.pago_id,
                pa.estado as estado_pago,
                'normal' as tipo_pedido
             FROM pedidos p
             JOIN pagos pa ON p.pago_id = pa.id
             WHERE p.id = $1 AND p.cliente_id = $2
             UNION ALL
             SELECT 
                pp.id,
                pp.cliente_id,
                pp.estado as estado,
                pp.pago_id,
                pa.estado as estado_pago,
                'personalizado' as tipo_pedido
             FROM pedidos_personalizados pp
             JOIN pagos pa ON pp.pago_id = pa.id
             WHERE pp.id = $1 AND pp.cliente_id = $2`,
            [id, cliente_id]
        );

        console.log('Resultado de búsqueda de pedido:', pedidoCheck.rows);

        if (pedidoCheck.rows.length === 0) {
            console.log('Pedido no encontrado');
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const pedido = pedidoCheck.rows[0];
        console.log('Pedido encontrado:', pedido);

        // Verificar que el pago no esté ya procesado
        if (pedido.estado_pago === 'pagado') {
            console.log('El pago ya fue procesado anteriormente');
            return res.status(400).json({ message: 'El pago ya fue procesado anteriormente' });
        }

        // Actualizar el estado del pago
        const pagoResult = await pool.query(
            `UPDATE pagos 
             SET estado = 'pagado'
             WHERE id = $1
             RETURNING *`,
            [pedido.pago_id]
        );

        console.log('Pago actualizado:', pagoResult.rows[0]);

        // Actualizar el estado del pedido según su tipo
        if (pedido.tipo_pedido === 'normal') {
            const pedidoResult = await pool.query(
                `UPDATE pedidos 
                 SET estado_pedido = 'en proceso'
                 WHERE id = $1
                 RETURNING *`,
                [id]
            );
            console.log('Pedido normal actualizado:', pedidoResult.rows[0]);
        } else {
            const pedidoResult = await pool.query(
                `UPDATE pedidos_personalizados 
                 SET estado = 'en proceso'
                 WHERE id = $1
                 RETURNING *`,
                [id]
            );
            console.log('Pedido personalizado actualizado:', pedidoResult.rows[0]);
        }

        res.json({ 
            success: true, 
            message: 'Pago procesado exitosamente',
            pago: pagoResult.rows[0]
        });
    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({ message: 'Error al procesar el pago' });
    }
});

// Cancelar pedido
router.post('/pago/cancelar', verificarToken, async (req, res) => {
    const { pago_id } = req.body;
    const cliente_id = req.user.id;

    try {
        // Verificar que el pago existe y pertenece al cliente
        const pagoCheck = await pool.query(
            `SELECT pa.*, 
                    p.id as pedido_id, 
                    p.tipo_pedido,
                    pp.id as pedido_personalizado_id
             FROM pagos pa
             LEFT JOIN (
                SELECT id, pago_id, 'normal' as tipo_pedido 
                FROM pedidos 
                WHERE cliente_id = $2
             ) p ON p.pago_id = pa.id
             LEFT JOIN (
                SELECT id, pago_id, 'personalizado' as tipo_pedido 
                FROM pedidos_personalizados 
                WHERE cliente_id = $2
             ) pp ON pp.pago_id = pa.id
             WHERE pa.id = $1 
             AND (p.id IS NOT NULL OR pp.id IS NOT NULL)`,
            [pago_id, cliente_id]
        );

        if (pagoCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        const pago = pagoCheck.rows[0];

        // Verificar que el pago no esté ya cancelado o pagado
        if (pago.estado === 'cancelado') {
            return res.status(400).json({ message: 'El pedido ya está cancelado' });
        }
        if (pago.estado === 'pagado') {
            return res.status(400).json({ message: 'No se puede cancelar un pedido ya pagado' });
        }

        // Actualizar el estado del pago
        const pagoResult = await pool.query(
            `UPDATE pagos 
             SET estado = 'cancelado'
             WHERE id = $1
             RETURNING *`,
            [pago_id]
        );

        // Actualizar el estado del pedido según su tipo
        if (pago.pedido_id) {
            await pool.query(
                `UPDATE pedidos 
                 SET estado_pedido = 'cancelado'
                 WHERE id = $1`,
                [pago.pedido_id]
            );
        } else if (pago.pedido_personalizado_id) {
            await pool.query(
                `UPDATE pedidos_personalizados 
                 SET estado = 'cancelado'
                 WHERE id = $1`,
                [pago.pedido_personalizado_id]
            );
        }

        console.log('Pago y pedido cancelados:', pagoResult.rows[0]);

        res.json({ 
            success: true, 
            message: 'Pedido cancelado exitosamente',
            pago: pagoResult.rows[0]
        });
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({ message: 'Error al cancelar el pedido' });
    }
});

module.exports = router; 