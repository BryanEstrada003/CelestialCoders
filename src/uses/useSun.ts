import * as THREE from 'three';
import sunTexture from '../assets/sun.jpg';


export function useSun() {
    const createSun = (scene: THREE.Scene) => {
        const sunGeometry = new THREE.SphereGeometry(16, 30, 30);
        const textureLoader = new THREE.TextureLoader();
        const sunMat = new THREE.MeshBasicMaterial({map: textureLoader.load(sunTexture)});
        const sun = new THREE.Mesh(sunGeometry, sunMat);
        sun.name = 'Sun';

        scene.add(sun);

        const pointLight = new THREE.PointLight(0xffffff, 2.5, 500);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        return sun;
    };

    const updateSun = (sun: THREE.Mesh) => {
        sun.rotateY(0.004);
    };

    return {createSun, updateSun};
}