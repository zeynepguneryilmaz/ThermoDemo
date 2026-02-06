
import React, { useState, useMemo } from 'react';
import { ANTOINE_DB } from '../constants';
import { getAntoinePsat, mmHgToKPa } from '../utils/thermo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { UnifiedParticleSim } from './VisualComponents';
import Tooltip from '../components/Tooltip';

const PhaseEquilibrium: React.FC = () => {
  const [compA, setCompA] = useState('Ethanol');
  const [compB, setCompB] = useState('Water');
  const [targetT, setTargetT] = useState(78);

  const vleData = useMemo(() => {
    const points = [];
    const dataA = ANTOINE_DB[compA];
    const dataB = ANTOINE_DB[compB];
    const PA_sat = mmHgToKPa(getAntoinePsat(dataA.antoine.A, dataA.antoine.B, dataA.antoine.C, targetT));
    const PB_sat = mmHgToKPa(getAntoinePsat(dataB.antoine.A, dataB.antoine.B, dataB.antoine.C, targetT));

    for (let xA = 0; xA <= 1.001; xA += 0.05) {
      const x = Math.min(xA, 1);
      const P_total = x * PA_sat + (1 - x) * PB_sat;
      const y = P_total > 0 ? (x * PA_sat) / P_total : 0;
      points.push({ xA: x, yA: y, P: P_total });
    }
    return points;
  }, [compA, compB, targetT]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* EDUCATIONAL HEADER */}
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-droplet"></i> Phase Transitions
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Binary Phase Equilibrium</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Understand how mixtures boil and condense. In a binary mixture, the <strong>Bubble Point</strong> (liquid side) and <strong>Dew Point</strong> (vapor side) determine the compositions of coexisting phases based on <strong>Raoult's Law</strong>.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inlet Config</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Species A</label>
                <select value={compA} onChange={e => setCompA(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 outline-none">
                  {Object.keys(ANTOINE_DB).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Species B</label>
                <select value={compB} onChange={e => setCompB(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 outline-none">
                  {Object.keys(ANTOINE_DB).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Constant Temp (°C)</label>
                <input type="number" value={targetT} onChange={e => setTargetT(Number(e.target.value))} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-white" />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[3rem] shadow-xl">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Interface Analysis</h4>
             <UnifiedParticleSim temperature={targetT + 273.15} density={0.8} compositionA={0.5} substanceA={compA} substanceB={compB} height={300} phase="Equilibrium" />
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm h-[600px] flex flex-col">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-10">Pressure-Composition (P-x-y) Diagram</h4>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vleData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="xA" type="number" domain={[0, 1]} fontSize={10} axisLine={false} tickLine={false}>
                      <Label value="Mole Fraction xA, yA" offset={-5} position="bottom" fontSize={10} fontWeight="black" />
                    </XAxis>
                    <YAxis fontSize={10} axisLine={false} tickLine={false}>
                      <Label value="Total Pressure (kPa)" angle={-90} position="insideLeft" fontSize={10} fontWeight="black" />
                    </YAxis>
                    <ChartTooltip />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Line type="monotone" dataKey="P" name="Liquid (Bubble Point)" stroke="#4f46e5" dot={false} strokeWidth={5} />
                    <Line type="monotone" dataKey="P" data={vleData.map(d => ({ ...d, xA: d.yA }))} name="Vapor (Dew Point)" stroke="#f59e0b" dot={false} strokeWidth={4} strokeDasharray="10 10" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseEquilibrium;
