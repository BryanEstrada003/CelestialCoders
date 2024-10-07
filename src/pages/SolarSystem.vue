<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet
        v-for="planet in planets"
        :key="planet.name"
        :planetData="planet"
    />
    <!-- Control deslizante para ajustar la velocidad -->
    <div class="controls">
      <label for="speedControl">Velocidad: {{ speed }}x</label>
      <input
          type="range"
          id="speedControl"
          min="0.1"
          max="5"
          step="0.1"
          v-model="speed"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Planet from '../components/Planet.vue';
import { useThreeScene } from '../uses/useThreeScene';
import { usePlanets } from '../uses/usePlanets';
import { useSun } from '../uses/useSun';
import { usePlanetMesh } from '../uses/usePlanetMesh';
import { useAsteroids } from '../uses/useAsteroids';

export default defineComponent({
  name: 'SolarSystem',
  components: { Planet },
  setup() {
    const rendererContainer = ref<HTMLElement | null>(null);
    const speed = ref(1); // Variable reactiva para la velocidad del tiempo

    // Composables de planetas, asteroides y la escena
    const { initScene, animate } = useThreeScene();
    const { planets, updatePlanets } = usePlanets();
    const { createSun, updateSun } = useSun();
    const { createPlanetMesh } = usePlanetMesh();
    const { asteroids, fetchAsteroids, updateAsteroids } = useAsteroids();

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
          scene.add(asteroidsGroup); // Añadir grupo de asteroides
        });

        let timeDelta = 0;

        // Ciclo de animación
        animate(() => {
          // Incrementar timeDelta sin multiplicar por un número tan pequeño
          // Incrementamos más rápido para que se vea mejor el efecto del control deslizante
          timeDelta += 0.05 * speed.value; // Aumentar la velocidad de incremento del tiempo

          // Actualizar planetas y asteroides
          updatePlanets(planets.value, scene, timeDelta); // Pasar timeDelta al update de planetas
          updateSun(sun); // Actualizar rotación del Sol
          updateAsteroids(timeDelta); // Actualizar los asteroides

          // Renderizar la escena
          renderer.render(scene, camera);
        });
      }
    });

    return { rendererContainer, planets, speed };
  },
});
</script>

<style scoped>
.renderer-container {
  width: 100%;
  height: calc(100vh - 100px);
}

.controls {
  position: absolute;
  bottom: 50px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border-radius: 10px;
}

#speedControl {
  width: 200px;
}
</style>
