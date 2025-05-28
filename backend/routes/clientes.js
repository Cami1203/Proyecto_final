const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

// Obtener perfil del cliente
router.get('/perfil', verificarToken, async (req, res) => {
    console.log('Obteniendo perfil del cliente:', req.user.id);
    try {
        const result = await pool.query(
            `SELECT 
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
            WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            console.log('Cliente no encontrado');
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        console.log('Perfil encontrado:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil del cliente' });
    }
});

// Actualizar perfil del cliente
router.put('/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, departamento, ciudad, codigo_postal } = req.body;

    // Verificar que el usuario está actualizando su propio perfil
    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil' });
    }

    try {
        const result = await pool.query(
            `UPDATE clientes 
            SET nombre = $1, 
                apellido = $2, 
                telefono = $3, 
                direccion = $4, 
                departamento = $5,
                ciudad = $6,
                codigo_postal = $7
            WHERE id = $8
            RETURNING id, nombre, apellido, correo, telefono, direccion, departamento, ciudad, codigo_postal`,
            [nombre, apellido, telefono, direccion, departamento, ciudad, codigo_postal, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
});

module.exports = router; 