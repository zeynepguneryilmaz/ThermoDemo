
import React, { useState, useMemo } from 'react';
import { calculateWaterState, calculateIdealGasState } from '../utils/thermo';
import { SubstanceType, UnitSystem, ThermoState } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import UnitInput from '../components/UnitInput';
import { formatTemp } from '../utils/conversions';
import { DeviceSchematic } from './VisualComponents';

type StageType = 'expansion' | 'compression' | 'heating' | 'cooling';

interface CycleStage {
  id: string;
  type: StageType;
  name: string;
  subType: 'turbine' | 'nozzle' | 'pump' | 'compressor' | 'boiler' | 'condenser' | 'mixer';
  efficiency: number; 
  targetP: number;
  targetT: number;
  mode: 'design' | 'audit';
}

const Cycles: React.FC<{ units: UnitSystem }> = ({ units }) => {
  const [substance, setSubstance] = useState<SubstanceType>(SubstanceType.WATER);
  const [stages, setStages] = useState<CycleStage[]>([
    { id: '1', type: 'compression', name: 'Feed Pump', subType: 'pump', efficiency: 0.85, targetP: 8000, targetT: 45, mode: 'design' },
    { id: '2', type: 'heating', name: 'Boiler', subType: 'boiler', efficiency: 1, targetP: 8000, targetT: 550, mode: 'design' },
    { id: '3', type: 'expansion', name: 'Turbine', subType: 'turbine', efficiency: 0.88, targetP: 10, targetT: 50, mode: 'design' },
    { id: '4', type: 'cooling', name: 'Condenser', subType: 'condenser', efficiency: 1, targetP: 10, targetT: 45, mode: 'design' }
  ]);
  
  const [initialP, setInitialP] = useState(10);
  const [initialT, setInitialT] = useState(45);
  const isSI = units === UnitSystem.SI;

  const cycleResults = useMemo(() => {
    let currentS = substance === SubstanceType.WATER ? calculateWaterState(initialP, initialT + 273.15) : calculateIdealGasState(initialP, initialT + 273.15);
    const states: (ThermoState & { stageName: string; work: number; heat: number; actEff: number; id: string })[] = [
      { ...currentS, stageName: 'Start', work: 0, heat: 0, actEff: 1, id: 'start' }
    ];

    let totalWork = 0;
    let totalHeatIn = 0;

    stages.forEach((stage) => {
      let nextS: ThermoState;
      let w = 0, q = 0;
      const Cp = substance === SubstanceType.WATER ? 4.18 : 1.005;

      if (stage.type === 'expansion' || stage.type === 'compression') {
        const P_exit = stage.targetP;
        // Approximation for isentropic work
        const w_s = currentS.v * (P_exit - currentS.P); 
        const w_actual = stage.type === 'expansion' ? w_s * stage.efficiency : w_s / stage.efficiency;
        
        const dh = w_actual;
        const T_actual = currentS.T + dh / Cp;
        
        nextS = substance === SubstanceType.WATER ? calculateWaterState(P_exit, T_actual) : calculateIdealGasState(P_exit, T_actual);
        w = -w_actual;
      } else {
        nextS = substance === SubstanceType.WATER ? calculateWaterState(stage.targetP, stage.targetT + 273.15) : calculateIdealGasState(stage.targetP, stage.targetT + 273.15);
        q = nextS.h - currentS.h;
        if (q > 0) totalHeatIn += q;
        w = 0;
      }

      totalWork += w;
      states.push({ ...nextS, stageName: stage.name, work: w, heat: q, actEff: stage.efficiency, id: stage.id });
      currentS = nextS;
    });

    const thermalEfficiency = totalHeatIn > 0 ? totalWork / totalHeatIn : 0;
    const chartData = states.map((s, i) => ({ 
      s: s.s, 
      T: isSI ? s.T - 273.15 : s.T * 1.8 - 459.67, 
      name: s.stageName, 
      idx: i + 1 
    }));
    
    // Close the loop for the chart
    if (chartData.length > 1) {
      chartData.push({ ...chartData[0], name: 'Cycle Closed' });
    }

    return { states, totalWork, totalHeatIn, thermalEfficiency, chartData };
  }, [stages, initialP, initialT, substance, units]);

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-rotate"></i> Engineering Systems
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Power Cycle Architect</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             Design industrial power plants by chaining thermodynamic stages. Chose between <strong>Water (Rankine)</strong> or <strong>Air (Brayton)</strong> fluids and optimize for the highest thermal efficiency.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5 space-y-6">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col h-[750px]">
              <div className="flex justify-between items-center mb-10 italic">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage Sequence Editor</h4>
                <select value={substance} onChange={e => setSubstance(e.target.value as any)} className="text-[10px] font-black bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                  <option value={SubstanceType.WATER}>WATER (RANKINE)</option>
                  <option value={SubstanceType.AIR}>AIR (BRAYTON)</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Starting State (Point 1)</p>
                    <div className="grid grid-cols-2 gap-4">
                       <UnitInput label="Initial P" value={initialP} onChange={setInitialP} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={['kPa']} />
                       <UnitInput label="Initial T" value={initialT} onChange={setInitialT} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={['°C']} />
                    </div>
                 </div>
                 {stages.map((stage, idx) => (
                    <div key={stage.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative group">
                       <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg z-10">{idx + 2}</div>
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{stage.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Constraint</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <UnitInput label="Target P" value={stage.targetP} onChange={v => {
                            const newStages = [...stages];
                            newStages[idx].targetP = v;
                            setStages(newStages);
                          }} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={['kPa']} />
                          {(stage.type === 'expansion' || stage.type === 'compression') ? (
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency η</label>
                                <input type="range" min="0.5" max="1" step="0.01" value={stage.efficiency} onChange={e => {
                                  const newStages = [...stages];
                                  newStages[idx].efficiency = Number(e.target.value);
                                  setStages(newStages);
                                }} className="w-full h-1.5 bg-slate-100 accent-indigo-900" />
                                <div className="text-[10px] font-black text-indigo-600 text-right">{Math.round(stage.efficiency*100)}%</div>
                             </div>
                          ) : (
                             <UnitInput label="Target T" value={stage.targetT} onChange={v => {
                               const newStages = [...stages];
                               newStages[idx].targetT = v;
                               setStages(newStages);
                             }} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={['°C']} />
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="xl:col-span-7 space-y-8">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm h-[500px] relative overflow-hidden">
              <div className="absolute top-10 left-12">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Thermodynamic Mapping</p>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">T-s Diagram</h4>
              </div>
              <div className="flex-1 mt-10 h-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cycleResults.chartData} margin={{ top: 80, right: 40, left: 0, bottom: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="s" type="number" domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis dataKey="T" type="number" domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} />
                       <ChartTooltip />
                       <Line type="monotone" dataKey="T" stroke="#4f46e5" strokeWidth={6} dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#4f46e5' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white">
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                 <h5 className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Efficiency Audit</h5>
                 <p className="text-4xl font-black italic tracking-tighter">η = {(cycleResults.thermalEfficiency * 100).toFixed(1)}%</p>
              </div>
              <div className="flex flex-wrap gap-10 justify-center">
                 {stages.map((s, i) => (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                       <div className="w-16 h-16 relative">
                          <DeviceSchematic type={s.subType} color={s.type === 'expansion' ? '#f97316' : '#3b82f6'} />
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 rounded-full text-[8px] font-black flex items-center justify-center">{i+2}</div>
                       </div>
                       <span className="text-[9px] font-black uppercase text-slate-500">{s.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Cycles;
