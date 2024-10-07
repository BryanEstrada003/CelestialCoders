import {onUnmounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import starsTexture from '../assets/stars.jpg';


export function useThreeScene() {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    const initScene = (container: HTMLElement) => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({antialias: true});

        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        camera.position.set(-90, 140, 140);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        const ambientLight = new THREE.AmbientLight(0x333333, 5);
        scene.add(ambientLight);

        const cubeTextureLoader = new THREE.CubeTextureLoader();
        scene.background = cubeTextureLoader.load([
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture
        ]);

        const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
        scene.add(pointLight);

        window.addEventListener('resize', onWindowResize);

        return {scene, camera, renderer};
    };

    const animate = (callback: () => void) => {
        const animationId = requestAnimationFrame(() => animate(callback));
        controls.update();
        callback();

        onUnmounted(() => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', onWindowResize);
        });
    };

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    return {initScene, animate};
}