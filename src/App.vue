<template>
  <div id="app">
    <h1>CelestialCoders</h1>
    <router-view class="renderer-container"></router-view> 
    
  </div>
</template>

<script setup>
// If you need any app-wide logic, you can add it here
</script>

<style>
html, body {
  margin: 0; /* Eliminar margen por defecto del navegador */
  padding: 0; /* Eliminar relleno por defecto del navegador */
  height: 100%; /* Asegurarse de que el html y body cubran toda la altura */
  overflow: hidden;  /*Evitar el desplazamiento */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: black;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  padding: 10px; /* Add some padding around the container */
}


h1 {
  font-family: 'Audiowide', sans-serif; 
  color: white; 
  font-size: 3vw; /* Tamaño de fuente relativo a la ventana */
  max-width: 90%; /* Evitar que el título se salga de la pantalla */
  margin: 0; /* Eliminar márgenes */
}

.renderer-container {
  width: 100%; /* Asegúrate de que ocupa el ancho completo */
  flex: 1; /* Permitir que el contenedor principal ocupe todo el espacio restante */
  position: relative; /* Asegúrate de que el contenedor de renderizado pueda contener elementos absolutos */
}

</style>