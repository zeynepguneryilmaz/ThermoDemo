
import React, { useState, useMemo } from 'react';
import { ScenarioType, SubstanceType, UnitSystem } from '../types';
import { convertInput } from '../utils/conversions';

type Variable = 'P1' | 'T1' | 'P2' | 'T2' | 'm' | 'W' | 'Q';

interface VarMeta {
  id: Variable;
  label: string;
  unitSI: string;
  unitEng: string;
  icon: string;
}

const VAR_LIST: VarMeta[] = [
  { id: 'T1', label: 'Initial Temperature', unitSI: '°C', unitEng: '°F', icon: 'fa-temperature-low' },
  { id: 'T2', label: 'Final Temperature', unitSI: '°C', unitEng: '°F', icon: 'fa-temperature-high' },
  { id: 'm', label: 'System Mass', unitSI: 'kg', unitEng: 'lbm', icon: 'fa-weight-hanging' },
  { id: 'Q', label: 'Heat Added', unitSI: 'kJ', unitEng: 'Btu', icon: 'fa-fire' },
  { id: 'W', label: 'Work Done', unitSI: 'kJ', unitEng: 'Btu', icon: 'fa-gear' },
];

const Solver: React.FC<{ units: UnitSystem }> = ({ units }) => {
  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.PISTON_CYLINDER);
  const [step, setStep] = useState(1);
  const [substance, setSubstance] = useState<SubstanceType>(SubstanceType.AIR);
  const [targetVar, setTargetVar] = useState<Variable>('T2');
  
  const [inputs, setInputs] = useState<Record<Variable, number>>({
    P1: 100, T1: 25, P2: 100, T2: 150, m: 1, W: 0, Q: 50
  });

  const isSI = units === UnitSystem.SI;

  const steps = [
    { id: 1, name: 'System', icon: 'fa-project-diagram' },
    { id: 2, name: 'Fluid', icon: 'fa-flask' },
    { id: 3, name: 'Inputs', icon: 'fa-sliders' },
    { id: 4, name: 'Result', icon: 'fa-check-double' }
  ];

  const handleInputChange = (key: Variable, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    if (step < 4) return null;
    
    // Convert inputs to Base Units (K, kg, kJ)
    const T1_K = convertInput(inputs.T1, 'T', units);
    const T2_K = convertInput(inputs.T2, 'T', units);
    const m_kg = convertInput(inputs.m, 'M', units);
    
    // For energy units, we keep as is but assume kJ if SI, Btu if English
    const Q_val = inputs.Q;
    const W_val = inputs.W;

    // Cv values (Simplified for demonstration)
    const Cv = substance === SubstanceType.AIR ? 0.718 : 4.18; // kJ/kg-K

    let resultVal = 0;
    let equation = "";
    let unitLabel = isSI ? "kJ" : "Btu";

    try {
      switch (targetVar) {
        case 'T2':
          // T2 = T1 + (Q - W) / (m * Cv)
          resultVal = T1_K + (Q_val - W_val) / (m_kg * Cv);
          equation = "T₂ = T₁ + (Q - W) / (m · Cᵥ)";
          unitLabel = isSI ? "°C" : "°F";
          // Convert K back to display unit
          resultVal = isSI ? resultVal - 273.15 : (resultVal * 1.8 - 459.67);
          break;
        case 'T1':
          resultVal = T2_K - (Q_val - W_val) / (m_kg * Cv);
          equation = "T₁ = T₂ - (Q - W) / (m · Cᵥ)";
          unitLabel = isSI ? "°C" : "°F";
          resultVal = isSI ? resultVal - 273.15 : (resultVal * 1.8 - 459.67);
          break;
        case 'm':
          resultVal = (Q_val - W_val) / (Cv * (T2_K - T1_K));
          equation = "m = (Q - W) / (Cᵥ · ΔT)";
          unitLabel = isSI ? "kg" : "lbm";
          break;
        case 'Q':
          resultVal = W_val + m_kg * Cv * (T2_K - T1_K);
          equation = "Q = W + m · Cᵥ · (T₂ - T₁)";
          break;
        case 'W':
          resultVal = Q_val - m_kg * Cv * (T2_K - T1_K);
          equation = "W = Q - m · Cᵥ · (T₂ - T₁)";
          break;
        default:
          resultVal = 0;
          equation = "Algebraic logic pending for this variable.";
      }
    } catch (e) { resultVal = NaN; }
    
    return { value: resultVal, equation, unit: unitLabel };
  }, [step, substance, inputs, targetVar, units]);

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* 1. EDUCATIONAL HEADER: Clear explanation for the user */}
      <section className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 text-teal-300 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-graduation-cap"></i> Student Guide
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">Process Solver</h2>
           <p className="text-slate-300 text-lg leading-relaxed font-medium">
             This tool uses the <strong>First Law of Thermodynamics</strong> for closed systems: $Q - W = \Delta U$. 
             By assuming an ideal gas with constant specific heats ($C_v$), we can solve for any single missing variable if the others are known. 
             <span className="block mt-4 text-sm opacity-60">Follow the steps below to define your system and material before entering your parameters.</span>
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <section className="card-elevated p-12 min-h-[650px] flex flex-col">
            <div className="flex justify-between items-center mb-12">
               <div className="flex gap-2">
                  {steps.map((s) => (
                    <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === s.id ? 'bg-indigo-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                       <i className={`fas ${s.icon} text-[10px]`}></i>
                       <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Step 1: Scenario */}
            {step === 1 && (
               <div className="space-y-8 animate-fade-in">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 1: Choose System Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.values(ScenarioType).map(type => (
                      <button key={type} onClick={() => { setScenario(type); setStep(2); }} className="p-8 rounded-[2rem] border-2 text-left transition-all group bg-slate-50 border-slate-100 hover:border-teal-500 hover:bg-white shadow-sm active:scale-95">
                        <i className={`fas ${type.includes('Closed') ? 'fa-box-archive' : 'fa-shuffle'} text-xl mb-4 text-slate-300 group-hover:text-teal-600`}></i>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">{type}</h4>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Calculation based on control mass (Closed System).</p>
                      </button>
                    ))}
                  </div>
               </div>
            )}

            {/* Step 2: Substance */}
            {step === 2 && (
               <div className="space-y-8 animate-fade-in">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 2: Define Working Fluid</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {[SubstanceType.AIR, SubstanceType.WATER].map(sub => (
                      <button key={sub} onClick={() => { setSubstance(sub); setStep(3); }} className={`p-10 rounded-[2.5rem] border-2 text-left transition-all active:scale-95 ${substance === sub ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-slate-50 border-slate-50 hover:border-teal-400'}`}>
                        <i className={`fas ${sub === SubstanceType.AIR ? 'fa-wind' : 'fa-droplet'} text-2xl mb-4 opacity-40`}></i>
                        <h4 className="text-2xl font-black italic">{sub}</h4>
                      </button>
                    ))}
                  </div>
               </div>
            )}

            {/* Step 3: Variables */}
            {step === 3 && (
              <div className="space-y-12 animate-fade-in">
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">3a. Target: What do you want to find?</h3>
                   <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {VAR_LIST.map((v) => (
                        <button key={v.id} onClick={() => setTargetVar(v.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${targetVar === v.id ? 'bg-indigo-900 border-indigo-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-teal-200'}`}>
                          <i className={`fas ${v.icon} text-xs`}></i>
                          <span className="text-[9px] font-black uppercase">{v.id}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                   <div className="col-span-full">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3b. Parameters: Enter known values</h3>
                   </div>
                   {VAR_LIST.map((v) => (
                      <div key={v.id} className={`space-y-2 transition-opacity ${targetVar === v.id ? 'opacity-40' : 'opacity-100'}`}>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{v.label}</label>
                         <div className={`flex rounded-xl border overflow-hidden transition-all ${targetVar === v.id ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200 focus-within:border-teal-500 shadow-sm'}`}>
                            <input 
                              type="number" 
                              disabled={targetVar === v.id} 
                              value={targetVar === v.id ? '' : inputs[v.id]} 
                              placeholder={targetVar === v.id ? 'CALCULATING...' : 'Value'} 
                              onChange={e => handleInputChange(v.id, parseFloat(e.target.value) || 0)} 
                              className="flex-1 px-4 py-3 outline-none text-sm font-bold bg-transparent placeholder:text-indigo-300 placeholder:text-[9px]" 
                            />
                            <div className="px-3 py-3 bg-slate-50 border-l border-slate-100 text-[9px] font-black text-slate-400 uppercase">{isSI ? v.unitSI : v.unitEng}</div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-end pt-8">
                   <button onClick={() => setStep(4)} className="btn-primary px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Run Algebraic Solver</button>
                </div>
              </div>
            )}

            {/* Step 4: Result */}
            {step === 4 && results && (
              <div className="space-y-10 animate-fade-in text-center flex-1 flex flex-col justify-center py-10">
                 <div className="bg-indigo-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-[-20deg] translate-x-32"></div>
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-4">Final Derived State</p>
                    <div className="flex flex-col items-center">
                       <h4 className="text-8xl font-black tracking-tighter italic mb-4">
                          {isNaN(results.value) ? 'Error' : results.value.toFixed(2)}
                       </h4>
                       <span className="text-xl font-bold text-slate-400 uppercase">{results.unit}</span>
                    </div>
                    
                    <div className="mt-12 p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">Mathematical Proof</p>
                       <p className="text-2xl font-mono font-bold text-teal-300 italic tracking-tight">{results.equation}</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center">
               <button onClick={() => setStep(Math.max(1, step-1))} disabled={step===1} className="btn-secondary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 active:scale-95">
                 <i className="fas fa-chevron-left mr-2"></i> Previous
               </button>
               {step === 4 && (
                 <button onClick={() => setStep(1)} className="btn-primary px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Start New Problem</button>
               )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4">
           <section className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white sticky top-32">
             <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-10 border-b border-white/10 pb-4">Computation Context</h4>
             <div className="space-y-4">
                <MetaRow label="Target" value={targetVar} />
                <MetaRow label="System" value={scenario} />
                <MetaRow label="Fluid" value={substance} />
                <MetaRow label="Units" value={isSI ? 'Metric (SI)' : 'Imperial'} />
                
                <div className="pt-10 mt-10 border-t border-white/10 flex flex-col items-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-teal-500 text-slate-900 flex items-center justify-center text-xl mb-4 shadow-xl">
                      <i className={`fas ${VAR_LIST.find(v=>v.id===targetVar)?.icon}`}></i>
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Variable Info</p>
                   <p className="text-xs font-bold text-slate-300 mt-2 leading-relaxed">
                     Solving for <strong>{VAR_LIST.find(v=>v.id===targetVar)?.label}</strong> based on the energy balance of {scenario.toLowerCase()}.
                   </p>
                </div>
             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-bold text-slate-200">{value}</span>
  </div>
);

export default Solver;
