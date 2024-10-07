<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet v-for="planet in planets" :key="planet.name" :planetData="planet" />

    <!-- Control deslizante para ajustar la velocidad -->
    <div class="controls">
      <label for="speedControl">Speed: {{ speed }}x</label>
      <input
        type="range"
        id="speedControl"
        min="0.1"
        max="5"
        step="0.1"
        v-model="speed"
      />

      <!-- Nuevo control para seleccionar el tipo de asteroide -->
      <label for="asteroidTypeControl">Show asteroid type:</label>
      <select id="asteroidTypeControl" v-model="selectedAsteroidType">
        <option :value="'NEC'">NEC (Near-Earth Comet)</option>
        <option :value="'Comet'">Comet</option>
        <option :value="'PHA'">PHA (Potentially Hazardous Asteroid)</option>
        <option :value="'NEO'">NEO (Near-Earth Object)</option>
        <option :value="'Asteroid'">Asteroid</option>
      </select>

      <!-- Control para activar/desactivar la visibilidad de las órbitas -->
      <label for="orbitVisibilityControl">Show orbits:</label>
      <input type="checkbox" id="orbitVisibilityControl" v-model="showOrbits" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
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
    const speed = ref(1); // Velocidad del tiempo
    const selectedAsteroidType = ref("Asteroid"); // Tipo de asteroide seleccionado (por defecto todos)
    const showOrbits = ref(true); // Visibilidad de las órbitas

    // Composables de planetas, asteroides y la escena
    const { initScene, animate } = useThreeScene();
    const { planets, updatePlanets } = usePlanets();
    const { createSun, updateSun } = useSun();
    const { createPlanetMesh } = usePlanetMesh();
    const {
      fetchAsteroids,
      updateAsteroids,
      asteroids,
      necCount,
      cometCount,
      phaCount,
      neoCount,
      asteroidCount,
    } = useAsteroids();

    // Arrays para almacenar las trayectorias
    const planetTrajectories = ref<{ [key: string]: THREE.Vector3[] }>({});
    const asteroidTrajectories = ref<{ [key: string]: THREE.Vector3[] }>({});
    let orbitLines: THREE.Line[] = []; // Almacenamos las líneas de las órbitas para poder eliminarlas

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
      trajectories[objectName].push(position.clone());

      if (trajectories[objectName].length > 500) {
        trajectories[objectName].shift();
      }

      const points = trajectories[objectName];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geometry, material);

      orbitLines.push(line); // Almacenamos la línea de la órbita

      if (showOrbits.value) {
        scene.add(line); // Añadir la línea a la escena si showOrbits es true
      }
    }

    // Función para limpiar todas las órbitas (planetas y asteroides)
    function clearOrbits(scene: THREE.Scene) {
      orbitLines.forEach((line) => {
        scene.remove(line);
      });
      orbitLines = [];
    }

    let scene: THREE.Scene;
    onMounted(() => {
      if (rendererContainer.value) {
        const sceneInit = initScene(rendererContainer.value);
        scene = sceneInit.scene;
        const { camera, renderer } = sceneInit;
        const sun = createSun(scene); // Añadir el Sol a la escena

        planets.value.forEach((planetData) => {
          const planetMesh = createPlanetMesh(planetData);
          scene.add(planetMesh); // Añadir cada planeta a la escena
        });

        // Inicializar y añadir asteroides a la escena
        fetchAsteroids(scene).then((asteroidsGroup) => {
          if (asteroidsGroup) {
            scene.add(asteroidsGroup); // Añadir grupo de asteroides a la escena
          }
        });

        let timeDelta = 0;

        // Ciclo de animación
        animate(() => {
          timeDelta += 0.05 * speed.value;

          // Limpiar las órbitas anteriores si la visibilidad cambia
          clearOrbits(scene);

          // Actualizar la posición de los planetas y dibujar sus trayectorias
          planets.value.forEach((planetData) => {
            const planetMesh = scene.getObjectByName(
              planetData.name
            ) as THREE.Mesh;
            if (planetMesh) {
              const semiMajorAxis = planetData.position[0];
              const semiMinorAxis = semiMajorAxis * 0.8;

              planetMesh.position.x =
                Math.cos(timeDelta * planetData.orbitSpeed) * semiMajorAxis;
              planetMesh.position.z =
                Math.sin(timeDelta * planetData.orbitSpeed) * semiMinorAxis;

              updateTrajectory(
                planetData.name,
                planetMesh.position,
                planetTrajectories.value,
                scene
              );

              planetMesh.rotation.y += planetData.rotationSpeed;
            }
          });

          // Filtrar y mostrar asteroides según el tipo seleccionado y la visibilidad de las órbitas
          updateAsteroids(
            timeDelta,
            selectedAsteroidType.value,
            showOrbits.value,
            scene
          );

          renderer.render(scene, camera);
        });
      }
    });

    // Watcher para cuando cambie el tipo de asteroide seleccionado
    watch(selectedAsteroidType, () => {
      // Actualizar los asteroides cuando cambia el tipo
      updateAsteroids(0, selectedAsteroidType.value, showOrbits.value, scene);
    });

    // Verifica el cambio en el estado de las órbitas y vuelve a renderizar
    watch(showOrbits, () => {
      clearOrbits(scene);
    });

    return {
      rendererContainer,
      planets,
      speed,
      selectedAsteroidType,
      showOrbits,
      necCount,
      cometCount,
      phaCount,
      neoCount,
      asteroidCount,
    };
  },
});
</script>
