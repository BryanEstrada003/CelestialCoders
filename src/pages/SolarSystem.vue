<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet :position="28" :size="3.2" :texture="mercury"/>
    <Planet :position="44" :size="5.8" :texture="venus"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import Planet from '../components/Planet.vue';
import venus from '../assets/venus.jpg';
import mercury from '../assets/mercury.jpg';
import sunTexture from '../assets/sun.jpg'; // Importar la textura del sol
import starsTexture from '../assets/stars.jpg'

export default defineComponent({
  name: 'SolarSystem',
  components: {
    Planet,
  },
  setup() {
    // Refs
    const rendererContainer = ref<HTMLDivElement | null>(null);

    // Variables de THREE.js
    let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, orbit: OrbitControls;
    let sun: THREE.Mesh;

    // Función para inicializar la escena
    const init = () => {
      // Crear el renderer y añadirlo al contenedor
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererContainer.value?.appendChild(renderer.domElement);

      // Crear la escena
      scene = new THREE.Scene();

      // Configurar la cámara
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(-90, 140, 140);

      // Controles de órbita
      orbit = new OrbitControls(camera, renderer.domElement);
      orbit.update();

      // Añadir luz ambiental
      const ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      const cubeTextureLoader = new THREE.CubeTextureLoader();
      scene.background = cubeTextureLoader.load([
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture
      ]);

      // Cargar textura y crear el Sol
      const textureLoader = new THREE.TextureLoader();
      const sunGeo = new THREE.SphereGeometry(16, 30, 30);
      const sunMat = new THREE.MeshBasicMaterial({map: textureLoader.load(sunTexture)});
      sun = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sun);

      // Añadir la luz del Sol
      const pointLight = new THREE.PointLight(0xffffff, 2, 300);
      scene.add(pointLight);
    };

    // Función de animación
    const animate = () => {
      // Rotación del Sol
      sun.rotateY(0.004);

      // Renderizar la escena
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Inicializar escena y animación cuando el componente esté montado
    onMounted(() => {
      init();
      animate();

      // Ajustar el tamaño del canvas cuando se redimensiona la ventana
      window.addEventListener('resize', () => {
        if (camera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      });
    });

    return {rendererContainer, mercury, venus}; // Retornar el contenedor para su uso en el template
  },
});
</script>

<style>
/* Ajuste de la vista para que ocupe toda la pantalla */
.renderer-container {
  width: 100%;
  height: 100vh;
}
</style>
