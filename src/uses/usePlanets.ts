import {ref, Ref} from 'vue';
import * as THREE from 'three';
import {PlanetData} from '../types';
import mercury from '../assets/mercury.jpg';
import venus from '../assets/venus.jpg';
import jupiter from '../assets/jupiter.jpg';
import mars from '../assets/mars.jpg';
import saturn from '../assets/saturn.jpg';
import earth from '../assets/earth.jpg';
import uranus from '../assets/uranus.jpg';
import neptune from '../assets/neptune.jpg';

export function usePlanets() {
    const planets: Ref<PlanetData[]> = ref([
        {name: 'Mercury', position: [28, 0, 0], size: 3.2, texture: mercury, rotationSpeed: 0.004, orbitSpeed: 1},
        {name: 'Venus', position: [44, 0, 0], size: 5.8, texture: venus, rotationSpeed: 0.002, orbitSpeed: 0.73},
        {name: 'Earth', position: [62, 0, 0], size: 6, texture: earth, rotationSpeed: 0.02, orbitSpeed: 0.62},
        {name: 'Mars', position: [78, 0, 0], size: 4, texture: mars, rotationSpeed: 0.018, orbitSpeed: 0.50},
        {name: 'Jupiter', position: [100, 0, 0], size: 12, texture: jupiter, rotationSpeed: 0.04, orbitSpeed: 0.27},
        {name: 'Saturn', position: [138, 0, 0], size: 10, texture: saturn, rotationSpeed: 0.038, orbitSpeed: 0.20},
        {name: 'Uranus', position: [176, 0, 0], size: 7, texture: uranus, rotationSpeed: 0.03, orbitSpeed: 0.14},
        {name: 'Neptune', position: [200, 0, 0], size: 7, texture: neptune, rotationSpeed: 0.032, orbitSpeed: 0.11}
    ]);

    const updatePlanets = (planetsData: PlanetData[], scene: THREE.Scene) => {
        const currentTime = Date.now(); // Tiempo actual para todos los planetas

        planetsData.forEach((planet, index) => {
            const planetMesh = scene.getObjectByName(planet.name) as THREE.Mesh;
            if (planetMesh) {
                // Añadir un offset basado en el índice para evitar que todos se sincronicen igual
                const timeOffset = index * 100; // Ajusta el offset si es necesario

                // Rotación alrededor del sol
                planetMesh.position.x = Math.cos((currentTime + timeOffset) * 0.001 * planet.orbitSpeed) * planet.position[0];
                planetMesh.position.z = Math.sin((currentTime + timeOffset) * 0.001 * planet.orbitSpeed) * planet.position[0];

                // Autogiro del planeta
                planetMesh.rotation.y += planet.rotationSpeed;
            }
        });
    };


    return {planets, updatePlanets};
}
