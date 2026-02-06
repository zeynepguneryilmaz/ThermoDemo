
import React, { useState, useMemo } from 'react';
import { WorkConvention } from '../types';
import Tooltip from '../components/Tooltip';

const SecondLaw: React.FC<{ convention: WorkConvention }> = ({ convention }) => {
  const [TH, setTH] = useState(800);
  const [TL, setTL] = useState(300);
  const [T0, setT0] = useState(298.15); 
  const [QH, setQH] = useState(100);
  const [W, setW] = useState(40);

  const results = useMemo(() => {
    const QL = QH - W;
    const eta_th = QH > 0 ? W / QH : 0;
    const eta_carnot = TH > 0 ? 1 - (TL / TH) : 0;
    const Sgen = QH > 0 ? (QL / TL) - (QH / TH) : 0;
    const ExDest = T0 * Sgen;
    const isImpossible = Sgen < -1e-7 || eta_th > eta_carnot + 1e-6;

    return { QL, eta_th, eta_carnot, Sgen, ExDest, isImpossible };
  }, [TH, TL, T0, QH, W]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* EDUCATIONAL HEADER */}
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-hourglass"></i> Direction of Time
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">The Second Law</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Energy has both <strong>Quantity</strong> and <strong>Quality</strong>. While the 1st Law tracks energy amounts, the 2nd Law states that <strong>Entropy (S)</strong> always increases in real processes, setting absolute limits on heat engine efficiency.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Reservoir Config</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">T_High (K)</label>
                  <input type="number" value={TH} onChange={e => setTH(Number(e.target.value))} className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold bg-slate-50 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">T_Low (K)</label>
                  <input type="number" value={TL} onChange={e => setTL(Number(e.target.value))} className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold bg-slate-50 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heat Input Q_H (kJ)</label>
                  <input type="number" value={QH} onChange={e => setQH(Number(e.target.value))} className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Out W (kJ)</label>
                  <input type="number" value={W} onChange={e => setW(Number(e.target.value))} className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold bg-white" />
                </div>
              </div>
            </div>
          </section>

          <section className={`p-10 rounded-[3rem] shadow-2xl transition-all ${results.isImpossible ? 'bg-rose-900 border-rose-500 border-4 text-white' : 'bg-slate-900 text-white'}`}>
             <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-10">Integrity Audit</h4>
             <div className="space-y-6">
               <ResultRow label="Efficiency η" value={`${(results.eta_th * 100).toFixed(1)}%`} />
               <ResultRow label="Carnot Limit" value={`${(results.eta_carnot * 100).toFixed(1)}%`} color="text-indigo-400" />
               <ResultRow label="Exergy Lost" value={`${results.ExDest.toFixed(2)} kJ`} color="text-rose-400" />
               <div className="pt-6 border-t border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase">Process Status</p>
                 <p className="text-2xl font-black italic mt-1 uppercase">
                   {results.isImpossible ? 'Impossible' : 'Reversible/Possible'}
                 </p>
               </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
           <div className="flex flex-col items-center gap-10">
              <div className="w-56 py-3 bg-rose-600 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl">Heat Source ({TH}K)</div>
              <div className="relative w-48 h-48 border-[12px] border-slate-900 rounded-[3rem] flex items-center justify-center bg-white shadow-2xl group">
                 <div className={`w-14 h-14 bg-indigo-900 text-white rounded-full flex items-center justify-center transition-all ${!results.isImpossible ? 'animate-spin-slow' : 'opacity-10'}`}>
                    <i className="fas fa-arrows-rotate text-lg"></i>
                 </div>
                 <div className="absolute -right-24 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[9px] font-black text-indigo-700 uppercase tracking-widest">Shaft Work</div>
              </div>
              <div className="w-56 py-3 bg-blue-600 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl">Heat Sink ({TL}K)</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, color }: any) => (
  <div className="flex justify-between items-baseline border-b border-white/5 pb-4 last:border-0 group">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className={`text-xl font-mono font-black ${color || 'text-white'}`}>{value}</span>
  </div>
);

export default SecondLaw;
