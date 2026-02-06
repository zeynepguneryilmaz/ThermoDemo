
import { UnitSystem } from '../types';

// Constants
const KPA_TO_PSI = 0.145038;
const M3KG_TO_FT3LBM = 16.0185;
const KJKG_TO_BTULBM = 0.429923;
const KG_TO_LBM = 2.20462;

// Temperature
export const toKelvin = (val: number, unit: 'K' | 'C' | 'F' | 'R') => {
  if (unit === 'K') return val;
  if (unit === 'C') return val + 273.15;
  if (unit === 'F') return (val + 459.67) * (5/9);
  if (unit === 'R') return val * (5/9);
  return val;
};

export const fromKelvin = (val: number, target: UnitSystem) => {
  if (target === UnitSystem.SI) return val - 273.15; // Default display in Celsius for SI
  return val * 1.8 - 459.67; // Default display in Fahrenheit for English
};

export const formatTemp = (k: number, unit: UnitSystem) => {
  if (unit === UnitSystem.SI) return `${(k - 273.15).toFixed(1)} °C`;
  return `${(k * 1.8 - 459.67).toFixed(1)} °F`;
};

// Pressure
export const toKPa = (val: number, unit: string) => {
  if (unit === 'kPa') return val;
  if (unit === 'bar') return val * 100;
  if (unit === 'atm') return val * 101.325;
  if (unit === 'psi') return val / KPA_TO_PSI;
  return val;
};

export const formatPressure = (kpa: number, unit: UnitSystem) => {
  if (unit === UnitSystem.SI) return `${kpa.toFixed(1)} kPa`;
  return `${(kpa * KPA_TO_PSI).toFixed(1)} psi`;
};

// Energy (h, u)
export const formatEnergy = (kjkg: number, unit: UnitSystem) => {
  if (unit === UnitSystem.SI) return `${kjkg.toFixed(1)} kJ/kg`;
  return `${(kjkg * KJKG_TO_BTULBM).toFixed(1)} Btu/lb`;
};

// Total Energy (Q, W)
export const formatTotalEnergy = (kj: number, unit: UnitSystem) => {
  if (unit === UnitSystem.SI) return `${kj.toFixed(1)} kJ`;
  return `${(kj * 0.947817).toFixed(1)} Btu`;
};

// Specific Volume
export const formatVolume = (m3kg: number, unit: UnitSystem) => {
  if (unit === UnitSystem.SI) return `${m3kg.toFixed(4)} m³/kg`;
  return `${(m3kg * M3KG_TO_FT3LBM).toFixed(3)} ft³/lb`;
};

// Generic converter for logic
export const convertInput = (val: number, type: 'P' | 'T' | 'M', system: UnitSystem): number => {
  if (system === UnitSystem.SI) return val;
  if (type === 'P') return val / KPA_TO_PSI; // Input was PSI, convert to kPa
  if (type === 'T') return (val + 459.67) * (5/9); // Input was F, convert to K
  if (type === 'M') return val / KG_TO_LBM; // Input was lbm, convert to kg
  return val;
};
