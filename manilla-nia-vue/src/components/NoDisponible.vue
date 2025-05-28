<template>
  <div class="no-disponible">
    <i class="fas fa-lock"></i>
    <h2>No Disponible</h2>
    <p>Esta sección solo está disponible para el administrador principal.</p>
  </div>
</template>

<style scoped>
.no-disponible {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 1rem;
}

.no-disponible i {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.no-disponible h2 {
  font-size: 2rem;
  color: #475569;
  margin-bottom: 1rem;
  font-weight: 600;
}

.no-disponible p {
  color: #64748b;
  font-size: 1.1rem;
  max-width: 400px;
  line-height: 1.5;
}
</style> 