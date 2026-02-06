
export enum UnitSystem {
  SI = 'SI',
  ENGLISH = 'English'
}

export enum WorkConvention {
  BY_SYSTEM = 'BY_SYSTEM', // Q - W = dU (Engineering)
  ON_SYSTEM = 'ON_SYSTEM'  // Q + W = dU (Chemistry)
}

export enum SubstanceType {
  AIR = 'Air',
  WATER = 'Water',
  REFRIGERANT = 'R-134a (Approx)',
  CUSTOM_GAS = 'Custom Ideal Gas'
}

export enum EOSModel {
  IDEAL = 'Ideal Gas',
  VDW = 'Van der Waals',
  PR = 'Peng-Robinson'
}

export interface ThermoState {
  P: number; 
  T: number; 
  v: number; 
  u: number; 
  h: number; 
  s: number; 
  z?: number; // Compressibility factor
  f?: number; // Fugacity
  phi?: number; // Fugacity coefficient
  x?: number; 
  phase: string;
  label?: string;
}

export enum ScenarioType {
  PISTON_CYLINDER = 'Piston-Cylinder (Closed)',
  NOZZLE_DIFFUSER = 'Nozzle/Diffuser (Open)',
  TURBINE_COMPRESSOR = 'Turbine/Compressor (Open)',
  HEAT_EXCHANGER = 'Heat Exchanger (Open)'
}

export interface AntoineParams {
  A: number;
  B: number;
  C: number;
  Tmin: number;
  Tmax: number;
}

export interface ComponentData {
  name: string;
  formula: string;
  antoine: AntoineParams;
  Pc: number; // Critical P (kPa)
  Tc: number; // Critical T (K)
  omega: number; // Acentric factor
}
