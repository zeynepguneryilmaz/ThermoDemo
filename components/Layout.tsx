
import React, { useState } from 'react';
import { UnitSystem, WorkConvention } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  units: UnitSystem;
  setUnits: (u: UnitSystem) => void;
  convention: WorkConvention;
  setConvention: (c: WorkConvention) => void;
}

const Logo = () => (
  <div className="relative w-11 h-11 flex items-center justify-center group">
    {/* Abstract background shape for depth */}
    <div className="absolute inset-0 bg-indigo-900 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-indigo-900/20"></div>
    <div className="absolute inset-0 bg-teal-500 rounded-2xl opacity-20 -rotate-6 group-hover:-rotate-12 transition-transform duration-500"></div>
    
    <svg viewBox="0 0 100 100" className="w-6 h-6 relative z-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stylized 'T' with a thermal wave crossbar */}
      <path 
        d="M50 85V35" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      <path 
        d="M20 30C35 15 65 45 80 30" 
        stroke="#2dd4bf" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
    </svg>
  </div>
);

const modules = [
  { id: 'home', name: 'Dashboard', icon: 'fa-house' },
  { id: 'library', name: 'Encyclopedia', icon: 'fa-book-bookmark' },
  { id: 'solver', name: 'Process Solver', icon: 'fa-calculator' },
  { id: 'state', name: 'Properties', icon: 'fa-atom' },
  { id: 'firstlaw', name: 'Energy Balances', icon: 'fa-bolt-lightning' },
  { id: 'steadyflow', name: 'Flow Systems', icon: 'fa-wind' },
  { id: 'secondlaw', name: 'Entropy Lab', icon: 'fa-hourglass-start' },
  { id: 'cycles', name: 'Power Cycles', icon: 'fa-rotate' },
  { id: 'phase', name: 'Phase Dynamics', icon: 'fa-droplet' },
  { id: 'solutions', name: 'Solution Theory', icon: 'fa-vials' },
];

const Layout: React.FC<LayoutProps> = ({ 
  children, activeModule, setActiveModule, 
  units, setUnits, convention, setConvention 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-teal-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className={`bg-white border-r border-slate-200 w-72 fixed h-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-50 shadow-sm flex flex-col`}>
        <div className="p-8 flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              Thermo<span className="text-teal-600">Demo</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1">
              <span className="w-1 h-1 bg-teal-500 rounded-full animate-pulse"></span>
              Science Studio
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group relative overflow-hidden ${activeModule === m.id ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {activeModule === m.id && (
                <div className="absolute left-0 top-0 w-1 h-full bg-teal-400"></div>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeModule === m.id ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                <i className={`fas ${m.icon} text-xs`}></i>
              </div>
              {m.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Environment Config</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setUnits(units === UnitSystem.SI ? UnitSystem.ENGLISH : UnitSystem.SI)}
              className="py-3 px-3 text-[9px] font-black rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:shadow-sm active:scale-95 transition-all uppercase tracking-widest"
            >
              Units: <span className="text-teal-600">{units}</span>
            </button>
            <button 
              onClick={() => setConvention(convention === WorkConvention.BY_SYSTEM ? WorkConvention.ON_SYSTEM : WorkConvention.BY_SYSTEM)}
              className="py-3 px-3 text-[9px] font-black rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:shadow-sm active:scale-95 transition-all uppercase tracking-widest"
            >
              Sign: <span className="text-teal-600">{convention === WorkConvention.BY_SYSTEM ? 'Q-W' : 'Q+W'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-10 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-900 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all active:scale-90"
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'} text-sm`}></i>
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
              {modules.find(m => m.id === activeModule)?.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm flex items-center gap-2">
                <i className="fas fa-microscope text-[10px] opacity-60"></i>
                Computation Active
             </div>
          </div>
        </header>

        <div className="p-8 max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
