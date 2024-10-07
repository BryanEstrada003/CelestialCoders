class Trajectory {
  name: string;
  smA: number;
  oI: number;
  aP: number;
  oE: number;
  aN: number;
  period: number;
  epochMeanAnomaly: number;
  trueAnomaly: number;
  position: [number, number, number];
  time: number;
  label: string; // Nueva propiedad para label

  constructor(
    name: string,
    smA: number,
    oI: number,
    aP: number,
    oE: number,
    aN: number,
    idereal: number,
    label: string // Añadimos label al constructor
  ) {
    this.name = name;
    this.smA = smA;
    this.oI = oI * (Math.PI / 180);
    this.aP = aP * (Math.PI / 180);
    this.oE = oE;
    this.aN = aN * (Math.PI / 180);
    this.period = idereal;
    this.epochMeanAnomaly = idereal * (Math.PI / 180);
    this.trueAnomaly = 0;
    this.position = [0, 0, 0];
    this.time = 0;
    this.label = label; // Guardamos el label
  }

  // Function to calculate the eccentric anomaly (E) using Kepler's equation
  calculateEccentricAnomaly(M: number, e: number, tolerance: number = 1e-6): number {
    let E = M;
    let delta = 1;
    while (delta > tolerance) {
      const newE = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      delta = Math.abs(newE - E);
      E = newE;
    }
    return E;
  }

  // Function to propagate the position based on time (in years)
  propagate(timeDelta: number): [number, number, number] {
    const pos: [number, number, number] = [0, 0, 0];

    // Update mean anomaly (M) with timeDelta
    const M = this.epochMeanAnomaly + ((2 * Math.PI / this.period) * timeDelta);

    // Calculate the eccentric anomaly (E) from the mean anomaly (M)
    const E = this.calculateEccentricAnomaly(M, this.oE);

    // Calculate the true anomaly (theta) from the eccentric anomaly (E)
    const theta = 2 * Math.atan2(
      Math.sqrt(1 + this.oE) * Math.sin(E / 2),
      Math.sqrt(1 - this.oE) * Math.cos(E / 2)
    );

    // Calculate the radial distance (r) using the true anomaly (theta)
    const sLR = this.smA * (1 - Math.pow(this.oE, 2)); // Semi-Latus Rectum
    const r = sLR / (1 + this.oE * Math.cos(theta)); // Radial distance

    // Calculate the 3D position using orbital parameters and true anomaly
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
