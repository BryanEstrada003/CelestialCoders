<template>
  <div ref="container" class="orrery-container"></div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, onBeforeUnmount} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  name: 'Orrery',
  setup() {
    const container = ref<HTMLDivElement | null>(null);
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let orbit: OrbitControls;

    const textures: THREE.Texture[] = [];
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const loadTextures = () => {
      const starsTexture = cubeTextureLoader.load([
        'https://i.imgur.com/gLGNnkp.jpeg',
        'https://i.imgur.com/gLGNnkp.jpeg',
        'https://i.imgur.com/gLGNnkp.jpeg',
        'https://i.imgur.com/gLGNnkp.jpeg',
        'https://i.imgur.com/gLGNnkp.jpeg',
        'https://i.imgur.com/gLGNnkp.jpeg',
      ]);
      const sunTexture = textureLoader.load('https://i.imgur.com/zU5oOjt.jpeg');
      const mercuryTexture = textureLoader.load('https://i.imgur.com/TJO6Te3.jpeg');
      // Carga de otras texturas aquí...

      textures.push(
          starsTexture,
          sunTexture,
          mercuryTexture,
          // Otras texturas...
      );

      textures.forEach((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
      });
    };

    const init = () => {
      renderer = new THREE.WebGLRenderer({antialias: true});
      if (container.value) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.value.appendChild(renderer.domElement);
      }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      orbit = new OrbitControls(camera, renderer.domElement);

      camera.position.set(-90, 140, 140);
      orbit.update();

      const ambientLight = new THREE.AmbientLight(0x333333, 5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
      scene.add(pointLight);

      scene.background = textures[0];

      const sunGeo = new THREE.SphereGeometry(16, 30, 30);
      const sunMat = new THREE.MeshBasicMaterial({map: textures[1]});
      const sun = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sun);

      createPlanets();

      window.addEventListener('resize', onWindowResize);
      animate();
    };

    const createPlanets = () => {
      // Crea planetas como en tu código original
      // Por ejemplo:
      const mercury = createPlanet(3.2, textures[2], 28);
      // Añade otros planetas...
    };

    const createPlanet = (size: number, texture: THREE.Texture, position: number) => {
      const geo = new THREE.SphereGeometry(size, 30, 30);
      const mat = new THREE.MeshStandardMaterial({map: texture});
      const mesh = new THREE.Mesh(geo, mat);
      const obj = new THREE.Object3D();
      obj.add(mesh);
      scene.add(obj);
      mesh.position.x = position;
      return {mesh, obj};
    };

    const animate = () => {
      // Actualiza la rotación y renderiza la escena
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const onWindowResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    onMounted(() => {
      loadTextures();
      init();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onWindowResize);
      // Limpia la escena y el renderer si es necesario
    });

    return {
      container,
    };
  },
});
</script>

<style scoped>
.orrery-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
