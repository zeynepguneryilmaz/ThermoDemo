
import React, { useState, useMemo } from 'react';

interface Concept {
  id: string;
  title: string;
  icon: string;
  category: 'fundamentals' | 'laws' | 'properties' | 'heat' | 'second' | 'relations' | 'flow' | 'solutions' | 'phase';
  formula: string;
  content: string;
  tags: string[];
}

const Library: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Knowledge Base', icon: 'fa-layer-group' },
    { id: 'fundamentals', name: 'Fundamentals', icon: 'fa-ruler' },
    { id: 'laws', name: 'Energy Laws', icon: 'fa-bolt' },
    { id: 'properties', name: 'EOS & P-V-T', icon: 'fa-atom' },
    { id: 'heat', name: 'Heat Effects', icon: 'fa-fire' },
    { id: 'second', name: '2nd Law', icon: 'fa-hourglass' },
    { id: 'relations', name: 'Relations', icon: 'fa-square-root-variable' },
    { id: 'flow', name: 'Power & Flow', icon: 'fa-rotate' },
    { id: 'solutions', name: 'Solutions', icon: 'fa-vials' },
    { id: 'phase', name: 'Phase Equilibrium', icon: 'fa-droplet' },
  ];

  const concepts: Concept[] = [
    { id: 'scope', title: 'Scope of Thermodynamics', icon: 'fa-eye', category: 'fundamentals', formula: 'Energy + Entropy + Equilibrium', content: 'The study of energy conversion, heat transfer, and properties of systems in equilibrium. Bridges microscopic molecular physics with macroscopic engineering.', tags: ['Scope', 'Definition'] },
    { id: 'si', title: 'SI Unit System', icon: 'fa-ruler-combined', category: 'fundamentals', formula: '1 N = 1 kg·m/s²', content: 'Standard International units: Mass (kg), Length (m), Time (s), Temperature (K), and Amount (mol). Essential for consistency in scientific measurement.', tags: ['SI', 'Units'] },
    { id: 'first-law', title: 'First Law of Thermodynamics', icon: 'fa-bolt', category: 'laws', formula: 'ΔU = Q - W', content: 'Conservation of energy. Total energy in an isolated system is constant. Change in internal energy equals net heat minus net work.', tags: ['1st Law', 'Energy Balance'] },
    { id: 'ideal-gas', title: 'Ideal Gas Behavior', icon: 'fa-leaf', category: 'properties', formula: 'PV = nRT', content: 'Simplest equation of state assuming no molecular volume or attraction forces. Valid at high temperature and low pressure.', tags: ['Ideal Gas', 'Gas State'] },
    { id: 'enthalpy', title: 'Enthalpy (H)', icon: 'fa-wind', category: 'laws', formula: 'H = U + PV', content: 'Accounts for internal energy plus flow work required to push fluid into or out of a control volume. Essential for open system analysis.', tags: ['Entalpi', 'Open System'] },
    { id: 'entropy', title: 'Entropy (S)', icon: 'fa-hourglass-half', category: 'second', formula: 'dS = δQ_rev / T', content: 'Measure of molecular disorder and process directionality. Total entropy of an isolated system always increases in real processes.', tags: ['Entropy', 'Disorder'] },
    { id: 'cubic', title: 'Cubic Equations (EOS)', icon: 'fa-cubes', category: 'properties', formula: 'P = RT/(v-b) - a/(v²+2bv-b²)', content: 'Peng-Robinson and SRK models. Describes both vapor and liquid phases using parameters derived from critical temperature and pressure.', tags: ['Cubic EOS', 'PR', 'SRK'] },
    { id: 'fugacity', title: 'Fugacity (f)', icon: 'fa-flask', category: 'solutions', formula: 'fi = φi · xi · P', content: 'Effective pressure used to quantify chemical potential for non-ideal fluids. Fugacity coefficients handle gas phase non-ideality.', tags: ['Fugacity', 'Non-Ideal'] },
    { id: 'vle-behavior', title: 'Vapor-Liquid Behavior', icon: 'fa-droplet', category: 'phase', formula: 'yiP = xiPsat', content: 'Mapping of bubble and dew points of mixtures. Raoult’s law is a primary simplification for ideal solutions.', tags: ['VLE', 'Raoult'] },
  ];

  const filteredConcepts = useMemo(() => {
    return concepts.filter(c => {
      const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* Header Search Area */}
      <section className="bg-slate-900 p-16 rounded-[3rem] text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Scientific Reference Module</h2>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-8">Concept <span className="text-teal-400">Log.</span></h1>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <p className="text-slate-400 text-base leading-relaxed font-medium max-w-xl">
              Quick access to fundamental thermodynamic principles, mathematical derivations, and industrial applications.
            </p>
            <div className="relative flex-1 group">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"></i>
              <input 
                type="text"
                placeholder="Search concepts, formulas, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/30 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-32">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id ? 'bg-teal-50 text-teal-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                >
                  <i className={`fas ${cat.icon} text-xs w-4 text-center ${activeCategory === cat.id ? 'text-teal-600' : 'opacity-30'}`}></i>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {filteredConcepts.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-slate-200 p-24 text-center">
               <i className="fas fa-folder-open text-slate-200 text-5xl mb-6"></i>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching principles identified</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredConcepts.map((concept) => (
                <ConceptEntry key={concept.id} {...concept} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConceptEntry: React.FC<Concept> = ({ title, icon, content, tags, formula, category }) => {
  const categoryColors: any = {
    fundamentals: 'bg-slate-100 text-slate-600',
    laws: 'bg-teal-100 text-teal-600',
    properties: 'bg-teal-100 text-teal-600',
    second: 'bg-emerald-100 text-emerald-600',
    relations: 'bg-blue-100 text-blue-600',
    flow: 'bg-rose-100 text-rose-600',
    solutions: 'bg-indigo-100 text-indigo-600',
    phase: 'bg-slate-900 text-teal-400',
  };

  return (
    <div className="card-elevated p-10 flex flex-col h-full group">
      <div className="flex items-start justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${categoryColors[category] || 'bg-slate-50 text-slate-600'}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <span className="bg-slate-50 px-3 py-1.5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{category}</span>
      </div>
      
      <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">{title}</h3>
      
      <div className="mb-6 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-center overflow-x-auto scrollbar-hide">
         <p className="text-slate-800 font-bold text-xs tracking-tight">{formula}</p>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10 line-clamp-3">
        {content}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-6 border-t border-slate-50">
        {tags.map((t) => (
          <span key={t} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-teal-600 hover:border-teal-200 transition-colors">{t}</span>
        ))}
      </div>
    </div>
  );
};

export default Library;
