<template>
  <div></div>
</template>

<script lang="ts">
import {defineComponent, onMounted} from 'vue';
import * as THREE from 'three';

export default defineComponent({
  name: 'Planet',
  props: {
    size: {type: Number, required: true},
    texture: {type: String, required: true},
    position: {type: Number, required: true},
    ring: {type: Object, default: null}
  },
  setup(props) {
    const textureLoader = new THREE.TextureLoader();
    let planet: THREE.Mesh, ringMesh: THREE.Mesh | null = null, obj: THREE.Object3D;

    const createPlanet = (scene: THREE.Scene) => {
      const geo = new THREE.SphereGeometry(props.size, 30, 30);
      const mat = new THREE.MeshStandardMaterial({map: textureLoader.load(props.texture)});
      planet = new THREE.Mesh(geo, mat);
      obj = new THREE.Object3D();
      obj.add(planet);

      // Añadir anillo si existe
      if (props.ring) {
        const ringGeo = new THREE.RingGeometry(props.ring.innerRadius, props.ring.outerRadius, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          map: textureLoader.load(props.ring.texture),
          side: THREE.DoubleSide
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = props.position;
        ringMesh.rotation.x = -0.5 * Math.PI;
      }

      planet.position.x = props.position;
      scene.add(obj);
    };

    onMounted(() => {
      const scene = new THREE.Scene(); // Puedes pasar la escena como prop si ya existe
      createPlanet(scene);
    });

    return {};
  }
});
</script>
