
import React, { useState, useMemo, useEffect } from 'react';
import { ANTOINE_DB, INTERACTION_DB } from '../constants';
import { getAntoinePsat, mmHgToKPa } from '../utils/thermo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Label, ReferenceLine, AreaChart, Area } from 'recharts';
import { UnifiedParticleSim } from './VisualComponents';
import Tooltip from '../components/Tooltip';

const Solutions: React.FC = () => {
  const [compA, setCompA] = useState('Ethanol');
  const [compB, setCompB] = useState('Water');
  const [vleT, setVleT] = useState(70);
  const [xA, setXA] = useState(0.5);
  const [modelType, setModelType] = useState<'ideal' | 'regular'>('regular');
  const [margulesA, setMargulesA] = useState(1.2);
  const [showTheory, setShowTheory] = useState(false);

  useEffect(() => {
    if (compA !== compB) {
      const defaultA = INTERACTION_DB[compA]?.[compB] ?? 0.5;
      setMargulesA(defaultA);
    } else {
      setMargulesA(0);
    }
  }, [compA, compB]);

  const data = useMemo(() => {
    const pointsVLE = [];
    const pointsMixing = [];
    const R = 8.314; // J/mol-K
    const T = vleT + 273.15;
    
    const dataA = ANTOINE_DB[compA];
    const dataB = ANTOINE_DB[compB];
    const PsatA = mmHgToKPa(getAntoinePsat(dataA.antoine.A, dataA.antoine.B, dataA.antoine.C, vleT));
    const PsatB = mmHgToKPa(getAntoinePsat(dataB.antoine.A, dataB.antoine.B, dataB.antoine.C, vleT));

    for (let x = 0; x <= 1.001; x += 0.05) {
      const x_curr = Math.max(0.0001, Math.min(0.9999, x));
      const x_other = 1 - x_curr;

      const activityA = modelType === 'ideal' ? 1 : Math.exp(margulesA * x_other * x_other);
      const activityB = modelType === 'ideal' ? 1 : Math.exp(margulesA * x_curr * x_curr);

      const PA = x_curr * activityA * PsatA;
      const PB = x_other * activityB * PsatB;
      const P_total = PA + PB;
      const yA = P_total > 0 ? PA / P_total : 0;

      const dS_mix = -R * (x_curr * Math.log(x_curr) + x_other * Math.log(x_other));
      const dH_mix = modelType === 'ideal' ? 0 : margulesA * R * T * x_curr * x_other;
      const dG_mix = dH_mix - T * dS_mix;

      pointsVLE.push({ xA: x_curr, yA: yA, P: P_total });
      pointsMixing.push({ xA: x_curr, dG: dG_mix / 1000, dH: dH_mix / 1000, TdS: (T * dS_mix) / 1000 });
    }
    return { pointsVLE, pointsMixing };
  }, [compA, compB, vleT, margulesA, modelType]);

  const currentMix = useMemo(() => {
    const idx = Math.min(19, Math.floor(xA * 20));
    return data.pointsMixing[idx] || data.pointsMixing[10];
  }, [data, xA]);

  const isUnstable = modelType === 'regular' && margulesA > 2.0; 

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <section className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                   <i className="fas fa-vials"></i>
                </div>
                <div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Molecular Solution Theory</h3>
                   <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Mixing Energetics</h2>
                </div>
             </div>
             <button onClick={() => setShowTheory(!showTheory)} className="px-6 py-2.5 rounded-full bg-emerald-50 text-[10px] font-black uppercase text-emerald-600 tracking-widest hover:bg-emerald-100 transition-all">
               {showTheory ? 'Hide Context' : 'Show Context'}
             </button>
          </div>

          {showTheory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-sm text-slate-600 leading-relaxed animate-fade-in">
              <div className="space-y-6">
                <p>Real solutions deviate from ideality due to differences in molecular size and forces. We use the <strong>Margules Model</strong> to estimate activity (γ). If repulsion is high (A &gt; 2), the solution splits.</p>
                <div className="flex gap-4">
                   <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">A-Coeff Tracking</span>
                   <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest">Miscibility Audit</span>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 font-mono text-[11px] space-y-4">
                 <p className="text-slate-800 font-bold">ΔG_mix = ΔH_mix - T·ΔS_mix</p>
                 <p className="text-slate-500 opacity-80 leading-loose">ΔH_mix = A·R·T·x₁·x₂<br/>ΔS_mix = -R·Σ xᵢ·ln(xᵢ)</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Species Selection</label>
              <div className="grid grid-cols-2 gap-3">
                <select value={compA} onChange={e => setCompA(e.target.value)} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[11px] font-black uppercase outline-none">
                  {Object.keys(ANTOINE_DB).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={compB} onChange={e => setCompB(e.target.value)} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[11px] font-black uppercase outline-none">
                  {Object.keys(ANTOINE_DB).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Solubility Choice</label>
               <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button onClick={() => setModelType('ideal')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modelType === 'ideal' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>Ideal</button>
                  <button onClick={() => setModelType('regular')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modelType === 'regular' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>Regular</button>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Parameter (A)</span>
                     <span className="text-emerald-600 font-bold">{margulesA.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1" max="4" step="0.1" value={margulesA} onChange={e => setMargulesA(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full accent-emerald-500" disabled={modelType === 'ideal'} />
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Composition (xA)</span>
                     <span className="text-indigo-600 font-bold">{(xA * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={xA} onChange={e => setXA(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full accent-indigo-500" />
               </div>
            </div>
          </section>

          <section className={`p-10 rounded-[3rem] shadow-2xl transition-all duration-700 ${isUnstable ? 'bg-rose-900' : 'bg-slate-900'} text-white`}>
             <div className="flex justify-between items-start mb-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Stability Audit</h4>
                <div className={`w-3 h-3 rounded-full ${isUnstable ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`}></div>
             </div>
             <div className="space-y-6">
                <StatusRow label="State" value={isUnstable ? 'Immiscible' : 'Miscible'} />
                <StatusRow label="Mixing ΔH" value={`${currentMix.dH.toFixed(3)} kJ/mol`} />
                <StatusRow label="Mixing ΔG" value={`${currentMix.dG.toFixed(3)} kJ/mol`} />
             </div>
          </section>
        </div>

        <div className="xl:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-8">P-x-y (VLE)</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.pointsVLE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="xA" type="number" domain={[0, 1]} fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="P" name="Liquid" stroke="#6366f1" strokeWidth={5} dot={false} />
                      <Line type="monotone" dataKey="P" data={data.pointsVLE.map(p => ({ ...p, xA: p.yA }))} name="Vapor" stroke="#f59e0b" strokeWidth={3} strokeDasharray="8 4" dot={false} />
                      <ReferenceLine x={xA} stroke="#e2e8f0" strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-8">Mixing Potentials (ΔG)</h4>
                <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.pointsMixing}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="xA" type="number" domain={[0, 1]} fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <ChartTooltip />
                        <Area type="monotone" dataKey="dG" name="Free Energy" stroke="#6366f1" fill="#6366f110" strokeWidth={4} />
                        <ReferenceLine y={0} stroke="#cbd5e1" />
                        <ReferenceLine x={xA} stroke="#e2e8f0" strokeDasharray="4 4" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          <section className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Micro-Dynamics Interaction</h4>
                <div className="flex gap-4">
                   <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{compA}</span>
                   <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{compB}</span>
                </div>
             </div>
             <div className="h-96 rounded-[3rem] overflow-hidden border border-slate-100 shadow-inner">
                <UnifiedParticleSim 
                  temperature={vleT + 273.15} 
                  density={0.75} 
                  compositionA={xA} 
                  substanceA={compA} 
                  substanceB={compB} 
                  phase={isUnstable ? 'Two Phase Split' : 'Single Phase Mixture'}
                  height={384}
                />
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, value }: any) => (
  <div className="flex justify-between items-baseline border-b border-white/5 pb-4 last:border-0 group">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-xl font-mono font-black tracking-tighter text-white">{value}</span>
  </div>
);

export default Solutions;
