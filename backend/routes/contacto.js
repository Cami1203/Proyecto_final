const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear mensaje de contacto
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            email,
            asunto,
            tipo_pedido,
            pedido_id,
            mensaje
        } = req.body;

        console.log('Datos recibidos en /api/contacto:', {
            nombre,
            email,
            asunto,
            tipo_pedido,
            pedido_id,
            mensaje: mensaje?.substring(0, 50) + '...'
        });

        // Validación básica
        if (!nombre || !email || !asunto || !mensaje) {
            console.log('Faltan datos básicos:', { nombre, email, asunto, mensaje: mensaje?.substring(0, 50) });
            return res.status(400).json({ 
                message: 'Faltan datos requeridos',
                received: req.body
            });
        }

        // Si es un mensaje sobre pedidos, validar campos adicionales
        if (asunto === 'pedidos') {
            console.log('Procesando mensaje de pedidos...');
            
            if (!pedido_id || !tipo_pedido) {
                console.log('Faltan datos del pedido:', { pedido_id, tipo_pedido });
                return res.status(400).json({ 
                    message: 'Para mensajes sobre pedidos, se requiere el ID del pedido y el motivo',
                    received: req.body
                });
            }

            // Validar que el motivo sea uno de los permitidos
            const motivosPermitidos = ['no_llego', 'defectuoso', 'incorrecto', 'garantia', 'otra_situacion'];
            if (!motivosPermitidos.includes(tipo_pedido)) {
                console.log('Motivo no válido:', tipo_pedido);
                return res.status(400).json({ 
                    message: 'El motivo especificado no es válido',
                    motivo: tipo_pedido,
                    motivos_permitidos: motivosPermitidos
                });
            }

            console.log('Verificando existencia del pedido:', { pedido_id });

            // Obtener un cliente de la pool
            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // Limpiar el ID del pedido de espacios en blanco
                const pedidoIdLimpio = pedido_id.trim();
                let pedidoExiste = false;
                let tipo_pedido_referencia = null;
                let pedido_normal_id = null;
                let pedido_personalizado_id = null;

                // Verificar en pedidos normales
                const pedidoNormal = await client.query(
                    'SELECT id FROM pedidos WHERE id = $1',
                    [pedidoIdLimpio]
                );

                if (pedidoNormal.rows.length > 0) {
                    pedidoExiste = true;
                    tipo_pedido_referencia = 'normal';
                    pedido_normal_id = pedidoIdLimpio;
                } else {
                    // Verificar en pedidos personalizados
                    const pedidoPersonalizado = await client.query(
                        'SELECT id FROM pedidos_personalizados WHERE id = $1',
                        [pedidoIdLimpio]
                    );

                    if (pedidoPersonalizado.rows.length > 0) {
                        pedidoExiste = true;
                        tipo_pedido_referencia = 'personalizado';
                        pedido_personalizado_id = pedidoIdLimpio;
                    }
                }

                if (!pedidoExiste) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ 
                        message: 'El ID del pedido no existe',
                        pedido_id: pedidoIdLimpio
                    });
                }

                // Insertar el mensaje con todos los datos
                const insertResult = await client.query(
                    `INSERT INTO mensajes_clientes 
                    (nombre, email, asunto, motivo, mensaje, fecha_envio, estado, 
                     pedido_normal_id, pedido_personalizado_id, tipo_pedido_referencia)
                    VALUES ($1, $2, $3, $4, $5, NOW(), 'pendiente', $6, $7, $8)
                    RETURNING *`,
                    [nombre, email, asunto, tipo_pedido, mensaje, 
                     pedido_normal_id, pedido_personalizado_id, tipo_pedido_referencia]
                );

                await client.query('COMMIT');

                console.log('Mensaje de pedido guardado exitosamente:', {
                    id: insertResult.rows[0].id,
                    pedido_normal_id: insertResult.rows[0].pedido_normal_id,
                    pedido_personalizado_id: insertResult.rows[0].pedido_personalizado_id,
                    tipo_pedido_referencia: insertResult.rows[0].tipo_pedido_referencia,
                    motivo: insertResult.rows[0].motivo
                });

                return res.status(201).json({ 
                    success: true, 
                    message: 'Mensaje enviado correctamente',
                    data: insertResult.rows[0]
                });

            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error en la transacción:', error);
                throw error;
            } finally {
                client.release();
            }
        }

        // Para otros tipos de mensajes
        console.log('Procesando mensaje de tipo:', asunto);
        const result = await pool.query(
            `INSERT INTO mensajes_clientes 
            (nombre, email, asunto, motivo, mensaje, fecha_envio, estado)
            VALUES ($1, $2, $3, $4, $5, NOW(), 'pendiente')
            RETURNING *`,
            [nombre, email, asunto, asunto, mensaje]
        );

        console.log('Mensaje guardado exitosamente:', {
            id: result.rows[0].id,
            asunto: result.rows[0].asunto
        });

        res.status(201).json({ 
            success: true, 
            message: 'Mensaje enviado correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al guardar mensaje de contacto:', {
            message: error.message,
            detail: error.detail,
            code: error.code,
            constraint: error.constraint,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error al guardar el mensaje',
            error: error.message,
            details: error.detail || 'No hay detalles adicionales'
        });
    }
});

// Obtener mensajes (para el admin, de acuerdo a lo definido)
router.get('/', async (req, res) => {
    try {
        const { motivo, estado } = req.query;
        let query = 'SELECT * FROM mensajes_clientes WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (motivo) {
            query += ` AND motivo = $${paramCount}`;
            params.push(motivo);
            paramCount++;
        }

        if (estado) {
            query += ` AND estado = $${paramCount}`;
            params.push(estado);
            paramCount++;
        }

        query += ' ORDER BY fecha_envio DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ 
            message: 'Error al obtener los mensajes',
            error: error.message
        });
    }
});

// Actualizar estado del mensaje (para el admin)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ 
                message: 'El estado es requerido'
            });
        }

        const result = await pool.query(
            'UPDATE mensajes_clientes SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Mensaje no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar estado del mensaje:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el estado del mensaje',
            error: error.message
        });
    }
});

module.exports = router; 