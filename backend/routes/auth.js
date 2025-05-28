const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Log when the route is being registered
console.log('Configurando ruta POST /registro en el router de auth');

router.post('/registro', async (req, res) => {
  console.log('Recibida petición POST /registro');
  try {
    const {
      nombre,
      apellido,
      correo,
      telefono,
      fecha_nacimiento,
      direccion,
      departamento,
      ciudad,
      codigo_postal,
      contraseña
    } = req.body;

    // Log received data (excluding password)
    console.log('Datos recibidos:', {
      nombre,
      apellido,
      correo,
      telefono,
      fecha_nacimiento,
      direccion,
      departamento,
      ciudad,
      codigo_postal
    });

    // Verify if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM clientes WHERE correo = $1',
      [correo]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insert new client
    const insertQuery = `
      INSERT INTO clientes (
        nombre, 
        apellido, 
        correo, 
        telefono, 
        fecha_nacimiento, 
        direccion, 
        departamento,
        ciudad,
        codigo_postal, 
        contraseña
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;

    const result = await pool.query(
      insertQuery,
      [
        nombre,
        apellido,
        correo,
        telefono,
        fecha_nacimiento,
        direccion,
        departamento,
        ciudad,
        codigo_postal,
        hashedPassword
      ]
    );

    // Return success without including password
    const { contraseña: _, ...userData } = result.rows[0];
    console.log('Usuario registrado exitosamente:', userData);
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userData
    });
  } catch (error) {
    console.error('Error detallado en registro:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
      constraint: error.constraint,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Error al registrar usuario',
      error: error.message,
      detail: error.detail || 'No hay detalles adicionales'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    console.log('Intento de login para:', correo);

    // Primero buscar en la tabla de administradores
    const adminResult = await pool.query(
      'SELECT * FROM administradores WHERE correo = $1',
      [correo]
    );
    console.log('Resultado búsqueda admin:', adminResult.rows.length > 0 ? 'Encontrado' : 'No encontrado');

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log('Verificando contraseña de admin...');
      // Verificar contraseña del administrador
      const validPassword = await bcrypt.compare(contraseña, admin.contraseña);
      console.log('Contraseña admin válida:', validPassword);
      
      if (!validPassword) {
        console.log('Contraseña de admin inválida');
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token para administrador
      const token = jwt.sign(
        { 
          id: admin.id, 
          correo: admin.correo,
          isAdmin: true 
        },
        process.env.JWT_SECRET || 'tu_secreto_temporal',
        { expiresIn: '24h' }
      );

      // Retornar datos del administrador sin la contraseña
      const { contraseña: _, ...adminData } = admin;
      console.log('Login exitoso como admin');
      res.json({
        success: true,
        user: { ...adminData, isAdmin: true },
        token
      });
      return;
    }

    // Si no es administrador, buscar en la tabla de clientes
    console.log('Buscando en tabla de clientes...');
    const clientResult = await pool.query(
      'SELECT * FROM clientes WHERE correo = $1',
      [correo]
    );
    console.log('Resultado búsqueda cliente:', clientResult.rows.length > 0 ? 'Encontrado' : 'No encontrado');

    if (clientResult.rows.length === 0) {
      console.log('Cliente no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = clientResult.rows[0];
    console.log('Verificando contraseña de cliente...');
    console.log('Hash almacenado:', user.contraseña);

    // Verificar si la contraseña está hasheada (las contraseñas hasheadas siempre empiezan con $2b$)
    const isHashed = user.contraseña.startsWith('$2b$');
    let validPassword = false;

    if (isHashed) {
      // Si está hasheada, comparar normalmente
      validPassword = await bcrypt.compare(contraseña, user.contraseña);
    } else {
      // Si no está hasheada, verificar si coincide directamente
      validPassword = contraseña === user.contraseña;
      
      // Si coincide, actualizar la contraseña con hash
      if (validPassword) {
        console.log('Actualizando contraseña sin hash a hash...');
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        await pool.query(
          'UPDATE clientes SET contraseña = $1 WHERE id = $2',
          [hashedPassword, user.id]
        );
        console.log('Contraseña actualizada con hash exitosamente');
      }
    }

    console.log('Contraseña cliente válida:', validPassword);
    
    if (!validPassword) {
      console.log('Contraseña de cliente inválida');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token para cliente
    const token = jwt.sign(
      { 
        id: user.id, 
        correo: user.correo,
        isAdmin: false 
      },
      process.env.JWT_SECRET || 'tu_secreto_temporal',
      { expiresIn: '24h' }
    );

    // Retornar datos del cliente sin la contraseña
    const { contraseña: _, ...userData } = user;
    console.log('Login exitoso como cliente');
    res.json({
      success: true,
      user: { ...userData, isAdmin: false },
      token
    });
  } catch (error) {
    console.error('Error detallado en login:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      details: error.message 
    });
  }
});

// Ruta temporal para actualizar contraseña con hash
router.post('/actualizar-contraseña', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    console.log('Actualizando contraseña para:', correo);

    // Verificar si el usuario existe
    const userResult = await pool.query(
      'SELECT * FROM clientes WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Actualizar la contraseña en la base de datos
    await pool.query(
      'UPDATE clientes SET contraseña = $1 WHERE correo = $2',
      [hashedPassword, correo]
    );

    console.log('Contraseña actualizada exitosamente');
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
});

// Generar código de recuperación
router.post('/recuperar-password', async (req, res) => {
  console.log('Recibida solicitud de recuperación de contraseña')
  const { correo } = req.body

  if (!correo) {
    return res.status(400).json({ message: 'El correo es requerido' })
  }

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query(
      'SELECT id FROM clientes WHERE correo = $1',
      [correo]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo electrónico' })
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const fechaExpiracion = new Date(Date.now() + 30 * 60000) // 30 minutos

    // Guardar el código en la base de datos
    await pool.query(
      `UPDATE clientes 
       SET codigo_recuperacion = $1, 
           fecha_expiracion_codigo = $2
       WHERE correo = $3`,
      [codigo, fechaExpiracion, correo]
    )

    console.log('Código de recuperación generado para:', correo)
    res.json({ 
      message: 'Código de recuperación generado',
      codigo // En producción, esto debería enviarse por email
    })
  } catch (error) {
    console.error('Error al generar código de recuperación:', error)
    res.status(500).json({ message: 'Error al generar el código de recuperación' })
  }
})

// Verificar código y cambiar contraseña
router.post('/verificar-codigo', async (req, res) => {
  console.log('Verificando código de recuperación')
  const { correo, codigo, nueva_password } = req.body

  console.log('Datos recibidos:', { correo, codigo, nueva_password_length: nueva_password?.length })

  if (!correo || !codigo || !nueva_password) {
    return res.status(400).json({ 
      message: 'Todos los campos son requeridos: correo, código y nueva contraseña' 
    })
  }

  try {
    // Primero verificar si el usuario existe y tiene un código
    const userCheck = await pool.query(
      `SELECT id, codigo_recuperacion, fecha_expiracion_codigo 
       FROM clientes 
       WHERE correo = $1`,
      [correo]
    )

    console.log('Resultado de búsqueda de usuario:', {
      existe: userCheck.rows.length > 0,
      codigo_guardado: userCheck.rows[0]?.codigo_recuperacion,
      fecha_expiracion: userCheck.rows[0]?.fecha_expiracion_codigo,
      codigo_recibido: codigo
    })

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Verificar manualmente cada condición
    const codigoCoincide = userCheck.rows[0].codigo_recuperacion === codigo
    const fechaExpiracion = new Date(userCheck.rows[0].fecha_expiracion_codigo)
    const fechaActual = new Date()
    const codigoNoExpirado = fechaExpiracion > fechaActual

    console.log('Verificación detallada:', {
      codigoCoincide,
      fechaExpiracion: fechaExpiracion.toISOString(),
      fechaActual: fechaActual.toISOString(),
      codigoNoExpirado,
      diferenciaMinutos: (fechaExpiracion - fechaActual) / (1000 * 60)
    })

    if (!codigoCoincide) {
      return res.status(400).json({ 
        message: 'Código incorrecto' 
      })
    }

    if (!codigoNoExpirado) {
      return res.status(400).json({ 
        message: 'El código ha expirado' 
      })
    }

    // Si llegamos aquí, el código es válido
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_password, 10)

    // Actualizar la contraseña y limpiar el código de recuperación
    await pool.query(
      `UPDATE clientes 
       SET contraseña = $1,
           codigo_recuperacion = NULL,
           fecha_expiracion_codigo = NULL
       WHERE correo = $2`,
      [hashedPassword, correo]
    )

    console.log('Contraseña actualizada exitosamente para:', correo)
    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error al verificar código y cambiar contraseña:', error)
    res.status(500).json({ message: 'Error al cambiar la contraseña' })
  }
})

// Ruta para cambiar contraseña
router.put('/cambiar-password', async (req, res) => {
  const { correo, contraseña_actual, nueva_contraseña } = req.body;

  if (!correo || !contraseña_actual || !nueva_contraseña) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Buscar el usuario
    const userResult = await pool.query(
      'SELECT * FROM clientes WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Verificar si la contraseña está hasheada
    const isHashed = user.contraseña.startsWith('$2b$');
    let validPassword = false;

    if (isHashed) {
      // Si está hasheada, comparar con bcrypt
      validPassword = await bcrypt.compare(contraseña_actual, user.contraseña);
    } else {
      // Si no está hasheada, comparar directamente
      validPassword = contraseña_actual === user.contraseña;
    }

    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contraseña, 10);

    // Actualizar la contraseña
    await pool.query(
      'UPDATE clientes SET contraseña = $1 WHERE correo = $2',
      [hashedPassword, correo]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
});

module.exports = router; 