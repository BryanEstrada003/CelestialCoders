import * as THREE from 'three';
import { ref } from 'vue';
import Trajectory from '../components/Trajectory.ts';

// Crear un grupo para los asteroides
const asteroids = new THREE.Group();
let asteroidLabels: Trajectory[] = []; // Aquí guardamos las trayectorias

// Función para cargar asteroides desde la API
async function fetchAsteroids() {
    try {
        const response = await fetch("https://data.nasa.gov/resource/b67r-rgxc.json");
        const data = await response.json();
        const trajectories: Trajectory[] = [];

        data.slice(0, 15).forEach((item: any) => {
            const name = item.object;
            const smA = (parseFloat(item.q_au_1) + parseFloat(item.q_au_2)) / 2;
            const oI = parseFloat(item.i_deg);
            const aP = parseFloat(item.w_deg);
            const oE = parseFloat(item.e);
            const aN = parseFloat(item.node_deg);
            const period = parseFloat(item.p_yr);

            const epoch_tdb = parseFloat(item.epoch_tdb);
            const tp_tdb = parseFloat(item.tp_tdb);
            const mAe = calculateMeanAnomaly(epoch_tdb, tp_tdb, period);

            const trajectory = new Trajectory(name, smA, oI, aP, oE, aN, mAe);
            trajectories.push(trajectory);
        });

        asteroidLabels = trajectories; // Guardar las trayectorias en la lista global

        // Añadir el grupo de asteroides a la escena después de cargar los datos
        return asteroids; // Retorna el grupo de asteroides
    } catch (error) {
        console.error("Error al obtener los datos de asteroides:", error);
    }
}


let timeDelta = 0; // Variable de tiempo inicial

function updateAsteroids() {
    timeDelta += 0.001; // Incrementar más lentamente el tiempo

    // Limpiar los asteroides anteriores
    while (asteroids.children.length) {
        asteroids.remove(asteroids.children[0]);
    }

    // Añadir los asteroides con nuevas posiciones
    asteroidLabels.forEach((asteroid) => {
        const [x, y, z] = asteroid.propagate(timeDelta); // Propagar las posiciones en función del tiempo
        const mesh = createAsteroidMesh(asteroid);

        // Mantener el factor de escala ajustado
        mesh.position.set(x * 50, y * 50, z * 50); // Ajustar la posición de los asteroides
        asteroids.add(mesh); // Añadir la malla del asteroide al grupo
    });
}



// Crear la malla de un asteroide
function createAsteroidMesh(asteroid: Trajectory): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Tamaño pequeño
    const material = new THREE.MeshBasicMaterial({ color: 0x888888 }); // Color gris
    return new THREE.Mesh(geometry, material);
}

// Función auxiliar para calcular la anomalía media
function calculateMeanAnomaly(epoch_tdb: number, tp_tdb: number, p_yr: number): number {
    const days_per_year = 365.25;
    const P_days = p_yr * days_per_year;
    const delta_t = epoch_tdb - tp_tdb;
    let M = ((2 * Math.PI) / P_days) * delta_t;
    M = M % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;
    return M;
}

export function useAsteroids() {
    return {
        asteroids, // Grupo de asteroides que se añade a la escena
        fetchAsteroids, // Cargar asteroides desde la API
        updateAsteroids, // Actualizar asteroides en cada frame
    };
}
