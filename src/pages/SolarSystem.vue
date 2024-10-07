<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet v-for="planet in planets" :key="planet.name" :planetData="planet" />
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
import { defineComponent, onMounted, ref } from "vue";
import Planet from "../components/Planet.vue";
import { useThreeScene } from "../uses/useThreeScene";
import { usePlanets } from "../uses/usePlanets";
import { useSun } from "../uses/useSun";
import { usePlanetMesh } from "../uses/usePlanetMesh";
import { useAsteroids } from "../uses/useAsteroids";
import * as THREE from "three";

export default defineComponent({
  name: "SolarSystem",
  components: { Planet },
  setup() {
    const rendererContainer = ref<HTMLElement | null>(null);
    const speed = ref(1); // Variable reactiva para la velocidad del tiempo

    // Composables de planetas, asteroides y la escena
    const { initScene, animate } = useThreeScene();
    const { planets, updatePlanets } = usePlanets();
    const { createSun, updateSun } = useSun();
    const { createPlanetMesh } = usePlanetMesh();
    const { fetchAsteroids, updateAsteroids } = useAsteroids();

    // Arrays para almacenar las posiciones anteriores de los planetas y asteroides
    const planetTrajectories = ref<{ [key: string]: THREE.Vector3[] }>({});
    const asteroidTrajectories = ref<{ [key: string]: THREE.Vector3[] }>({});

    // Función para actualizar y dibujar las trayectorias
    function updateTrajectory(
      objectName: string,
      position: THREE.Vector3,
      trajectories: { [key: string]: THREE.Vector3[] },
      scene: THREE.Scene
    ) {
      if (!trajectories[objectName]) {
        trajectories[objectName] = [];
      }
      // Agregar la posición actual al array de posiciones
      trajectories[objectName].push(position.clone());

      // Limitar el número de puntos en la trayectoria (opcional)
      if (trajectories[objectName].length > 500) {
        trajectories[objectName].shift(); // Eliminar el punto más antiguo si es necesario
      }

      // Crear la geometría de la trayectoria
      const points = trajectories[objectName];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Dibujar la línea de la trayectoria
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geometry, material);
      scene.add(line); // Añadir la línea a la escena
    }

    onMounted(() => {
      if (rendererContainer.value) {
        const { scene, camera, renderer } = initScene(rendererContainer.value);
        const sun = createSun(scene); // Añadir el Sol a la escena

        // Añadir planetas a la escena
        planets.value.forEach((planetData) => {
          const planetMesh = createPlanetMesh(planetData);
          scene.add(planetMesh); // Añadir cada planeta a la escena
        });

        // Inicializar y añadir asteroides a la escena, pasamos scene y asteroidTrajectories
        fetchAsteroids(scene).then((asteroidsGroup) => {
          if (asteroidsGroup) {
            scene.add(asteroidsGroup); // Añadir grupo de asteroides a la escena
          }
        });

        let timeDelta = 0;

        // Ciclo de animación
        animate(() => {
          // Incrementar timeDelta con la velocidad ajustada
          timeDelta += 0.05 * speed.value;

          // Actualizar la posición de los planetas y dibujar sus trayectorias
          planets.value.forEach((planetData) => {
            const planetMesh = scene.getObjectByName(
              planetData.name
            ) as THREE.Mesh;
            if (planetMesh) {
              const semiMajorAxis = planetData.position[0];
              const semiMinorAxis = semiMajorAxis * 0.8; // Mismo cálculo que la órbita

              // Calcular la posición orbital del planeta usando elipse
              planetMesh.position.x =
                Math.cos(timeDelta * planetData.orbitSpeed) * semiMajorAxis;
              planetMesh.position.z =
                Math.sin(timeDelta * planetData.orbitSpeed) * semiMinorAxis;

              // Actualizar la trayectoria del planeta
              updateTrajectory(
                planetData.name,
                planetMesh.position,
                planetTrajectories.value,
                scene
              );

              // Rotar el planeta sobre su eje
              planetMesh.rotation.y += planetData.rotationSpeed;
            }
          });

          // Actualizar la posición de los asteroides y sus trayectorias
          updateAsteroids(timeDelta);

          updateSun(sun);

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
  height: 100vh;
  position: relative;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border-radius: 10px;
}

#speedControl {
  width: 200px;
}
</style>
