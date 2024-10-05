<script lang="ts">
import {defineComponent, onMounted, PropType} from 'vue';
import {PlanetData} from '../types';
import {usePlanetMesh} from '../uses/usePlanetMesh.ts';

export default defineComponent({
  name: 'Planet',
  props: {
    planetData: {
      type: Object as PropType<PlanetData>,
      required: true
    }
  },
  setup(props) {
    const {createPlanetMesh} = usePlanetMesh();

    onMounted(() => {
      createPlanetMesh(props.planetData);
    });

    // watch(() => props.planetData, (newData) => {
    //   updatePlanetMesh(newData);
    // }, {deep: true});
  }
});
</script>