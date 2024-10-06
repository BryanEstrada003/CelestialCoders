// threeSetup.ts
import * as THREE from 'three';

export const createScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-90, 140, 140);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Añadir luz, etc.

    return {scene, camera, renderer};
};
