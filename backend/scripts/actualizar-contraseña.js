const axios = require('axios');

async function actualizarContraseña() {
  try {
    const response = await axios.post('http://localhost:3000/api/actualizar-contraseña', {
      correo: 'tapi@gmail.com',
      contraseña: 'cris123'
    });
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

actualizarContraseña(); 