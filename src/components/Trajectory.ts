class Trajectory {
  name: string;
  smA: number; // Semi major axis
  oI: number; // Orbital inclination
  aP: number; // Argument of Perigee
  oE: number; // Orbital eccentricity
  aN: number; // Ascending node
  period: number; // Orbital period (sidereal)
  epochMeanAnomaly: number; // Mean anomaly at epoch
  trueAnomaly: number; // True anomaly (initial value at 0)
  position: [number, number, number]; // Position in 3D space
  time: number; // Time passed (to track progression)

  constructor(
    name: string,
    smA: number,
    oI: number,
    aP: number,
    oE: number,
    aN: number,
    idereal: number
  ) {
    this.name = name;
    this.smA = smA; // Semi major axis
    this.oI = oI * (Math.PI / 180); // Orbital inclination in radians
    this.aP = aP * (Math.PI / 180); // Argument of Perigee in radians
    this.oE = oE; // Orbital eccentricity
    this.aN = aN * (Math.PI / 180); // Ascending node in radians
    this.period = idereal; // Orbital period in years
    this.epochMeanAnomaly = idereal * (Math.PI / 180); // Mean anomaly at epoch
    this.trueAnomaly = 0; // Initial true anomaly (to be updated)
    this.position = [0, 0, 0]; // Initial position
    this.time = 0; // Time initialized at 0
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
