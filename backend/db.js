// db.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.tdxpgpcxqhdzanzvniht',
    password: 'k7uARMxtf0qyJ9m3',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Verificar conexión
    const client = await pool.connect();
    console.log('Conectado con la base de datos de Supabase');
    client.release();

    // Crear la tabla de clientes si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        direccion TEXT,
        departamento VARCHAR(100),
        ciudad VARCHAR(100),
        codigo_postal VARCHAR(10),
        contraseña VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear la tabla de administradores si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear la tabla de productos_fabricacion si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos_fabricacion (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear la tabla de productos_base si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos_base (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_base DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear la tabla de pedidos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        producto_id INTEGER REFERENCES productos_fabricacion(id),
        cantidad INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(20) DEFAULT 'Pendiente',
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear la tabla de pedidos_personalizados si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos_personalizados (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        producto_base_id INTEGER REFERENCES productos_base(id),
        descripcion_personalizacion TEXT,
        cantidad INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(20) DEFAULT 'Pendiente',
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificar si existe el administrador
    const adminExists = await pool.query('SELECT * FROM administradores WHERE correo = $1', ['admin@manillania.com']);
    
    if (adminExists.rows.length === 0) {
      // Crear nuevo administrador con contraseña hasheada
      const hashedPassword = await bcrypt.hash('admin123', 10);
      console.log('Creando admin por defecto con contraseña hasheada');
      await pool.query(
        'INSERT INTO administradores (nombre, correo, contraseña) VALUES ($1, $2, $3)',
        ['Administrador', 'admin@manillania.com', hashedPassword]
      );
      console.log('Administrador por defecto creado');
    } else {
      // Verificar si la contraseña actual está hasheada
      const admin = adminExists.rows[0];
      if (!admin.contraseña.startsWith('$2')) {
        console.log('Actualizando contraseña de admin a versión hasheada...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
          'UPDATE administradores SET contraseña = $1 WHERE id = $2',
          [hashedPassword, admin.id]
        );
        console.log('Contraseña de admin actualizada exitosamente');
      } else {
        console.log('Admin existente encontrado con contraseña ya hasheada');
      }
    }

    console.log('Tablas creadas correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Ejecutar la inicialización
initializeDatabase();

module.exports = pool;
