
import { ComponentData } from './types';

export const R_AIR = 0.287; // kJ/kg-K
export const CP_AIR = 1.005; // kJ/kg-K
export const CV_AIR = 0.718; // kJ/kg-K
export const K_AIR = 1.4;

export const STEAM_SAT_TABLE = [
  { T: 0.01, P: 0.6117, vf: 0.001, vg: 206.1, hf: 0, hg: 2501, sf: 0, sg: 9.155 },
  { T: 20, P: 2.339, vf: 0.001002, vg: 57.76, hf: 83.9, hg: 2537.4, sf: 0.2965, sg: 8.666 },
  { T: 50, P: 12.35, vf: 0.001012, vg: 12.03, hf: 209.3, hg: 2591.3, sf: 0.7038, sg: 8.075 },
  { T: 100, P: 101.4, vf: 0.001043, vg: 1.673, hf: 419.1, hg: 2675.6, sf: 1.307, sg: 7.354 },
  { T: 150, P: 476.2, vf: 0.001091, vg: 0.3925, hf: 632.2, hg: 2745.9, sf: 1.842, sg: 6.837 },
  { T: 200, P: 1555, vf: 0.001157, vg: 0.1272, hf: 852.3, hg: 2792.0, sf: 2.331, sg: 6.430 },
  { T: 250, P: 3976, vf: 0.001252, vg: 0.0500, hf: 1085.8, hg: 2800.4, sf: 2.794, sg: 6.072 },
  { T: 300, P: 8588, vf: 0.001404, vg: 0.0216, hf: 1345.0, hg: 2750.1, sf: 3.255, sg: 5.706 },
  { T: 350, P: 16530, vf: 0.001741, vg: 0.0088, hf: 1671.2, hg: 2563.6, sf: 3.778, sg: 5.211 },
  { T: 374, P: 22060, vf: 0.003106, vg: 0.0031, hf: 2099, hg: 2099, sf: 4.43, sg: 4.43 },
];

export const ANTOINE_DB: Record<string, ComponentData> = {
  Water: {
    name: 'Water',
    formula: 'H2O',
    antoine: { A: 8.07131, B: 1730.63, C: 233.426, Tmin: 1, Tmax: 100 },
    Pc: 22060, Tc: 647.1, omega: 0.344
  },
  Ethanol: {
    name: 'Ethanol',
    formula: 'C2H5OH',
    antoine: { A: 8.20417, B: 1642.89, C: 230.3, Tmin: -57, Tmax: 80 },
    Pc: 6148, Tc: 513.9, omega: 0.645
  },
  Methane: {
    name: 'Methane',
    formula: 'CH4',
    antoine: { A: 6.61184, B: 389.93, C: 266.0, Tmin: -180, Tmax: -150 },
    Pc: 4599, Tc: 190.6, omega: 0.011
  },
  Benzene: {
    name: 'Benzene',
    formula: 'C6H6',
    antoine: { A: 6.90565, B: 1211.033, C: 220.79, Tmin: 8, Tmax: 80 },
    Pc: 4895, Tc: 562.2, omega: 0.211
  }
};

export const INTERACTION_DB: Record<string, Record<string, number>> = {
  Ethanol: { Water: 1.2, Benzene: 1.8 },
  Water: { Ethanol: 1.2, Benzene: 3.2 },
  Benzene: { Ethanol: 1.8, Water: 3.2 }
};
