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
        {name: 'Mercury', position: [28, 0, 0], size: 3.2, texture: mercury, rotationSpeed: 0.004, orbitSpeed: 0.04},
        {name: 'Venus', position: [44, 0, 0], size: 5.8, texture: venus, rotationSpeed: 0.002, orbitSpeed: 0.015},
        {name: 'Earth', position: [62, 0, 0], size: 6, texture: earth, rotationSpeed: 0.02, orbitSpeed: 0.01},
        {name: 'Mars', position: [78, 0, 0], size: 4, texture: mars, rotationSpeed: 0.018, orbitSpeed: 0.008},
        {name: 'Jupiter', position: [100, 0, 0], size: 12, texture: jupiter, rotationSpeed: 0.04, orbitSpeed: 0.002},
        {name: 'Saturn', position: [138, 0, 0], size: 10, texture: saturn, rotationSpeed: 0.038, orbitSpeed: 0.0009},
        {name: 'Uranus', position: [176, 0, 0], size: 7, texture: uranus, rotationSpeed: 0.03, orbitSpeed: 0.0004},
        {name: 'Neptune', position: [200, 0, 0], size: 7, texture: neptune, rotationSpeed: 0.032, orbitSpeed: 0.0001}
    ]);

    const updatePlanets = (planetsData: PlanetData[], scene: THREE.Scene) => {
        planetsData.forEach(planet => {
            const planetMesh = scene.getObjectByName(planet.name) as THREE.Mesh;
            if (planetMesh) {
                // Calcular la posición orbital
                const time = Date.now() * 0.001; // Tiempo en segundos
                const angle = time * planet.orbitSpeed;
                const orbitRadius = planet.position[0]; // Usar la coordenada x como radio de la órbita

                // Actualizar la posición del planeta en su órbita
                planetMesh.position.x = Math.cos(angle) * orbitRadius;
                planetMesh.position.z = Math.sin(angle) * orbitRadius;

                // Autogiro del planeta
                planetMesh.rotation.y += planet.rotationSpeed;
            }
        });
    };

    return {planets, updatePlanets};
}
