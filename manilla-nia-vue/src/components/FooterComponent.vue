<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>ManillaNia</h3>
        <p>Manillas artesanales hechas con amor y dedicación para ti.</p>
      </div>
      
      <div class="footer-section">
        <h3>Enlaces Rápidos</h3>
        <ul>
          <li><router-link to="/">Inicio</router-link></li>
          <li><router-link to="/productos">Productos</router-link></li>
          <li><router-link to="/acerca-de">Acerca de</router-link></li>
          <li><router-link to="/contacto">Contacto</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Contacto</h3>
        <ul>
          <li><i class="fas fa-phone"></i> +57 123 456 7890</li>
          <li><i class="fas fa-envelope"></i> info@manillania.com</li>
          <li><i class="fas fa-map-marker-alt"></i> Bogotá, Colombia</li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Síguenos</h3>
        <div class="social-links">
          <a href="#" target="_blank"><i class="fab fa-facebook"></i></a>
          <a href="#" target="_blank"><i class="fab fa-instagram"></i></a>
          <a href="#" target="_blank"><i class="fab fa-twitter"></i></a>
          <a href="#" target="_blank"><i class="fab fa-pinterest"></i></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2024 ManillaNia. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
.footer {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 2rem;
  margin-top: auto;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -2px 10px rgba(106,17,203,0.2);
  font-family: 'Poppins', 'Montserrat', sans-serif;
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.footer-section h3 {
  color: #ff6b6b;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #6a11cb;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #ff6b6b;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  font-size: 1.5rem;
  color: #ff6b6b;
  transition: color 0.3s;
}
.social-links a:hover {
  color: #6a11cb;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e7ef;
  color: #999;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .social-links {
    justify-content: center;
  }
}
</style> 