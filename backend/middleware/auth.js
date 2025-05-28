const jwt = require('jsonwebtoken');
const pool = require('../db');

// Middleware para verificar el token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Verificar el token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_temporal');
    
    // Agregar la información del usuario a la request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en middleware verificarToken:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar si el usuario es administrador
const isAdmin = async (req, res, next) => {
  try {
    // Verificar el token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_temporal');
    
    // Verificar si el usuario es administrador
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'No tienes permisos de administrador' });
    }

    // Agregar la información del usuario a la request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = {
  verificarToken,
  isAdmin
}; 