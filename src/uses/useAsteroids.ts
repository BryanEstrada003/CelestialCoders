import * as THREE from "three";
import Trajectory from "../components/Trajectory.ts";

// Crear un grupo para los asteroides
const asteroids = new THREE.Group();
let asteroidLabels: Trajectory[] = []; // Aquí guardamos las trayectorias
let asteroidOrbitLines: THREE.Line[] = []; // Almacenamos las líneas de las órbitas de los asteroides

// Función para cargar asteroides desde la API y crear las órbitas
async function fetchAsteroids(scene: THREE.Scene) {
  try {
    const response = await fetch("https://data.nasa.gov/resource/b67r-rgxc.json");
    const data = await response.json();
    const trajectories: Trajectory[] = [];

    data.slice(0, 100).forEach((item: any) => {
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

      const moid_au = parseFloat(item.moid_au);
      const q_au_1 = parseFloat(item.q_au_1);

      // Determinar etiqueta (NEO, NEC, PHA)
      let label = "Unknown";
      if (moid_au < 0.3) {
        label = "NEO"; // Near-Earth Object
      }
      if (moid_au < 0.05) {
        label = "PHA"; // Potentially Hazardous Asteroid
      }
      if (q_au_1 < 1.3 && item.object.includes("P")) {
        label = "NEC"; // Near-Earth Comet
      }
      console.log("Label:", label);
      const trajectory = new Trajectory(name, smA, oI, aP, oE, aN, mAe, label);
      trajectories.push(trajectory);

      // Crear el asteroide
      const mesh = createAsteroidMesh();

      // Crear y añadir el sprite con la etiqueta
      const labelSprite = createTextSprite(`${name} - ${label}`);
      labelSprite.position.set(0, 1.6, 0); // Posición sobre el asteroide
      mesh.add(labelSprite);

      asteroids.add(mesh); // Añadir el asteroide a la escena
    });

    asteroidLabels = trajectories; // Guardar las trayectorias en la lista global

    // Añadir el grupo de asteroides a la escena después de cargar los datos
    return asteroids; // Retorna el grupo de asteroides
  } catch (error) {
    console.error("Error al obtener los datos de asteroides:", error);
  }
}

// Función para crear un Sprite con texto
function createTextSprite(message: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Configurar el tamaño del canvas y del texto
  context.font = "Bold 24px Arial";
  canvas.width = 256;
  canvas.height = 128;

  // Dibujar el fondo del texto
  context.fillStyle = "rgba(255, 255, 255, 0.8)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar el texto
  context.fillStyle = "black";
  context.fillText(message, 10, 40);

  // Crear la textura a partir del canvas
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  // Crear el material del sprite
  const material = new THREE.SpriteMaterial({ map: texture });

  // Crear el sprite y devolverlo
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(10, 5, 1); // Ajustar el tamaño del sprite
  return sprite;
}

// Crear la malla de un asteroide
function createAsteroidMesh(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1.6, 32, 32); // Tamaño pequeño
  const material = new THREE.MeshPhongMaterial({
    color: 0x888888, // Color gris
    shininess: 50, // Hace que el asteroide brille más
    specular: 0xaaaaaa, // Añade un poco de brillo especular (reflejo)
  });
  return new THREE.Mesh(geometry, material);
}

// Función auxiliar para calcular la anomalía media
function calculateMeanAnomaly(
  epoch_tdb: number,
  tp_tdb: number,
  p_yr: number
): number {
  const days_per_year = 365.25;
  const P_days = p_yr * days_per_year;
  const delta_t = epoch_tdb - tp_tdb;
  let M = ((2 * Math.PI) / P_days) * delta_t;
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  return M;
}

// Función para actualizar asteroides y sus órbitas
function updateAsteroids(timeDelta: number, selectedType: string, showOrbits: boolean, scene: THREE.Scene) {
    // Eliminar los asteroides previos
    while (asteroids.children.length) {
        asteroids.remove(asteroids.children[0]);
    }

    // Eliminar las órbitas previas si están activas
    if (!showOrbits) {
        asteroidOrbitLines.forEach(line => {
            scene.remove(line);
        });
        asteroidOrbitLines = [];
    }

    asteroidLabels.forEach((asteroid) => {
        if (selectedType === "ALL" || asteroid.label === selectedType) {
            const [x, y, z] = asteroid.propagate(timeDelta);
            const mesh = createAsteroidMesh();
            mesh.position.set(x * 100, y * 100, z * 100);
            asteroids.add(mesh);

            if (showOrbits) {
                // Crear y añadir la órbita solo si showOrbits es true
                const orbitLine = createAsteroidOrbitLine(asteroid);
                scene.add(orbitLine);
                asteroidOrbitLines.push(orbitLine); // Guardar la línea para removerla después si es necesario
            }
        }
    });

    // Añadir el grupo de asteroides a la escena
    scene.add(asteroids);
}

// Función para crear la órbita de un asteroide
function createAsteroidOrbitLine(asteroid: Trajectory): THREE.Line {
    const points = [];
    const segments = 100; // Cantidad de segmentos para la órbita

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const position = asteroid.propagate(angle);
        points.push(new THREE.Vector3(position[0] * 100, position[1] * 100, position[2] * 100)); // Escalado
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x888888 });
    return new THREE.Line(geometry, material);
}


export function useAsteroids() {
  return {
    asteroids, // Grupo de asteroides que se añade a la escena
    fetchAsteroids, // Cargar asteroides desde la API
    updateAsteroids, // Actualizar asteroides en cada frame
  };
}
