
import { STEAM_SAT_TABLE, R_AIR, CP_AIR } from '../constants';
import { ThermoState, EOSModel } from '../types';

export const lerp = (x: number, x1: number, x2: number, y1: number, y2: number) => {
  if (x1 === x2) return y1;
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
};

export const getAntoinePsat = (A: number, B: number, C: number, T_Celsius: number) => {
  return Math.pow(10, A - B / (T_Celsius + C));
};

export const mmHgToKPa = (mmHg: number) => {
  return mmHg * (101.325 / 760);
};

// Fix: Added calculateIdealGasState to resolve "Module '../utils/thermo' has no exported member 'calculateIdealGasState'" errors.
/**
 * Calculates state properties for an Ideal Gas.
 */
export const calculateIdealGasState = (P: number, T: number, R = R_AIR, Cp = CP_AIR): ThermoState => {
  const v = (R * T) / Math.max(P, 0.0001);
  const Cv = Cp - R;
  const u = Cv * T;
  const h = Cp * T;
  // entropy relative to T=1K, P=1kPa
  const s = Cp * Math.log(Math.max(T, 0.001)) - R * Math.log(Math.max(P, 0.001));
  return { P, T, v, u, h, s, z: 1.0, phase: 'Ideal Gas' };
};

export const calculateStateWithEOS = (
  P: number, 
  T: number, 
  model: EOSModel, 
  substance: any,
  R = 0.4615
): ThermoState => {
  if (model === EOSModel.IDEAL) {
    const v = (R * T) / P;
    return { P, T, v, u: 0, h: 0, s: 0, z: 1.0, phase: 'Ideal Gas' };
  }

  // Peng-Robinson Simplified Implementation
  const { Pc, Tc, omega } = substance;
  const Tr = T / Tc;
  const Pr = P / Pc;
  const alpha = Math.pow(1 + (0.37464 + 1.54226 * omega - 0.26992 * omega * omega) * (1 - Math.sqrt(Tr)), 2);
  const a = 0.45724 * (R * R * Tc * Tc) / Pc * alpha;
  const b = 0.0778 * (R * Tc) / Pc;

  const A = (a * P) / (R * R * T * T);
  const B = (b * P) / (R * T);

  // Solve cubic for Z: Z^3 - (1-B)Z^2 + (A - 3B^2 - 2B)Z - (AB - B^2 - B^3) = 0
  // Simplified: Returning an approximate Z for visualization purposes
  const z = 1 + B - A * B / (1 + B); 
  const v = (z * R * T) / P;

  // Fugacity Coefficient (phi) approximation
  const phi = Math.exp(z - 1 - Math.log(Math.max(z - B, 0.0001)) - (A / (2 * Math.sqrt(2) * B)) * Math.log((z + (1 + Math.sqrt(2)) * B) / (z + (1 - Math.sqrt(2)) * B)));

  return { 
    P, T, v, u: 0, h: 0, s: 0, z, 
    phi, f: P * phi,
    phase: z < 0.5 ? 'Liquid' : 'Vapor'
  };
};

export const getWaterSat = (key: 'T' | 'P', val: number) => {
  const table = STEAM_SAT_TABLE;
  let i = 0;
  const lookupVal = key === 'T' ? (val > 374 ? 374 : val) : (val > 22060 ? 22060 : val);
  while (i < table.length - 1 && table[i+1][key] < lookupVal) i++;
  const row1 = table[i];
  const row2 = table[i+1] || table[i];
  const x1 = row1[key];
  const x2 = row2[key];

  return {
    T: lerp(lookupVal, x1, x2, row1.T, row2.T),
    P: lerp(lookupVal, x1, x2, row1.P, row2.P),
    vf: lerp(lookupVal, x1, x2, row1.vf, row2.vf),
    vg: lerp(lookupVal, x1, x2, row1.vg, row2.vg),
    hf: lerp(lookupVal, x1, x2, row1.hf, row2.hf),
    hg: lerp(lookupVal, x1, x2, row1.hg, row2.hg),
    sf: lerp(lookupVal, x1, x2, row1.sf, row2.sf),
    sg: lerp(lookupVal, x1, x2, row1.sg, row2.sg),
  };
};

export const calculateWaterState = (P?: number, T?: number, x?: number): ThermoState => {
  if (x !== undefined && (P !== undefined || T !== undefined)) {
    const sat = getWaterSat(P !== undefined ? 'P' : 'T', P !== undefined ? P : (T || 0) - 273.15);
    const v = sat.vf + x * (sat.vg - sat.vf);
    const h = sat.hf + x * (sat.hg - sat.hf);
    const s = sat.sf + x * (sat.sg - sat.sf);
    return { P: sat.P, T: sat.T + 273.15, v, u: h - sat.P * v, h, s, x, phase: 'Mixture' };
  }
  const PK = P || 101.325;
  const TK = T || 373.15;
  const sat = getWaterSat('P', PK);
  const TC = TK - 273.15;
  if (TC > sat.T) {
    return { P: PK, T: TK, v: (0.4615 * TK) / PK, u: 2500, h: 2675, s: 7.3, phase: 'Superheated' };
  } else {
    return { P: PK, T: TK, v: 0.001, u: 400, h: 419, s: 1.3, phase: 'Compressed Liquid' };
  }
};
