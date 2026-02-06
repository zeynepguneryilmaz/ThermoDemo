
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden bg-indigo-900 p-16 rounded-[3rem] flex items-center shadow-xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-teal-500/10 to-transparent"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 text-teal-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-white/10 backdrop-blur-sm">
            <i className="fas fa-microscope"></i>
            Interactive Thermodynamics Studio
          </div>
          <h1 className="text-6xl font-black mb-8 leading-tight tracking-tight">
            Thermal <span className="text-teal-400">Simulation.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
            A high-fidelity academic environment for visualizing physical properties, solving complex energy balances, and exploring chemical solution thermodynamics.
          </p>
        </div>
      </section>

      {/* Core Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatTile label="Physics Modules" value="10" icon="fa-cubes-stacked" />
        <StatTile label="Principles" value="100+" icon="fa-book-bookmark" />
        <StatTile label="EOS Models" value="3" icon="fa-flask-vial" />
        <StatTile label="Fidelity" value="High" icon="fa-bullseye" />
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureBox 
          icon="fa-book-open-reader" 
          title="Concept Library" 
          desc="Complete scientific log covering classical, chemical, and industrial thermodynamics."
          color="bg-indigo-900"
        />
        <FeatureBox 
          icon="fa-bolt-lightning" 
          title="Process Solver" 
          desc="Guided problem-solving engine for closed and open system energy balances."
          color="bg-teal-600"
        />
        <FeatureBox 
          icon="fa-flask" 
          title="Properties" 
          desc="Calculate fluid properties across VLE regions using rigorous EOS models."
          color="bg-slate-700"
        />
      </div>

      {/* Checklist Section */}
      <section className="bg-white p-16 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-10">
            <div>
               <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Suite Capabilities</h2>
               <div className="h-1 w-16 bg-teal-500 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <CheckRow text="Isothermal P-x-y Phase Mapping" />
              <CheckRow text="Exergy & Lost Work Auditing" />
              <CheckRow text="Cubic & Virial Real Gas Models" />
              <CheckRow text="3D Molecular Particle Simulation" />
              <CheckRow text="Interactive Power Cycle Architect" />
              <CheckRow text="Solution Theory & Mixing Energies" />
            </div>
          </div>
          
          <div className="bg-slate-900 p-10 rounded-[2.5rem] flex flex-col items-center text-center max-w-sm shrink-0 shadow-2xl relative">
             <div className="absolute inset-0 bg-teal-500/5 rounded-[2.5rem]"></div>
             <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-6 text-white shadow-xl shadow-teal-500/20 relative z-10">
                <i className="fas fa-atom text-2xl"></i>
             </div>
             <p className="text-sm text-slate-300 font-medium leading-relaxed italic relative z-10">
               "Bridging the gap between abstract equations and physical intuition through visual computation."
             </p>
          </div>
      </section>
    </div>
  );
};

const StatTile = ({ label, value, icon }: any) => (
  <div className="card-elevated p-8 flex items-center gap-5">
    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none mt-1">{value}</p>
    </div>
  </div>
);

const FeatureBox = ({ icon, title, desc, color }: any) => (
  <div className="card-elevated group p-10">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 shadow-lg text-white ${color}`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8">{desc}</p>
    <button className="text-[10px] font-black uppercase text-teal-600 tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
      Learn More <i className="fas fa-arrow-right"></i>
    </button>
  </div>
);

const CheckRow = ({ text }: any) => (
  <div className="flex items-center gap-4">
    <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] border border-teal-100">
      <i className="fas fa-check"></i>
    </div>
    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{text}</span>
  </div>
);

export default Home;
