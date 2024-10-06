<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet
        v-for="planet in planets"
        :key="planet.name"
        :planetData="planet"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Planet from '../components/Planet.vue';
import { useThreeScene } from '../uses/useThreeScene';
import { usePlanets } from '../uses/usePlanets';
import { useSun } from '../uses/useSun';
import { usePlanetMesh } from '../uses/usePlanetMesh';
import { useAsteroids } from '../uses/useAsteroids'; // Nueva función para asteroides

export default defineComponent({
  name: 'SolarSystem',
  components: { Planet },
  setup() {
    const rendererContainer = ref<HTMLElement | null>(null);

    // Composables de planetas, asteroides y la escena
    const { initScene, animate } = useThreeScene();
    const { planets, updatePlanets } = usePlanets();
    const { createSun, updateSun } = useSun();
    const { createPlanetMesh } = usePlanetMesh();
    const { asteroids, fetchAsteroids, updateAsteroids } = useAsteroids(); // Manejo de asteroides

    onMounted(() => {
      if (rendererContainer.value) {
        const { scene, camera, renderer } = initScene(rendererContainer.value);
        const sun = createSun(scene); // Añadir el Sol a la escena

        // Añadir planetas a la escena
        planets.value.forEach((planetData) => {
          const planetMesh = createPlanetMesh(planetData);
          scene.add(planetMesh); // Añadir cada planeta a la escena
        });

        // Inicializar y añadir asteroides a la escena
        fetchAsteroids().then((asteroidsGroup) => {
          scene.add(asteroidsGroup); // Añadir grupo de asteroides después de cargar
        });

        // Ciclo de animación
        animate(() => {
          updatePlanets(planets.value, scene); // Actualizar posiciones de planetas
          updateSun(sun); // Actualizar rotación del Sol
          updateAsteroids(); // Actualizar los asteroides
          renderer.render(scene, camera); // Renderizar la escena
        });
      }
    });

    return { rendererContainer, planets };
  },
});
</script>

<style scoped>
.renderer-container {
  width: 100%;
  height: 100vh;
}
</style>
