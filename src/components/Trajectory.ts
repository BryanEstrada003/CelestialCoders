/// Definición de la clase Trajectory
class Trajectory {
  name: string;
  smA: number;
  oI: number;
  aP: number;
  oE: number;
  aN: number;
  period: number;
  epochMeanAnomaly: number;
  trueAnomoly: number;
  position: [number, number, number];
  time: number;

  constructor(
    name: string,
    smA: number,
    oI: number,
    aP: number,
    oE: number,
    aN: number,
    idereal: number
  ) {
    this.name = name; // name the object
    this.smA = smA; // semi major axis
    this.oI = oI * 0.01745329; // orbital inclination --> convert degrees to radians
    this.aP = aP * 0.01745329; // argument of Perigee --> convert degrees to radians
    this.oE = oE; // orbital eccentricity
    this.aN = aN * 0.01745329; // ascending node --> convert degrees to radians
    this.period = idereal; // siderial period as a multiple of Earth's orbital period
    this.epochMeanAnomaly = idereal * 0.01745329; // mean anomaly at epoch
    this.trueAnomoly = 0; // initialize to mean anomaly at epoch
    this.position = [0, 0, 0];
    this.time = 0;
  }

  // Propagación de la trayectoria
  propagate(uA: number): [number, number, number] {
    const pos: [number, number, number] = [0, 0, 0];
    const theta = uA; // Update true anomaly
    const sLR = this.smA * Math.pow(1 - this.oE, 2); // Compute Semi-Latus Rectum
    const r = sLR / (1 + this.oE * Math.cos(theta)); // Compute radial distance

    // Compute position coordinates
    pos[0] =
      r *
      (Math.cos(this.aP + theta) * Math.cos(this.aN) -
        Math.cos(this.oI) * Math.sin(this.aP + theta) * Math.sin(this.aN));
    pos[1] =
      r *
      (Math.cos(this.aP + theta) * Math.sin(this.aN) +
        Math.cos(this.oI) * Math.sin(this.aP + theta) * Math.cos(this.aN));
    pos[2] = r * Math.sin(this.aP + theta) * Math.sin(this.oI);

    return pos;
  }
}

export default Trajectory;