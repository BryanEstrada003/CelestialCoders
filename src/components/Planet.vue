<template>
  <group>
    <mesh :position="planetData.position" :name="planetData.name">
      <sphereGeometry :args="[1, 32, 32]" />
      <meshStandardMaterial :color="planetData.color" />
    </mesh>
    <text-mesh
      :text="planetData.name"
      :fontSize="0.5"
      color="white"
      :position="[0, 1.5, 0]"
    />
  </group>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { PlanetData } from '../types';
import { usePlanetMesh } from '../uses/usePlanetMesh.ts';
import { Text } from 'troika-three-text';

export default defineComponent({
  name: 'Planet',
  props: {
    planetData: {
      type: Object as PropType<PlanetData>,
      required: true
    }
  },
  setup(props) {
    const { createPlanetMesh } = usePlanetMesh();

    onMounted(() => {
      createPlanetMesh(props.planetData);

      const textMesh = new Text();
      textMesh.text = props.planetData.name;
      textMesh.fontSize = 0.5;
      textMesh.color = 'white';
      textMesh.position.set(0, 1.5, 0);
      
      // Añadir el texto a la escena
      textMesh.sync();
    });

    return {};
  }
});
</script>

<style scoped>
/* Estilos para el texto pueden ir aquí si es necesario */
</style>