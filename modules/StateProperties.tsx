
import React, { useState, useMemo } from 'react';
import { SubstanceType, UnitSystem, EOSModel, ThermoState } from '../types';
import { calculateWaterState, calculateStateWithEOS } from '../utils/thermo';
import { formatPressure, formatTemp, formatEnergy } from '../utils/conversions';
import { UnifiedParticleSim } from './VisualComponents';
import { ANTOINE_DB } from '../constants';
import UnitInput from '../components/UnitInput';

const StateProperties: React.FC<{ units: UnitSystem }> = ({ units }) => {
  const [substance, setSubstance] = useState('Water');
  const [model, setModel] = useState<EOSModel>(EOSModel.IDEAL);
  const [p, setP] = useState(101.325);
  const [t, setT] = useState(373.15);
  
  const isSI = units === UnitSystem.SI;

  const state = useMemo(() => {
    try {
      if (substance === 'Water') return calculateWaterState(p, t);
      return calculateStateWithEOS(p, t, model, ANTOINE_DB[substance]);
    } catch (e) {
      return calculateWaterState(101.325, 373.15);
    }
  }, [substance, model, p, t]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Educational Header */}
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-graduation-cap"></i> Fluid Physics
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Fluid Properties & EOS</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Understand how substances behave under different pressures and temperatures. Use the <strong>Ideal Gas Law</strong> for low-density approximations or <strong>Peng-Robinson (EOS)</strong> for rigorous real-gas modeling near critical points.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Input Controls</h3>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Working Species</label>
              <select value={substance} onChange={e => setSubstance(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all">
                {Object.keys(ANTOINE_DB).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {Object.values(EOSModel).map(m => (
                <button key={m} onClick={() => setModel(m)} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${model === m ? 'bg-white shadow-md text-teal-600' : 'text-slate-400'}`}>
                  {m}
                </button>
              ))}
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <UnitInput label="System Pressure" value={isSI ? p : p * 0.145} onChange={val => setP(isSI ? val : val / 0.145)} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={['kPa']} />
              <UnitInput label="System Temp" value={isSI ? t - 273.15 : (t * 1.8 - 459.67)} onChange={val => setT(isSI ? val + 273.15 : (val + 459.67) * 5/9)} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={['°C']} />
            </div>
          </section>

          <section className="bg-indigo-900 p-10 rounded-[2.5rem] shadow-xl text-white">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">State Vectors</h4>
            <div className="space-y-1">
               <Row label="Current Phase" value={state.phase} />
               <Row label="Comp. Factor (Z)" value={(state.z || 1).toFixed(4)} />
               <Row label="Sp. Enthalpy" value={formatEnergy(state.h, units)} />
               <Row label="Pressure P" value={formatPressure(state.P, units)} />
               <Row label="Temperature T" value={formatTemp(state.T, units)} />
            </div>
          </section>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
             <div className="w-full mb-10 pb-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Molecular Visualization</p>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tighter mt-1 italic">{state.phase} Observation</h4>
                </div>
                <div className="flex gap-2">
                   <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">P: {state.P.toFixed(1)} kPa</div>
                </div>
             </div>
             <div className="flex-1 rounded-[2.5rem] overflow-hidden">
                <UnifiedParticleSim temperature={state.T} density={state.v < 0.1 ? 0.9 : 0.15} phase={state.phase} height={500} substanceA={substance} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 group last:border-0 transition-colors hover:bg-white/5 px-2 rounded-lg">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-400">{label}</span>
    <span className="text-lg font-bold font-mono text-white">{value}</span>
  </div>
);

export default StateProperties;
