
import React, { useState, useMemo } from 'react';
import { SubstanceType, WorkConvention, UnitSystem } from '../types';
import { calculateIdealGasState, calculateWaterState } from '../utils/thermo';
import { PistonCylinder } from './VisualComponents';
import UnitInput from '../components/UnitInput';
import { convertInput, formatTotalEnergy, formatTemp } from '../utils/conversions';

const FirstLaw: React.FC<{ convention: WorkConvention; units: UnitSystem }> = ({ convention, units }) => {
  const [dispM, setDispM] = useState(1);
  const [substance, setSubstance] = useState<SubstanceType>(SubstanceType.AIR);
  const [dispP1, setDispP1] = useState(100);
  const [dispT1, setDispT1] = useState(25);
  const [dispP2, setDispP2] = useState(200);
  const [process, setProcess] = useState<'isothermal' | 'isobaric' | 'isochoric'>('isothermal');
  const [viewState, setViewState] = useState<1 | 2>(2);

  const isSI = units === UnitSystem.SI;

  const results = useMemo(() => {
    const m = convertInput(dispM, 'M', units);
    const P1 = convertInput(dispP1, 'P', units);
    const T1 = convertInput(dispT1, 'T', units);
    const P2 = convertInput(dispP2, 'P', units);

    const s1 = substance === SubstanceType.WATER ? calculateWaterState(P1, T1) : calculateIdealGasState(P1, T1);
    let T2 = T1;
    let P_final = P2;

    if (process === 'isothermal') { T2 = T1; P_final = P2; } 
    else if (process === 'isobaric') { P_final = P1; T2 = T1 * (P2 / P1); } 
    else if (process === 'isochoric') { P_final = P2; T2 = T1 * (P2 / P1); }

    const s2 = substance === SubstanceType.WATER ? calculateWaterState(P_final, T2) : calculateIdealGasState(P_final, T2);
    const dU = m * (s2.u - s1.u);
    
    let W_out = 0;
    if (process === 'isothermal') {
      const R = substance === SubstanceType.WATER ? 0.4615 : 0.287;
      W_out = m * R * T1 * Math.log(s2.v / s1.v);
    } else if (process === 'isobaric') {
      W_out = P1 * m * (s2.v - s1.v);
    } else if (process === 'isochoric') {
      W_out = 0;
    }
    
    const isEngineering = convention === WorkConvention.BY_SYSTEM;
    const W_display = isEngineering ? W_out : -W_out;
    const Q = dU + W_out; 

    return { dU, Q, W: W_display, s1, s2 };
  }, [dispM, dispP1, dispT1, dispP2, process, convention, substance, units]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Educational Header */}
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-bolt"></i> Conservation Laws
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Closed System Energy Balances</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Apply the <strong>First Law of Thermodynamics</strong> ($Q - W = \Delta U$) to a fixed mass of fluid. Observe how different constraints (Constant Pressure, Volume, or Temperature) change the distribution of heat and work.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Process Configuration</h3>
            <div className="space-y-6">
              <UnitInput label="System Mass" value={dispM} onChange={setDispM} unit={isSI ? 'kg' : 'lbm'} onUnitChange={()=>{}} options={[isSI ? 'kg' : 'lbm']} />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Process Constraint</label>
                <select value={process} onChange={e => setProcess(e.target.value as any)} className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold bg-slate-50 outline-none focus:ring-4 focus:ring-teal-500/10">
                  <option value="isothermal">Isothermal (T = const)</option>
                  <option value="isobaric">Isobaric (P = const)</option>
                  <option value="isochoric">Isochoric (V = const)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-50">
                 <UnitInput label="Inlet P (P1)" value={dispP1} onChange={setDispP1} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={['kPa']} />
                 <UnitInput label="Inlet T (T1)" value={dispT1} onChange={setDispT1} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={['°C']} />
                 <UnitInput label="Exit P (P2)" value={dispP2} onChange={setDispP2} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={['kPa']} />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Energy Solution Audit</h4>
            <div className="space-y-1">
               <Row label="Internal Energy ΔU" value={formatTotalEnergy(results.dU, units)} />
               <Row label="Heat Transfer (Q)" value={formatTotalEnergy(results.Q, units)} color={results.Q >= 0 ? 'text-teal-400' : 'text-rose-400'} />
               <Row label="Work Produced (W)" value={formatTotalEnergy(results.W, units)} color={results.W >= 0 ? 'text-indigo-400' : 'text-rose-400'} />
            </div>
          </section>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col items-center min-h-[700px]">
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-12 shadow-inner">
               <button onClick={() => setViewState(1)} className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all ${viewState === 1 ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-400'}`}>INITIAL STATE</button>
               <button onClick={() => setViewState(2)} className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all ${viewState === 2 ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400'}`}>FINAL STATE</button>
            </div>

            <div className="w-full flex justify-between items-end mb-10 pb-6 border-b border-slate-100">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Simulation Context</p>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{viewState === 1 ? 'Start Point' : 'End Point'}</h4>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Temp</p>
                  <p className="text-3xl font-mono font-black text-indigo-900 tracking-tighter">{formatTemp(viewState === 1 ? results.s1.T : results.s2.T, units)}</p>
               </div>
            </div>

            <div className="w-full h-[500px] flex items-center justify-center">
              <PistonCylinder 
                volume={viewState === 1 ? results.s1.v : results.s2.v} 
                temperature={viewState === 1 ? results.s1.T : results.s2.T} 
                heatTransfer={viewState === 2 ? results.Q : 0} 
                work={viewState === 2 ? results.W : 0} 
                substance={substance}
                isLocked={process === 'isochoric'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group transition-colors hover:bg-white/5 px-2 rounded-lg">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-400">{label}</span>
    <span className={`text-lg font-bold font-mono ${color || 'text-white'}`}>{value}</span>
  </div>
);

export default FirstLaw;
