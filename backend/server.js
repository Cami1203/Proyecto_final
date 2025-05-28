const express = require('express');
const cors = require('cors');
const db = require('./db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const PORT = 3000;
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Configuración de CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas de autenticación
app.use('/api', authRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  try {
    // Manejar autenticación básica
    const base64Credentials = authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [correo, token] = credentials.split(':');

    console.log('Intentando autenticar con:', { correo, token });

    const result = await db.query(
      'SELECT id FROM clientes WHERE correo = $1 AND contraseña = $2',
      [correo, token]
    );
    
    if (result.rows.length === 0) {
      console.log('Credenciales inválidas para:', correo);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    req.cliente_id = result.rows[0].id;
    console.log('Autenticación exitosa para cliente:', req.cliente_id);
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

// Ruta de registro
app.post('/api/registro', async (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    fecha_nacimiento,
    direccion,
    departamento,
    codigo_postal,
    contraseña
  } = req.body;

  try {
    const existe = await db.query('SELECT * FROM clientes WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    await db.query(`
      INSERT INTO clientes (nombre, apellido, correo, telefono, fecha_nacimiento, direccion, departamento, codigo_postal, contraseña)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, [nombre, apellido, correo, telefono, fecha_nacimiento, direccion, departamento, codigo_postal, contraseña]);

    res.json({ message: 'Registro exitoso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 