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

export interface SatDetail {
  commonName: string;
  officialName: string;
  country: string;
  ownerCountry: string;
  owner: string;
  users: string;
  purpose: string;
  detailedPurpose: string;
  orbitClass: string;
  orbitType: string;
  Omega: string;
  r_p: string;
  r_a: string;
  e: string;
  i: string;
  T: string;
  m_launch: string;
  m_dry: string;
  P: string;
  t_0: string;
  L: string;
  contractor: string;
  contractorCountry: string;
  launchSite: string;
  launchVehicle: string;
  COSPAR: string;
  NORAD: string;
  comments: string;
  dataSrc: string;
  srcURLs: string[];
};

export interface SatCat {
  intldes: string; // international designation
  noradCatId: string;
  objectType: string;
  satname: string;
  country: string;
  launch: string;
  site: string;
  decay: string | null;
  period: string | null;
  inclination: string | null;
  apogee: string | null;
  perigee: string | null;
  comment: string | null;
  commentcode: string | null;
  rcsvalue: string;
  rcsSize: string | null;
  file: string;
  launchYear: string;
  launchNum: string;
  launchPiece: string;
  current: string;
  objectName: string;
  objectId: string;
  objectNumber: string;
};