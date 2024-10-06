<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet :position="28" :size="3.2" :texture="mercury" />
    <Planet :position="44" :size="5.8" :texture="venus" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Planet from "../components/Planet.vue";
import venus from "../assets/venus.jpg";
import mercury from "../assets/mercury.jpg";
import sunTexture from "../assets/sun.jpg";
import starsTexture from "../assets/stars.jpg";
import Trajectory from "../components/Trajectory.ts";

// Variables globales
const epoch: Date = new Date("December 9, 2014");
let simSpeed: number = 1;
let solid: boolean = false;
let solidLabels: boolean = false;

// Planetas predefinidos
const planets: Trajectory[] = [
  new Trajectory("Venus", 0.72333199, 3.39471, 54.9, 0.00677323, 76.7, 0.615),
  new Trajectory("theEarth", 1, 0.00005, 102.94719, 0.01671022, 0, 1),
  new Trajectory("Mars", 1.52366231, 1.85061, 286.5, 0.09339, 49.57854, 1.881),
  new Trajectory("theMoon", 0.15, 5.14, 318.0634, 0.0549006, 125.1228, 0.3),
];

// Crear un array vacío para almacenar los objetos Trajectory de asteroides
let asteroidLabels: Trajectory[] = [];

// Función para calcular la anomalía media (epochMeanAnomaly)
function calculateMeanAnomaly(epoch_tdb: number, tp_tdb: number, p_yr: number): number {
  const days_per_year = 365.25;
  const P_days = p_yr * days_per_year;
  const delta_t = epoch_tdb - tp_tdb;
  let M = ((2 * Math.PI) / P_days) * delta_t;

  M = M % (2 * Math.PI);
  if (M < 0) {
    M += 2 * Math.PI;
  }
  return M;
}

// Función para recorrer el archivo JSON y crear los objetos Trajectory para los asteroides
function fetchAsteroidsFromAPI() {
  fetch("https://data.nasa.gov/resource/b67r-rgxc.json")
    .then((response) => response.json())
    .then((data) => {
      const trajectories: Trajectory[] = [];
      data.slice(0, 15).forEach((item: any) => {
        const name = item.object;
        const smA = (parseFloat(item.q_au_1) + parseFloat(item.q_au_2)) / 2;
        const oI = parseFloat(item.i_deg);
        const aP = parseFloat(item.w_deg);
        const oE = parseFloat(item.e);
        const aN = parseFloat(item.node_deg);
        const period = parseFloat(item.p_yr);

        const epoch_tdb = parseFloat(item.epoch_tdb);
        const tp_tdb = parseFloat(item.tp_tdb);
        const mAe = calculateMeanAnomaly(epoch_tdb, tp_tdb, period);

        const trajectory = new Trajectory(name, smA, oI, aP, oE, aN, mAe);
        trajectories.push(trajectory);
      });

      // Guardar los asteroides en la lista global
      asteroidLabels = trajectories;
      console.log(asteroidLabels);
    })
    .catch((error) => console.error("Error al obtener los datos:", error));
}

// Variables de Three.js para la simulación
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls;
let asteroids: THREE.Group;

// Función para inicializar Three.js
function initScene(container: HTMLElement) {
  // Crear el renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Crear la escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Configurar la cámara
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 50, 100);

  // Añadir controles de órbita
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Añadir luz ambiental
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Crear el Sol
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(sunTexture) });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Crear un grupo para los asteroides
  asteroids = new THREE.Group();
  scene.add(asteroids);
}

// Función para animar los asteroides
function animateAsteroids() {
  let angle = 0;
  const speed = 0.01;

  function animate() {
    requestAnimationFrame(animate);
    angle += speed;

    // Eliminar los asteroides anteriores en cada frame
    while (asteroids.children.length) {
      asteroids.remove(asteroids.children[0]);
    }

    // Calcular la posición de los asteroides en función de su órbita y propagación
    asteroidLabels.forEach((asteroid) => {
      const [x, y, z] = asteroid.propagate(angle); // Utilizar la función propagate de Trajectory
      const mesh = createAsteroidMesh(asteroid);
      mesh.position.set(x * 10 + 20, y * 10 + 20, z * 10 + 20); // Ajustar la escala y la posición fuera del Sol
      asteroids.add(mesh);
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

// Crear la malla de un asteroide en Three.js
function createAsteroidMesh(asteroid: Trajectory): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Usar geometría de esfera pequeña
  const material = new THREE.MeshBasicMaterial({ color: 0x888888 }); // Usar un color gris estándar
  return new THREE.Mesh(geometry, material);
}

export default defineComponent({
  name: "SolarSystem",
  components: {
    Planet,
  },
  setup() {
    const rendererContainer = ref<HTMLElement | null>(null);

    onMounted(() => {
      if (rendererContainer.value) {
        initScene(rendererContainer.value); // Inicializa la escena Three.js
        fetchAsteroidsFromAPI(); // Cargar los asteroides de la API
        animateAsteroids(); // Iniciar la animación de los asteroides
      }
    });

    return { rendererContainer, mercury, venus };
  },
});
</script>

<style scoped>
.renderer-container {
  width: 100%;
  height: 100vh;
  display: block;
}
</style>
