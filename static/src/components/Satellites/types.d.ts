export interface SatRec {
  name: string; // Common name
  satnum: string; // NORAD identifier
  // Position vector (ECI)
  r: {
    X: number;
    Y: number;
    Z: number;
  };
  // Veclocity vector (ECI)
  v: {
    X: number;
    Y: number;
    Z: number;
  };
  altitude: number,
  // Unit angular velocity
  w: {
    X: number;
    Y: number;
    Z: number;
  };
  // Angular speed
  speed: number;
};

export interface SatData_GPU {
  R: Float32Array;
  k_hat: Float32Array;
  w: Float32;
};