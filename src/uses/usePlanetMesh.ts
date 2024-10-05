import * as THREE from 'three';
import {PlanetData} from '../types';

export function usePlanetMesh() {
    const createPlanetMesh = (planetData: PlanetData) => {
        const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const texture = new THREE.TextureLoader().load(planetData.texture);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 10, // Ajusta el brillo
            specular: new THREE.Color(0x333333) // Añade brillo especular para más realismo
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...planetData.position);
        mesh.name = planetData.name;
        return mesh;
    };
    //
    // const updatePlanetMesh = (planetData: PlanetData) => {
    //     // Implementar actualización de la malla del planeta si es necesario
    // };

    return {createPlanetMesh};
}