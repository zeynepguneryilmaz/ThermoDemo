
import React, { useState, useMemo } from 'react';
import { calculateWaterState } from '../utils/thermo';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

const PropertyExplorer: React.FC = () => {
  const [P, setP] = useState(101.325);
  const [x, setX] = useState(0.5);
  
  const state = useMemo(() => {
    return calculateWaterState(P, undefined, x);
  }, [P, x]);

  const domeData = [
    { v: 0.001, T: 0.01 }, { v: 0.001002, T: 20 }, { v: 0.001012, T: 50 }, 
    { v: 0.001043, T: 100 }, { v: 0.001157, T: 200 }, { v: 0.001404, T: 300 },
    { v: 0.003106, T: 374 }, { v: 0.0216, T: 300 }, { v: 0.1272, T: 200 },
    { v: 1.673, T: 100 }, { v: 12.03, T: 50 }, { v: 206.1, T: 0.01 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4">Live State Explorer</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pressure: <span className="text-indigo-600 font-mono">{P} kPa</span>
                </label>
                <input 
                  type="range" min="1" max="22000" step="1" 
                  value={P} onChange={e => setP(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-full accent-indigo-600"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter"><span>1 kPa</span><span>Critical (22MPa)</span></div>
              </div>

              <div className="space-y-3">
                <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Vapor Quality: <span className="text-emerald-500 font-mono">{(x * 100).toFixed(0)}%</span>
                </label>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={x} onChange={e => setX(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-full accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter"><span>Sat. Liquid</span><span>Sat. Vapor</span></div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[2rem] shadow-xl text-white space-y-6">
             <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <ResultItem label="Temp (T)" value={state.T.toFixed(1)} unit="K" />
                <ResultItem label="Volume (v)" value={state.v.toFixed(4)} unit="m³/kg" />
                <ResultItem label="Enthalpy (h)" value={state.h.toFixed(1)} unit="kJ/kg" />
                <ResultItem label="Entropy (s)" value={state.s.toFixed(3)} unit="kJ/kg-K" />
             </div>
          </section>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <i className="fas fa-flask text-8xl absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:rotate-12"></i>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">Gibbs Phase Rule</h4>
            <p className="text-xs font-bold leading-relaxed italic">
              "F = C - P + 2. In a two-phase pure mixture (C=1, P=2), there is only one degree of freedom. Pressure determines the Boiling Point."
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[420px] flex flex-col">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-10 tracking-[0.2em]">Temperature-Volume (T-v)</h4>
               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" dataKey="v" scale="log" domain={[0.0001, 300]} fontSize={10} axisLine={false} tickLine={false} label={{ value: 'v (m³/kg)', position: 'bottom', offset: -5, fontSize: 10, fontWeight: 'bold' }} />
                     <YAxis type="number" dataKey="T" domain={[0, 450]} fontSize={10} axisLine={false} tickLine={false} label={{ value: 'T (°C)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold' }} />
                     <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter name="Saturation Dome" data={domeData} fill="#cbd5e1" line stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 3" />
                     <Scatter name="Current State" data={[{ v: state.v, T: state.T - 273.15 }]} fill="#4f46e5" shape="circle" />
                   </ScatterChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[420px] flex flex-col">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-10 tracking-[0.2em]">Pressure-Volume (P-v)</h4>
               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" dataKey="v" scale="log" domain={[0.0001, 300]} fontSize={10} axisLine={false} tickLine={false} />
                     <YAxis type="number" dataKey="P" scale="log" domain={[0.1, 30000]} fontSize={10} axisLine={false} tickLine={false} />
                     <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter name="Saturation Dome" data={domeData.map(d => {
                        const sat = calculateWaterState(undefined, d.T + 273.15, 0);
                        return { v: d.v, P: sat.P };
                     })} fill="#cbd5e1" line stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 3" />
                     <Scatter name="Current State" data={[{ v: state.v, P: state.P }]} fill="#10b981" shape="circle" />
                   </ScatterChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultItem = ({ label, value, unit }: any) => (
  <div>
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-mono font-black text-slate-200 tracking-tighter">{value}</span>
      <span className="text-[10px] text-slate-500 font-bold">{unit}</span>
    </div>
  </div>
);

export default PropertyExplorer;
