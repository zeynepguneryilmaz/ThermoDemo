
import React, { useState } from 'react';
import Layout from './components/Layout';
import Home from './modules/Home';
import Library from './modules/Library';
import Solver from './modules/Solver';
import StateProperties from './modules/StateProperties';
import PhaseEquilibrium from './modules/PhaseEquilibrium';
import FirstLaw from './modules/FirstLaw';
import SteadyFlow from './modules/SteadyFlow';
import SecondLaw from './modules/SecondLaw';
import Cycles from './modules/Cycles';
import Solutions from './modules/Solutions';
import { UnitSystem, WorkConvention } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState('home');
  const [units, setUnits] = useState<UnitSystem>(UnitSystem.SI);
  const [convention, setConvention] = useState<WorkConvention>(WorkConvention.BY_SYSTEM);

  const renderModule = () => {
    switch (activeModule) {
      case 'home': return <Home />;
      case 'library': return <Library />;
      case 'solver': return <Solver units={units} />;
      case 'state': return <StateProperties units={units} />;
      case 'phase': return <PhaseEquilibrium />;
      case 'firstlaw': return <FirstLaw convention={convention} units={units} />;
      case 'steadyflow': return <SteadyFlow units={units} />;
      case 'secondlaw': return <SecondLaw convention={convention} />;
      case 'cycles': return <Cycles convention={convention} units={units} />;
      case 'solutions': return <Solutions />;
      default: return (
        <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-xl animate-pulse">
          <i className="fas fa-tools text-5xl text-slate-200 mb-4"></i>
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Under Construction</h2>
          <p className="text-slate-400 text-sm mt-2 font-mono">Module "{activeModule}" coming soon.</p>
        </div>
      );
    }
  };

  return (
    <Layout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      units={units}
      setUnits={setUnits}
      convention={convention}
      setConvention={setConvention}
    >
      {renderModule()}
    </Layout>
  );
};

export default App;
