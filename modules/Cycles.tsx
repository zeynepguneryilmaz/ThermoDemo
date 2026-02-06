
import React, { useState, useMemo } from 'react';
import { calculateWaterState, calculateIdealGasState } from '../utils/thermo';
import { SubstanceType, UnitSystem, ThermoState } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import UnitInput from '../components/UnitInput';
import { formatTemp, formatPressure, formatEnergy } from '../utils/conversions';
import { DeviceSchematic } from './VisualComponents';

type StageType = 'expansion' | 'compression' | 'heating' | 'cooling';

interface CycleStage {
  id: string;
  type: StageType;
  name: string;
  subType: 'turbine' | 'nozzle' | 'pump' | 'compressor' | 'boiler' | 'condenser' | 'cooler' | 'heater';
  efficiency: number; 
  targetP: number;
  targetT: number;
}

const DEFAULT_STAGES: CycleStage[] = [
  { id: 's1', type: 'compression', name: 'High-Pressure Pump', subType: 'pump', efficiency: 0.85, targetP: 8000, targetT: 45 },
  { id: 's2', type: 'heating', name: 'Boiler / Superheater', subType: 'boiler', efficiency: 1, targetP: 8000, targetT: 550 },
  { id: 's3', type: 'expansion', name: 'Main Turbine', subType: 'turbine', efficiency: 0.88, targetP: 10, targetT: 50 },
  { id: 's4', type: 'cooling', name: 'Condenser Unit', subType: 'condenser', efficiency: 1, targetP: 10, targetT: 45 },
];

const Cycles: React.FC<{ units: UnitSystem }> = ({ units }) => {
  const [substance, setSubstance] = useState<SubstanceType>(SubstanceType.WATER);
  const [stages, setStages] = useState<CycleStage[]>(DEFAULT_STAGES);
  const [initialP, setInitialP] = useState(10);
  const [initialT, setInitialT] = useState(45);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  const isSI = units === UnitSystem.SI;

  const addStage = (type: StageType) => {
    const lastStage = stages[stages.length - 1];
    const newId = `s${Date.now()}`;
    const defaults: Record<StageType, any> = {
      expansion: { name: 'Expander', sub: 'turbine', eff: 0.85 },
      compression: { name: 'Compressor', sub: 'compressor', eff: 0.85 },
      heating: { name: 'Heater', sub: 'heater', eff: 1.0 },
      cooling: { name: 'Cooler', sub: 'cooler', eff: 1.0 }
    };
    
    const meta = defaults[type];
    const newStage: CycleStage = {
      id: newId,
      type,
      name: meta.name,
      subType: meta.sub,
      efficiency: meta.eff,
      targetP: lastStage?.targetP || 100,
      targetT: lastStage?.targetT || 100
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (id: string, updates: Partial<CycleStage>) => {
    setStages(stages.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStage = (id: string) => {
    if (stages.length <= 1) return;
    setStages(stages.filter(s => s.id !== id));
  };

  const cycleResults = useMemo(() => {
    let currentS = substance === SubstanceType.WATER 
      ? calculateWaterState(initialP, initialT + 273.15) 
      : calculateIdealGasState(initialP, initialT + 273.15);

    const points: (ThermoState & { stageName: string; work: number; heat: number; id: string; device: string; eff: number })[] = [
      { ...currentS, stageName: 'Inlet', work: 0, heat: 0, id: 'start', device: 'Inlet Source', eff: 1 }
    ];

    let totalWorkOut = 0;
    let totalHeatIn = 0;
    const Cp = substance === SubstanceType.WATER ? 4.18 : 1.005;

    stages.forEach((stage) => {
      let nextS: ThermoState;
      let w = 0, q = 0;

      if (stage.type === 'expansion' || stage.type === 'compression') {
        const P_exit = stage.targetP;
        // Simplified Isentropic modeling for teaching tool
        const w_s = currentS.v * (P_exit - currentS.P); 
        const w_actual = stage.type === 'expansion' ? w_s * stage.efficiency : w_s / stage.efficiency;
        const dh = w_actual;
        const T_actual = currentS.T + dh / Cp;
        
        nextS = substance === SubstanceType.WATER 
          ? calculateWaterState(P_exit, T_actual) 
          : calculateIdealGasState(P_exit, T_actual);
        w = -w_actual;
      } else {
        nextS = substance === SubstanceType.WATER 
          ? calculateWaterState(stage.targetP, stage.targetT + 273.15) 
          : calculateIdealGasState(stage.targetP, stage.targetT + 273.15);
        q = nextS.h - currentS.h;
        w = 0;
      }

      totalWorkOut += w;
      if (q > 0) totalHeatIn += q;
      points.push({ ...nextS, stageName: stage.name, work: w, heat: q, id: stage.id, device: stage.subType, eff: stage.efficiency });
      currentS = nextS;
    });

    const efficiency = totalHeatIn > 0 ? totalWorkOut / totalHeatIn : 0;
    const chartData = points.map((p, i) => ({
      s: p.s,
      T: isSI ? p.T - 273.15 : p.T * 1.8 - 459.67,
      name: p.stageName,
      idx: i
    }));

    // Detect if cycle is balanced (Closed Loop)
    const isClosed = Math.abs(points[0].P - points[points.length-1].P) < 5 && 
                     Math.abs(points[0].T - points[points.length-1].T) < 5;

    return { points, totalWorkOut, totalHeatIn, efficiency, chartData, isClosed };
  }, [stages, initialP, initialT, substance, units]);

  return (
    <div className="space-y-10 animate-fade-in pb-32">
      {/* 1. ARCHITECT HEADER */}
      <section className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <i className="fas fa-rotate"></i> Thermal System Engineering
           </div>
           <h2 className="text-5xl font-black mb-6 tracking-tight uppercase italic leading-none">Cycle <span className="text-indigo-500">Architect.</span></h2>
           <p className="text-slate-400 text-lg leading-relaxed font-medium">
             Engineer custom thermodynamic cycles by defining discrete transitions. 
             Control every variable from <strong>Isentropic Efficiency</strong> to <strong>Sub-Device Topology</strong>. 
             Audit energy losses across the entire control volume.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* 2. COMPONENT DESIGNER */}
        <div className="xl:col-span-5 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-xl flex flex-col h-[950px]">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Component Sequence</h4>
                    <p className="text-[9px] font-bold text-indigo-600 uppercase mt-1">Design State-to-State Path</p>
                 </div>
                 <select 
                    value={substance} 
                    onChange={e => setSubstance(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                 >
                    <option value={SubstanceType.WATER}>Rankine (Water)</option>
                    <option value={SubstanceType.AIR}>Brayton (Air)</option>
                 </select>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-3 custom-scrollbar pb-10">
                 {/* State 1 Inlet */}
                 <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 shadow-2xl relative">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 rounded-full bg-indigo-500 text-slate-900 flex items-center justify-center text-[10px] font-black border-4 border-slate-900 shadow-xl">1</div>
                       <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Cycle Inlet Feed</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <UnitInput label={`Inlet P (${isSI ? 'kPa' : 'psi'})`} value={initialP} onChange={setInitialP} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={isSI ? ['kPa'] : ['psi']} />
                       <UnitInput label={`Inlet T (${isSI ? '°C' : '°F'})`} value={initialT} onChange={setInitialT} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={isSI ? ['°C'] : ['°F']} />
                    </div>
                 </div>

                 {/* Transition Cards */}
                 {stages.map((stage, idx) => (
                    <div 
                      key={stage.id} 
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onMouseLeave={() => setSelectedIdx(null)}
                      className={`p-8 bg-white rounded-[2.5rem] border-2 transition-all relative group ${selectedIdx === idx ? 'border-indigo-500 shadow-2xl translate-x-1' : 'border-slate-100 shadow-sm'}`}
                    >
                       <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {idx + 1} &rarr; {idx + 2}
                             </div>
                             <div className="flex flex-col">
                                <input 
                                   value={stage.name} 
                                   onChange={e => updateStage(stage.id, { name: e.target.value })}
                                   className="text-xs font-black uppercase tracking-wider text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-indigo-500"
                                />
                                <span className="text-[8px] font-black uppercase text-indigo-400 mt-1">{stage.type} Process</span>
                             </div>
                          </div>
                          <button onClick={() => removeStage(stage.id)} className="text-slate-200 hover:text-rose-500 transition-colors p-2"><i className="fas fa-trash-alt text-[10px]"></i></button>
                       </div>

                       <div className="grid grid-cols-2 gap-6 items-center">
                          <div className="space-y-4">
                             <UnitInput label="Exit Pressure" value={stage.targetP} onChange={v => updateStage(stage.id, { targetP: v })} unit={isSI ? 'kPa' : 'psi'} onUnitChange={()=>{}} options={isSI ? ['kPa'] : ['psi']} />
                             {['expansion', 'compression'].includes(stage.type) ? (
                                <div className="space-y-1 pt-1">
                                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                      <span>Isentropic η</span>
                                      <span className="text-indigo-600 font-bold">{Math.round(stage.efficiency * 100)}%</span>
                                   </div>
                                   <input type="range" min="0.5" max="1" step="0.01" value={stage.efficiency} onChange={e => updateStage(stage.id, { efficiency: Number(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-full accent-indigo-600 cursor-pointer" />
                                </div>
                             ) : (
                                <UnitInput label="Target Exit T" value={stage.targetT} onChange={v => updateStage(stage.id, { targetT: v })} unit={isSI ? '°C' : '°F'} onUnitChange={()=>{}} options={isSI ? ['°C'] : ['°F']} />
                             )}
                          </div>
                          
                          <div className="bg-slate-50/80 rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                             <div className="w-14 h-14 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                <DeviceSchematic type={stage.subType} color="#6366f1" />
                             </div>
                             <select 
                                value={stage.subType} 
                                onChange={e => updateStage(stage.id, { subType: e.target.value as any })}
                                className="text-[9px] font-black uppercase text-indigo-700 bg-transparent outline-none cursor-pointer border-b border-indigo-200 pb-1"
                             >
                                {stage.type === 'expansion' && <><option value="turbine">Turbine</option><option value="nozzle">Nozzle</option></>}
                                {stage.type === 'compression' && <><option value="pump">Pump</option><option value="compressor">Compressor</option></>}
                                {stage.type === 'heating' && <><option value="boiler">Boiler</option><option value="heater">Heater</option></>}
                                {stage.type === 'cooling' && <><option value="condenser">Condenser</option><option value="cooler">Cooler</option></>}
                             </select>
                          </div>
                       </div>
                    </div>
                 ))}

                 {/* Add Component Palette */}
                 <div className="pt-8 mt-4 border-t border-slate-100 flex flex-col gap-6">
                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Add Transition</h6>
                    <div className="grid grid-cols-2 gap-4">
                       <PaletteBtn onClick={() => addStage('heating')} icon="fa-fire" label="Heating (Boiler/Heater)" color="hover:border-rose-400 hover:text-rose-600" />
                       <PaletteBtn onClick={() => addStage('expansion')} icon="fa-fan" label="Expansion (Turbine)" color="hover:border-orange-400 hover:text-orange-600" />
                       <PaletteBtn onClick={() => addStage('cooling')} icon="fa-snowflake" label="Cooling (Condenser)" color="hover:border-cyan-400 hover:text-cyan-600" />
                       <PaletteBtn onClick={() => addStage('compression')} icon="fa-compress" label="Compression (Pump)" color="hover:border-indigo-400 hover:text-indigo-600" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 3. PERFORMANCE & DIAGRAMS */}
        <div className="xl:col-span-7 space-y-12">
           {/* T-S Diagram */}
           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl h-[550px] relative overflow-hidden group">
              <div className="absolute top-10 left-12 z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Thermodynamic Map</p>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Temperature-Entropy</h4>
              </div>
              <div className="w-full h-full pt-20">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cycleResults.chartData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="s" type="number" domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis dataKey="T" type="number" domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} />
                       <ChartTooltip />
                       <Line 
                          type="monotone" 
                          dataKey="T" 
                          stroke="#4f46e5" 
                          strokeWidth={6} 
                          dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#4f46e5' }} 
                          activeDot={{ r: 8 }}
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              {!cycleResults.isClosed && (
                <div className="absolute bottom-12 right-12 px-6 py-3 bg-rose-50 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-3 animate-pulse">
                   <i className="fas fa-triangle-exclamation"></i> Unbalanced Loop
                </div>
              )}
           </div>

           {/* TRANSITION AUDIT TABLE */}
           <section className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-lg overflow-hidden">
              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center">Energy & Performance Audit</h5>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                    <thead>
                       <tr className="border-b border-slate-100">
                          <th className="pb-6 font-black text-slate-400 uppercase tracking-widest">Transition</th>
                          <th className="pb-6 font-black text-slate-400 uppercase tracking-widest">Device</th>
                          <th className="pb-6 font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                          <th className="pb-6 font-black text-slate-400 uppercase tracking-widest text-right">Work (w)</th>
                          <th className="pb-6 font-black text-slate-400 uppercase tracking-widest text-right">Heat (q)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {cycleResults.points.slice(1).map((p, i) => (
                          <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                             <td className="py-6">
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black">{i+1} &rarr; {i+2}</span>
                             </td>
                             <td className="py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6"><DeviceSchematic type={p.device} color="#64748b" /></div>
                                   <span className="font-bold text-slate-900 uppercase tracking-tight">{p.stageName}</span>
                                </div>
                             </td>
                             <td className="py-6 text-center">
                                <span className="font-mono text-indigo-600 font-bold">{Math.round(p.eff * 100)}%</span>
                             </td>
                             <td className={`py-6 text-right font-mono font-bold ${p.work > 0 ? 'text-green-600' : p.work < 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                                {p.work.toFixed(1)} <span className="text-[9px] opacity-40">kJ/kg</span>
                             </td>
                             <td className={`py-6 text-right font-mono font-bold ${p.heat > 0 ? 'text-orange-600' : p.heat < 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                {p.heat.toFixed(1)} <span className="text-[9px] opacity-40">kJ/kg</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Summary Grade */}
              <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-10 justify-between items-center">
                 <div className="flex gap-16">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net System Work</p>
                       <p className="text-3xl font-black italic tracking-tighter text-slate-900">{cycleResults.totalWorkOut.toFixed(1)} <span className="text-sm font-bold text-slate-300">kJ/kg</span></p>
                    </div>
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Heat Supplied</p>
                       <p className="text-3xl font-black italic tracking-tighter text-slate-900">{cycleResults.totalHeatIn.toFixed(1)} <span className="text-sm font-bold text-slate-300">kJ/kg</span></p>
                    </div>
                 </div>
                 <div className="px-12 py-8 bg-indigo-900 rounded-[3rem] text-center shadow-xl relative overflow-hidden group min-w-[280px]">
                    <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-[-20deg]"></div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Thermal Efficiency η</p>
                    <p className="text-6xl font-black italic tracking-tighter text-white relative z-10">{(cycleResults.efficiency * 100).toFixed(1)}%</p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const PaletteBtn = ({ onClick, icon, label, color }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-3 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl transition-all active:scale-95 group shadow-sm ${color}`}>
    <i className={`fas ${icon} text-lg opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all`}></i>
    <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{label}</span>
  </button>
);

export default Cycles;
