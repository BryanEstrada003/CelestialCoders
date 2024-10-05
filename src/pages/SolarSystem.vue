<template>
  <div ref="rendererContainer" class="renderer-container">
    <Planet :position="28" :size="3.2" :texture="mercury" />
    <Planet :position="44" :size="5.8" :texture="venus" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Planet from "../components/Planet.vue";
import venus from "../assets/venus.jpg";
import mercury from "../assets/mercury.jpg";
import sunTexture from "../assets/sun.jpg"; // Importar la textura del sol
import starsTexture from "../assets/stars.jpg";
import Trajectory from "../components/Trajectory.ts";

// Variables globales
const epoch: Date = new Date("December 9, 2014");
let simSpeed: number = 1;
let solid: boolean = false;
let solidLabels: boolean = false;

// Planetas predefinidos
const planets: Trajectory[] = [
  new Trajectory("Venus", 0.72333199, 3.39471, 54.9, 0.00677323, 76.7, 0.615),
  new Trajectory("theEarth", 1, 0.00005, 102.94719, 0.01671022, 0, 1),
  new Trajectory("Mars", 1.52366231, 1.85061, 286.5, 0.09339, 49.57854, 1.881),
  new Trajectory("theMoon", 0.15, 5.14, 318.0634, 0.0549006, 125.1228, 0.3),
];

// Función para calcular la anomalía media (epochMeanAnomaly)
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
  if (M < 0) {
    M += 2 * Math.PI;
  }
  return M;
}

// Crear un array vacío para almacenar los objetos Trajectory
let asteroidLabels: Trajectory[] = [];

// Función para recorrer el archivo JSON y crear los objetos Trajectory
fetch("https://data.nasa.gov/resource/b67r-rgxc.json")
  .then((response) => response.json())
  .then((data) => {
    const trajectories: Trajectory[] = [];
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

      const trajectory = new Trajectory(name, smA, oI, aP, oE, aN, mAe);
      trajectories.push(trajectory);
    });
    console.log(trajectories);
  })
  .catch((error) => console.error("Error al obtener los datos:", error));

let heavenlyBodies: Trajectory[] = planets.concat(asteroidLabels);

// Función para añadir un nodo
function addNode(
  identifier: string,
  cR: number,
  cG: number,
  cB: number,
  radius: number
): boolean {
  console.log(
    `Adding node: ${identifier}, color: ${cR}, ${cG}, ${cB}, radius: ${radius}`
  );
  return false;
}

// Función para añadir un nodo hijo
function addChildNode(
  cID: string,
  pID: string,
  cR: number,
  cG: number,
  cB: number,
  radius: number
): boolean {
  console.log(
    `Adding child node: ${cID} under ${pID}, color: ${cR}, ${cG}, ${cB}, radius: ${radius}`
  );
  return false;
}

// Función para añadir una etiqueta
function addLabel(identifier: string): void {
  console.log(`Adding label: ${identifier}`);
}

// Función para calcular la anomalía excéntrica a partir de la verdadera
function trueToEccentricAnomaly(e: number, f: number): number {
  return 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(f / 2));
}

// Función para calcular la anomalía excéntrica a partir de la anomalía media
function meanToEccentricAnomaly(e: number, M: number): number {
  let tol = 0.0001; // Tolerancia
  let eAo = M; // Inicializar anomalía excéntrica con la anomalía media
  let ratio = 1; // Inicializar el ratio mayor que la tolerancia
  let eccentricAnomaly: number = 0;

  while (Math.abs(ratio) > tol) {
    let f_E = eAo - e * Math.sin(eAo) - M;
    let f_Eprime = 1 - e * Math.cos(eAo);
    ratio = f_E / f_Eprime;
    if (Math.abs(ratio) > tol) {
      eAo = eAo - ratio;
    } else {
      eccentricAnomaly = eAo;
    }
  }
  return eccentricAnomaly;
}

// Función para calcular la anomalía verdadera a partir de la excéntrica
function eccentricToTrueAnomaly(e: number, E: number): number {
  return 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));
}

// Función para actualizar la posición
function updatePosition(): void {
  heavenlyBodies.forEach((body) => {
    const currentPosition = body.propagate(body.trueAnomoly);
    const [Xpos, Ypos, Zpos] = currentPosition;
    console.log(
      `Updating position of ${body.name}: X=${Xpos}, Y=${Ypos}, Z=${Zpos}`
    );

    const n = (2 * Math.PI) / (body.period * 365.25);
    const eA = trueToEccentricAnomaly(body.oE, body.trueAnomoly);
    const m0 = eA - body.oE * Math.sin(eA);
    const deltaTime = simSpeed * n;
    const mA = deltaTime + m0;

    body.time += deltaTime;
    const newEccentricAnomaly = meanToEccentricAnomaly(body.oE, mA);
    body.trueAnomoly = eccentricToTrueAnomaly(body.oE, newEccentricAnomaly);
  });

  updateTheDate();
}

// Función para alternar visibilidad de órbitas
function toggleOrbits(): void {
  const button = document.getElementById("orbits") as HTMLInputElement;
  solid = !solid;
  button.value = solid ? "Orbits Off" : "Orbits On";
  const opacity = solid ? 1 : 0;

  heavenlyBodies.forEach((body) => {
    const orbitMat = document.getElementById(body.name + "OrbitMat");
    if (orbitMat) {
      orbitMat.setAttribute("transparency", opacity.toString());
    }
  });
}

// Función para alternar visibilidad de etiquetas
function toggleLabels(): void {
  const button = document.getElementById("labels") as HTMLInputElement;
  solidLabels = !solidLabels;
  button.value = solidLabels ? "Labels Off" : "Labels On";
  const opacity = solidLabels ? 1 : 0;

  asteroidLabels.forEach((label) => {
    const labelMat = document.getElementById(label.name + "LabelMat");
    if (labelMat) {
      labelMat.setAttribute("transparency", opacity.toString());
    }
  });
}

// Función para trazar las órbitas
function traceOrbits(): void {
  heavenlyBodies.forEach((body) => {
    let orbitCoords = "";
    let orbIndices = "";
    let i = 0.0;
    let j = 0;

    while (i <= 2 * Math.PI) {
      const orbPos = body.propagate(i);
      orbitCoords += `${orbPos[0].toFixed(2)} ${orbPos[1].toFixed(
        2
      )} ${orbPos[2].toFixed(2)} `;
      orbIndices += `${j} `;
      i += 0.0785;
      j += 1;
    }
    orbIndices += "-1";

    const s = document.createElement("Shape");
    s.setAttribute("id", body.name + "Orbit");

    const app = document.createElement("Appearance");
    const mat = document.createElement("Material");
    const omat = document.getElementById(body.name + "Mat");
    const oMatC = omat?.getAttribute("diffuseColor") || "0 0 0";
    mat.setAttribute("emissiveColor", oMatC);
    mat.setAttribute("id", body.name + "OrbitMat");
    app.appendChild(mat);
    s.appendChild(app);

    const line = document.createElement("IndexedLineSet");
    line.setAttribute("coordIndex", orbIndices);
    const coords = document.createElement("Coordinate");
    coords.setAttribute("point", orbitCoords);
    line.appendChild(coords);

    s.appendChild(line);
    const ot = document.getElementById("theSun");
    ot?.appendChild(s);
  });
}

// Función para actualizar la fecha simulada
function updateTheDate(): void {
  epoch.setTime(epoch.getTime() + simSpeed * 24 * 3600000);
  const modelDate = document.getElementById("modelDate");
  if (modelDate) {
    modelDate.textContent = `${
      epoch.getMonth() + 1
    }-${epoch.getDate()}-${epoch.getFullYear()}`;
  }
}

// Función principal para iniciar la actualización
function startUpdate(): void {
  heavenlyBodies.forEach((body) => {
    if (body.name === "theMoon") {
      addChildNode(body.name, "theEarth", 0.7, 0.7, 0.7, 0.06);
    } else {
      addNode(body.name, 0.3, 0.3, 0.3, 0.05);
    }
  });

  asteroidLabels.forEach((label) => addLabel(label));

  heavenlyBodies.forEach((body) => {
    const n = (2 * Math.PI) / (body.period * 365.25);
    body.time = body.epochMeanAnomaly / n;
    const eccAnom = meanToEccentricAnomaly(body.oE, body.epochMeanAnomaly);
    body.trueAnomoly = eccentricToTrueAnomaly(body.oE, eccAnom);
  });

  traceOrbits();
  setInterval(updatePosition, 50);
}

// Función para leer el valor del control deslizante
function showValue(newValue: number): void {
  simSpeed = newValue * 0.01;
}

export default defineComponent({
  name: "SolarSystem",
  components: {
    Planet,
  },
  setup() {
    // Refs
    const rendererContainer = ref<HTMLDivElement | null>(null);

    // Variables de THREE.js
    let renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      orbit: OrbitControls;
    let sun: THREE.Mesh;

    // Función para inicializar la escena
    const init = () => {
      // Crear el renderer y añadirlo al contenedor
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererContainer.value?.appendChild(renderer.domElement);

      // Crear la escena
      scene = new THREE.Scene();

      // Configurar la cámara
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(-90, 140, 140);

      // Controles de órbita
      orbit = new OrbitControls(camera, renderer.domElement);
      orbit.update();

      // Añadir luz ambiental
      const ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      const cubeTextureLoader = new THREE.CubeTextureLoader();
      scene.background = cubeTextureLoader.load([
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture,
        starsTexture,
      ]);

      // Cargar textura y crear el Sol
      const textureLoader = new THREE.TextureLoader();
      const sunGeo = new THREE.SphereGeometry(16, 30, 30);
      const sunMat = new THREE.MeshBasicMaterial({
        map: textureLoader.load(sunTexture),
      });
      sun = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sun);

      // Añadir la luz del Sol
      const pointLight = new THREE.PointLight(0xffffff, 2, 300);
      scene.add(pointLight);
    };

    // Función de animación
    const animate = () => {
      // Rotación del Sol
      sun.rotateY(0.004);

      // Renderizar la escena
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Inicializar escena y animación cuando el componente esté montado
    onMounted(() => {
      init();
      animate();

      // Ajustar el tamaño del canvas cuando se redimensiona la ventana
      window.addEventListener("resize", () => {
        if (camera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      });
    });

    return { rendererContainer, mercury, venus }; // Retornar el contenedor para su uso en el template
  },
});
</script>

<style>
/* Ajuste de la vista para que ocupe toda la pantalla */
.renderer-container {
  width: 100%;
  height: 100vh;
}
</style>
