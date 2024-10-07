import * as THREE from "three";
import Trajectory from "../components/Trajectory.ts";

// Crear un grupo para los asteroides
const asteroids = new THREE.Group();
let asteroidLabels: Trajectory[] = []; // Aquí guardamos las trayectorias
let asteroidOrbitLines: THREE.Line[] = []; // Almacenamos las líneas de las órbitas de los asteroides
// Definir contadores para cada categoría
let necCount = 0;
let cometCount = 0;
let phaCount = 0;
let neoCount = 0;
let asteroidCount = 0;
let unknownCount = 0;

// Función para cargar asteroides desde la API y crear las órbitas
async function fetchAsteroids(scene: THREE.Scene) {
  try {
    // Reiniciar contadores antes de procesar nuevos datos
    resetCounters();

    const response = await fetch("https://data.nasa.gov/resource/b67r-rgxc.json");
    const data = await response.json();
    const trajectories: Trajectory[] = [];

    // Crear una lista para almacenar los NECs filtrados
    let necList: Trajectory[] = [];

    // Clasificación de los asteroides y cometas
    data.forEach((item: any) => {
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

      // Determinar la etiqueta
      let label = "Unknown";
      const isComet = item.object.includes("P") || item.object.includes("C");

      if (isComet) {
        if (q_au_1 < 1.3) {
          label = "NEC"; // Near-Earth Comet
          necCount++;
        } else {
          label = "Comet"; // Cometa regular
          cometCount++;
        }
      } else {
        if (moid_au < 0.05) {
          label = "PHA"; // Potentially Hazardous Asteroid
          phaCount++;
        } else if (moid_au < 0.3) {
          label = "NEO"; // Near-Earth Object
          neoCount++;
        } else {
          label = "Asteroid"; // Asteroide regular
          asteroidCount++;
        }
      }

      const trajectory = new Trajectory(name, smA, oI, aP, oE, aN, mAe, label);

      // Si es NEC, agregamos a la lista temporal de NECs
      if (label === "NEC") {
        necList.push(trajectory);
      } else {
        // Añadir el objeto directamente si no es NEC
        trajectories.push(trajectory);
      }
    });

    // Filtrar los NECs y quedarnos solo con 10 o 20
    const filteredNecs = necList.slice(0, 20); // Ajusta el número según lo que desees
    necCount = filteredNecs.length; // Actualizar el contador de NECs

    // Añadir los NECs filtrados a la lista final de trayectorias
    trajectories.push(...filteredNecs);

    asteroidLabels = trajectories; // Guardar las trayectorias en la lista global

    // Al final, imprimir el total de cada categoría
    console.log(`Total NEC: ${necCount}`);
    console.log(`Total Comet: ${cometCount}`);
    console.log(`Total PHA: ${phaCount}`);
    console.log(`Total NEO: ${neoCount}`);
    console.log(`Total Asteroid: ${asteroidCount}`);
    console.log(`Total Unknown: ${unknownCount}`);

    // Añadir el grupo de asteroides a la escena después de cargar los datos
    return asteroids; // Retorna el grupo de asteroides
  } catch (error) {
    console.error("Error al obtener los datos de asteroides:", error);
  }
}

// Función para reiniciar los contadores
function resetCounters() {
  necCount = 0;
  cometCount = 0;
  phaCount = 0;
  neoCount = 0;
  asteroidCount = 0;
  unknownCount = 0; // Si estás utilizando unknownCount
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
function updateAsteroids(
  timeDelta: number,
  selectedType: string,
  showOrbits: boolean,
  scene: THREE.Scene
) {
  // Eliminar los asteroides previos
  while (asteroids.children.length) {
    asteroids.remove(asteroids.children[0]);
  }

  // Eliminar las órbitas previas si están activas
  if (!showOrbits) {
    asteroidOrbitLines.forEach((line) => {
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
    points.push(
      new THREE.Vector3(position[0] * 100, position[1] * 100, position[2] * 100)
    ); // Escalado
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
    necCount, // Contador de NEC
    cometCount, // Contador de Cometas
    phaCount, // Contador de PHA
    neoCount, // Contador de NEO
    asteroidCount, // Contador de Asteroides
    unknownCount, // Contador de Unknown si lo usas
  };
}
