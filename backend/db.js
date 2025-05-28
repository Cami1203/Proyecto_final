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
