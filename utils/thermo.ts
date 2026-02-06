
import { STEAM_SAT_TABLE, R_AIR, CP_AIR, CV_AIR } from '../constants';
import { ThermoState, EOSModel } from '../types';

export const lerp = (x: number, x1: number, x2: number, y1: number, y2: number) => {
  if (Math.abs(x1 - x2) < 1e-9) return y1;
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
};

export const getAntoinePsat = (A: number, B: number, C: number, T_Celsius: number) => {
  return Math.pow(10, A - B / (T_Celsius + C));
};

export const mmHgToKPa = (mmHg: number) => {
  return mmHg * (101.325 / 760);
};

/**
 * Calculates state properties for an Ideal Gas.
 * Uses reference state T=298.15K, P=101.325kPa
 */
export const calculateIdealGasState = (P: number, T: number, R = R_AIR, Cp = CP_AIR): ThermoState => {
  const v = (R * T) / Math.max(P, 0.1);
  const Cv = Cp - R;
  const T_ref = 298.15;
  const P_ref = 101.325;
  
  const u = Cv * (T - T_ref);
  const h = Cp * (T - T_ref);
  // s = Cp*ln(T/Tref) - R*ln(P/Pref)
  const s = Cp * Math.log(Math.max(T, 1) / T_ref) - R * Math.log(Math.max(P, 0.1) / P_ref);
  
  return { P, T, v, u, h, s, z: 1.0, phase: 'Ideal Gas' };
};

/**
 * Peng-Robinson EOS Solver
 * Solves Z^3 - (1-B)Z^2 + (A - 3B^2 - 2B)Z - (AB - B^2 - B^3) = 0
 */
export const calculateStateWithEOS = (
  P: number, 
  T: number, 
  model: EOSModel, 
  substance: any,
  R_val = 0.4615
): ThermoState => {
  if (model === EOSModel.IDEAL) {
    return calculateIdealGasState(P, T, R_val);
  }

  const { Pc, Tc, omega } = substance;
  const Tr = T / Tc;
  const Pr = P / Pc;
  
  // PR Parameters
  const kappa = 0.37464 + 1.54226 * omega - 0.26992 * omega * omega;
  const alpha = Math.pow(1 + kappa * (1 - Math.sqrt(Tr)), 2);
  const a = 0.45724 * (R_val * R_val * Tc * Tc) / Pc * alpha;
  const b = 0.07780 * (R_val * Tc) / Pc;

  const A = (a * P) / (R_val * R_val * T * T);
  const B = (b * P) / (R_val * T);

  // Cubic coefficients for Z
  const c2 = B - 1;
  const c1 = A - 3 * B * B - 2 * B;
  const c0 = B * B * B + B * B - A * B;

  // Solving cubic using a simple Newton-Raphson for the largest root (vapor) or smallest (liquid)
  let z = 1.0; 
  for (let i = 0; i < 10; i++) {
    const f = z * z * z + c2 * z * z + c1 * z + c0;
    const df = 3 * z * z + 2 * c2 * z + c1;
    z = z - f / df;
  }

  const v = (z * R_val * T) / P;
  const phase = z < 0.3 ? 'Liquid Region' : z > 0.7 ? 'Vapor Region' : 'Supercritical';

  return { 
    P, T, v, u: 0, h: 0, s: 0, z, 
    phase 
  };
};

export const getWaterSat = (key: 'T' | 'P', val: number) => {
  const table = STEAM_SAT_TABLE;
  const lookupVal = key === 'T' ? Math.max(0.01, Math.min(val, 374)) : Math.max(0.6117, Math.min(val, 22060));
  
  let i = 0;
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
  // Quality-based lookup
  if (x !== undefined) {
    const sat = getWaterSat(P !== undefined ? 'P' : 'T', P !== undefined ? P : (T || 0) - 273.15);
    const v = sat.vf + x * (sat.vg - sat.vf);
    const h = sat.hf + x * (sat.hg - sat.hf);
    const s = sat.sf + x * (sat.sg - sat.sf);
    return { P: sat.P, T: sat.T + 273.15, v, u: h - sat.P * v, h, s, x, phase: 'Saturated Mixture' };
  }

  const PK = P || 101.325;
  const TK = T || 373.15;
  const sat = getWaterSat('P', PK);
  const TC = TK - 273.15;

  if (TC > sat.T + 0.1) {
    // Superheated approximation
    const v = (0.4615 * TK) / PK;
    return { P: PK, T: TK, v, u: 2500 + 1.5 * TC, h: 2675 + 2.0 * TC, s: sat.sg + 0.005 * (TC - sat.T), phase: 'Superheated' };
  } else if (TC < sat.T - 0.1) {
    // Compressed Liquid approximation
    return { P: PK, T: TK, v: 0.001, u: 4.18 * TC, h: 4.18 * TC + PK * 0.001, s: 4.18 * Math.log(TK / 273.15), phase: 'Compressed Liquid' };
  } else {
    // Exactly at saturation
    return { P: PK, T: sat.T + 273.15, v: sat.vf, u: sat.hf, h: sat.hf, s: sat.sf, x: 0, phase: 'Saturated Liquid' };
  }
};
