
import React, { useState, useMemo } from 'react';
import { calculateIdealGasState, calculateWaterState } from '../utils/thermo';
import { SubstanceType, UnitSystem } from '../types';
import { UnifiedParticleSim, DeviceSchematic } from './VisualComponents';
import { convertInput, formatEnergy, formatPressure, formatTemp } from '../utils/conversions';
import UnitInput from '../components/UnitInput';

type DeviceType = 'turbine' | 'compressor' | 'pump' | 'nozzle' | 'valve' | 'heat_exchanger';

const SteadyFlow: React.FC<{ units: UnitSystem }> = ({ units }) => {
  const [device, setDevice] = useState<DeviceType>('turbine');
  const [substance, setSubstance] = useState<SubstanceType>(SubstanceType.WATER);
  const [dispP1, setDispP1] = useState(2000);
  const [dispT1, setDispT1] = useState(400);
  const [dispP2, setDispP2] = useState(100);
  const [eff, setEff] = useState(0.85);
  
  const [keEnabled, setKeEnabled] = useState(false);
  const [peEnabled, setPeEnabled] = useState(false);
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(100);
  const [z1, setZ1] = useState(0);
  const [z2, setZ2] = useState(0);
  
  const isSI = units === UnitSystem.SI;

  const results = useMemo(() => {
    const P1 = convertInput(dispP1, 'P', units);
    const T1 = convertInput(dispT1, 'T', units);
    const P2 = convertInput(dispP2, 'P', units);

    const s1 = substance === SubstanceType.WATER ? calculateWaterState(P1, T1) : calculateIdealGasState(P1, T1);
    const cp = substance === SubstanceType.WATER ? 1.95 : 1.005;

    const deltaKe = keEnabled ? (v2 * v2 - v1 * v1) / 2000 : 0;
    const deltaPe = peEnabled ? (9.81 * (z2 - z1)) / 1000 : 0;

    let w = 0, q = 0, T2 = T1, equation = "";

    switch(device) {
      case 'turbine':
        const w_isentropic = cp * T1 * (1 - Math.pow(P2 / P1, 0.285)); 
        w = eff * w_isentropic;
        T2 = T1 - w / cp;
        equation = "w = η·(h₁ - h₂s)";
        break;
      case 'compressor':
      case 'pump':
        const w_c_isentropic = cp * T1 * (Math.pow(P2 / P1, 0.285) - 1);
        w = -(w_c_isentropic / eff);
        T2 = T1 - w / cp;
        equation = "w = (h₁ - h₂s)/η";
        break;
      case 'nozzle':
        const h2_nozzle = s1.h - deltaKe - deltaPe;
        T2 = T1 + (h2_nozzle - s1.h) / cp;
        equation = "V₂ = √[2·(h₁-h₂)]";
        break;
      case 'valve':
        T2 = T1; 
        equation = "h₁ = h₂ (Isenthalpic)";
        break;
      case 'heat_exchanger':
        T2 = T1 + 25; 
        q = cp * (T2 - T1) + deltaKe + deltaPe;
        equation = "q = Δh + Δke + Δpe";
        break;
    }

    const s2 = substance === SubstanceType.WATER ? calculateWaterState(P2, T2) : calculateIdealGasState(P2, T2);
    return { s1, s2, w, q, equation };
  }, [device, substance, dispP1, dispT1, dispP2, eff, keEnabled, peEnabled, v1, v2, z1, z2, units]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-wind"></i> Control Volumes
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Steady-Flow Systems</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Unlike closed systems, <strong>Steady-Flow Devices</strong> have fluid entering and leaving at a constant rate. 
             The <strong>First Law for Open Systems</strong> accounts for Enthalpy and Kinetic/Potential shifts.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Device Selection</h3>
             <div className="grid grid-cols-3 gap-3 mb-10">
                <DeviceBtn active={device === 'turbine'} onClick={() => setDevice('turbine')} icon="fa-fan" label="Turbine" />
                <DeviceBtn active={device === 'compressor'} onClick={() => setDevice('compressor')} icon="fa-compress-arrows-alt" label="Compressor" />
                <DeviceBtn active={device === 'pump'} onClick={() => setDevice('pump')} icon="fa-faucet" label="Pump" />
                <DeviceBtn active={device === 'nozzle'} onClick={() => setDevice('nozzle')} icon="fa-caret-right" label="Nozzle" />
                <DeviceBtn active={device === 'valve'} onClick={() => setDevice('valve')} icon="fa-vial-circle-check" label="Throttling" />
                <DeviceBtn active={device === 'heat_exchanger'} onClick={() => setDevice('heat_exchanger')} icon="fa-fire-burner" label="Exchanger" />
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Working Species</label>
                  <select value={substance} onChange={e => setSubstance(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none cursor-pointer">
                     <option value={SubstanceType.WATER}>Water / Steam</option>
                     <option value={SubstanceType.AIR}>Dry Air</option>
                  </select>
                </div>
                
                <UnitInput label="Inlet P" value={dispP1} onChange={setDispP1} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={isSI ? ['kPa'] : ['psi']} />
                <UnitInput label="Inlet T" value={dispT1} onChange={setDispT1} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={isSI ? ['°C'] : ['°F']} />
                <UnitInput label="Exit P" value={dispP2} onChange={setDispP2} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={isSI ? ['kPa'] : ['psi']} />

                {['turbine', 'compressor', 'pump'].includes(device) && (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Isentropic Efficiency (η)</label>
                    <input type="range" min="0.5" max="1" step="0.01" value={eff} onChange={e => setEff(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full accent-indigo-600 cursor-pointer" />
                    <div className="text-right text-[10px] font-black text-indigo-600">{(eff * 100).toFixed(0)}%</div>
                  </div>
                )}
             </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-10 border-b border-white/5 pb-4">Audit Results</h4>
            <div className="space-y-6">
               <ResultRow label="Exit Temp (T2)" value={formatTemp(results.s2.T, units)} />
               <ResultRow 
                 label={results.w >= 0 ? "Work Produced (w)" : "Work Consumed (w)"} 
                 value={`${Math.abs(results.w).toFixed(1)} kJ/kg`} 
                 color={results.w >= 0 ? "text-indigo-400" : "text-rose-400"} 
               />
               <div className="pt-6 border-t border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Governing Balance</p>
                  <p className="text-xl font-mono font-black italic tracking-tighter text-indigo-300 uppercase">{results.equation}</p>
               </div>
            </div>
          </section>
        </div>

        <div className="xl:col-span-8">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
              <div className="w-full flex justify-around items-center mb-16 relative z-10">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Inlet State</p>
                    <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-900 shadow-lg">
                       <UnifiedParticleSim temperature={results.s1.T} density={0.3} height={176} substanceA={substance} />
                    </div>
                 </div>
                 <div className="w-56 h-48">
                    <DeviceSchematic type={device} color="#4f46e5" />
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Outlet State</p>
                    <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-900 shadow-lg">
                       <UnifiedParticleSim temperature={results.s2.T} density={0.15} height={176} substanceA={substance} />
                    </div>
                 </div>
              </div>

              <div className="w-full max-w-2xl bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Device Specifications</h5>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <PropBadge label="h₁ (In)" value={formatEnergy(results.s1.h, units)} />
                       <PropBadge label="P₁ (In)" value={formatPressure(results.s1.P, units)} />
                    </div>
                    <div className="space-y-4">
                       <PropBadge label="h₂ (Out)" value={formatEnergy(results.s2.h, units)} highlight />
                       <PropBadge label="P₂ (Out)" value={formatPressure(results.s2.P, units)} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DeviceBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${active ? 'bg-indigo-600 text-white border-transparent shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-teal-200 hover:text-slate-600'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none">{label}</span>
  </button>
);

const PropBadge = ({ label, value, highlight }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
     <span className="text-[9px] font-black text-slate-400 uppercase">{label}</span>
     <span className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</span>
  </div>
);

const ResultRow = ({ label, value, color }: any) => (
  <div className="flex justify-between items-baseline border-b border-white/5 pb-4 last:border-0">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-2xl font-mono font-black ${color || 'text-white'}`}>{value}</span>
  </div>
);

export default SteadyFlow;
