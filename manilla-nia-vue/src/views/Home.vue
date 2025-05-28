<template>
  <div class="home">
    <section class="hero-modern">
      <div class="hero-content">
        <h1 class="animate-title">Bienvenido a ManillaNia</h1>
        <p class="animate-text">Descubre la magia de la artesanía colombiana. Aquí cada manilla cuenta una historia, tejida a mano con dedicación y amor. Elige entre nuestra colección de productos listos para llevar o personaliza tu propia manilla para que sea tan única como tú.</p>
      </div>
    </section>

    <section class="invitacion-compra">
      <div class="invitacion-container">
        <h2 class="animate-fade-up">¿Qué deseas comprar hoy?</h2>
        <p class="animate-fade-up">Te invitamos a explorar nuestra tienda y elegir la opción que más se adapte a tu estilo:</p>
        <div class="invitacion-botones animate-fade-up">
          <router-link to="/productos" class="btn-invitacion normal">
            Comprar Producto Estándar
          </router-link>
          <router-link to="/personalizar" class="btn-invitacion personalizado">
            Comprar Producto Personalizado
          </router-link>
        </div>
      </div>
    </section>

    <section class="about">
      <div class="about-content animate-fade-right">
        <h2>Sobre Nosotros</h2>
        <p>En ManillaNia creemos que cada nudo cuenta una historia. 
          Somos una marca colombiana nacida del amor por la artesanía y el detalle, 
          dedicada a crear manillas tejidas a mano con el alma, una a una, con paciencia y dedicación. 
          Detrás de cada diseño hay un artesano, un par de manos que entrelazan hilos, 
          colores y tradiciones para dar forma a piezas únicas que conectan con lo auténtico, lo hecho con corazón.</p>

        <p>Nuestra inspiración nace de la tierra, de las raíces culturales y del valor que tiene lo artesanal en un mundo acelerado. 
          Cada manilla es más que un accesorio: es un símbolo de identidad, un recuerdo, una expresión personal. 
          Ya sea para regalar, llevar contigo o compartir con quienes amas, nuestras creaciones buscan ser parte de tu historia.</p>
          
        <p>Desde nuestro taller hasta tus manos, cuidamos cada detalle, valorando la dedicación que requiere lo hecho a mano. 
          Apoyamos el trabajo digno, el comercio consciente y la creatividad local. Te invitamos a formar parte de esta comunidad 
          que celebra la belleza de lo simple, lo auténtico y lo artesanal.</p>
      </div>
      <div class="about-image animate-fade-left">
        <img src="/img/inicio.png" alt="Imagen de inicio">
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-title {
  animation: slideUp 1s ease-out;
}

.animate-text {
  animation: fadeIn 1s ease-out 0.5s both;
}

.animate-fade-up {
  animation: slideUp 0.8s ease-out both;
}

.animate-fade-right {
  animation: slideInRight 1s ease-out both;
}

.animate-fade-left {
  animation: slideInLeft 1s ease-out both;
}

.hero-modern {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6a11cb;
  background: linear-gradient(120deg, #f8f9fa 60%, #f3e8ff 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(106,17,203,0.06);
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #6a11cb;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.hero-content p {
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  color: #555;
  line-height: 1.6;
}

.invitacion-compra {
  background: linear-gradient(135deg, #fffbe6 0%, #fff5e6 100%);
  padding: 4rem 1rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.invitacion-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.invitacion-compra h2 {
  color: #ff6b6b;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.invitacion-compra p {
  color: #555;
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.invitacion-botones {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.btn-invitacion {
  display: inline-block;
  padding: 1.2rem 2.5rem;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.btn-invitacion::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.btn-invitacion:hover::before {
  left: 100%;
}

.btn-invitacion.normal {
  background: linear-gradient(90deg, #ff8a65 0%, #ff6b6b 100%);
  color: #fff;
  border: none;
}

.btn-invitacion.normal:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255,107,107,0.2);
}

.btn-invitacion.personalizado {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: #fff;
  border: none;
}

.btn-invitacion.personalizado:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(106,17,203,0.2);
}

.about {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-content h2 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.about-content h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb, #ff6b6b);
}

.about-content p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #555;
  font-size: 1.1rem;
}

.about-image {
  position: relative;
  transition: transform 0.3s ease;
}

.about-image:hover {
  transform: translateY(-10px);
}

.about-image img {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.about-image img:hover {
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .about {
    grid-template-columns: 1fr;
    padding: 4rem 1rem;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
  
  .invitacion-compra h2 {
    font-size: 2rem;
  }
  
  .btn-invitacion {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style> 