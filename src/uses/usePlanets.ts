import {ref, Ref} from 'vue';
import * as THREE from 'three';
import {PlanetData} from '../types';
import mercury from '../assets/mercury.jpg';
import venus from '../assets/venus.jpg';
import jupiter from '../assets/jupiter.jpg';
import mars from '../assets/mars.jpg';
import saturn from '../assets/saturn ring.png';
import earth from '../assets/earth.jpg';
import uranus from '../assets/uranus.jpg';
import neptune from '../assets/neptune.jpg';


export function usePlanets() {
    // Escala para las distancias (1 AU = 10 unidades en la escena)

    const planets: Ref<PlanetData[]> = ref([
        {name: 'Mercury', position: [28, 0, 0], size: 3.2, texture: mercury, rotationSpeed: 0.004},
        {name: 'Venus', position: [44, 0, 0], size: 5.8, texture: venus, rotationSpeed: 0.002},
        {name: 'Earth', position: [62, 0, 0], size: 6, texture: earth, rotationSpeed: 0.001},
        {name: 'Mars', position: [78, 0, 0], size: 4, texture: mars, rotationSpeed: 0.001},
        {name: 'Jupiter', position: [100, 0, 0], size: 12, texture: jupiter, rotationSpeed: 0.0006},
        {name: 'Saturn', position: [138, 0, 0], size: 10, texture: saturn, rotationSpeed: 0.0004},
        {name: 'Uranus', position: [176, 0, 0], size: 7, texture: uranus, rotationSpeed: 0.0002},
        {name: 'Neptune', position: [200, 0, 0], size: 7, texture: neptune, rotationSpeed: 0.0001}
    ]);


    const updatePlanets = (planetsData: PlanetData[], scene: THREE.Scene) => {
        planetsData.forEach(planet => {
            const planetMesh = scene.getObjectByName(planet.name) as THREE.Mesh;
            if (planetMesh) {
                planetMesh.position.x = Math.cos(Date.now() * 0.001 * planet.rotationSpeed) * planet.position[0];
                planetMesh.position.z = Math.sin(Date.now() * 0.001 * planet.rotationSpeed) * planet.position[0];
                planetMesh.rotation.y += 0.01;
            }
        });
    };

    return {planets, updatePlanets};
}