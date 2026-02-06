
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SubstanceType } from '../types';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  color: string;
  type: 'water' | 'gas' | 'diatomic';
  isComponentA: boolean;
}

interface ParticleSimProps {
  temperature: number; // Kelvin
  density: number;    // 0 to 1
  compositionA?: number; // 0 to 1 (Mole fraction of A)
  substanceA?: string;
  substanceB?: string;
  phase?: string;
  height?: number;
}

export const UnifiedParticleSim: React.FC<ParticleSimProps> = ({ 
  temperature, 
  density, 
  compositionA = 1, 
  substanceA = 'Air',
  substanceB = 'Water',
  phase = 'Fluid',
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [complexity, setComplexity] = useState(1); 
  const [timeScale, setTimeScale] = useState(1.0);

  const particleCount = useMemo(() => {
    const base = 40 + density * 100;
    return Math.floor(base * complexity);
  }, [density, complexity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const depth = 200;
    const perspective = 400;

    let particles: Particle3D[] = [];
    const speedScale = Math.sqrt(temperature / 28) * 0.5;

    const getType = (name: string): 'water' | 'gas' | 'diatomic' => {
      if (name.toLowerCase().includes('water')) return 'water';
      if (name.toLowerCase().includes('air') || name.toLowerCase().includes('nitrogen')) return 'diatomic';
      return 'gas';
    };

    for (let i = 0; i < particleCount; i++) {
      const isA = Math.random() < compositionA;
      const subName = isA ? substanceA : substanceB;
      const type = getType(subName);
      
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * depth,
        vx: (Math.random() - 0.5) * speedScale,
        vy: (Math.random() - 0.5) * speedScale,
        vz: (Math.random() - 0.5) * speedScale,
        r: type === 'water' ? 5 : 4,
        color: isA ? '#6366f1' : '#f43f5e',
        type,
        isComponentA: isA
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.sort((a, b) => b.z - a.z);

      particles.forEach((p) => {
        const dt = timeScale;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (p.z < 0 || p.z > depth) p.vz *= -1;

        const scale = perspective / (perspective + p.z);
        const px = (p.x - w/2) * scale + w/2;
        const py = (p.y - h/2) * scale + h/2;
        const pr = p.r * scale;

        ctx.globalAlpha = 0.4 + (1 - p.z/depth) * 0.6;

        if (p.type === 'water') {
           ctx.save();
           ctx.translate(px, py);
           ctx.rotate(Math.atan2(p.vy, p.vx));
           ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI*2); ctx.fillStyle = p.isComponentA ? '#4f46e5' : '#e11d48'; ctx.fill();
           ctx.beginPath(); ctx.arc(-pr*0.7, pr*0.5, pr*0.4, 0, Math.PI*2); ctx.arc(pr*0.7, pr*0.5, pr*0.4, 0, Math.PI*2);
           ctx.fillStyle = '#f8fafc'; ctx.fill();
           ctx.restore();
        } else if (p.type === 'diatomic') {
           ctx.save();
           ctx.translate(px, py);
           ctx.rotate(Math.atan2(p.vy, p.vx));
           ctx.beginPath(); ctx.arc(-pr*0.5, 0, pr*0.8, 0, Math.PI*2); ctx.arc(pr*0.5, 0, pr*0.8, 0, Math.PI*2);
           ctx.fillStyle = p.color; ctx.fill();
           ctx.restore();
        } else {
           ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.fill();
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [temperature, density, compositionA, substanceA, substanceB, particleCount, timeScale]);

  return (
    <div className="relative group border border-slate-200/50 rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl flex-1" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
        <span className="text-[9px] font-black text-white uppercase tracking-widest">{phase} • {temperature.toFixed(1)} K</span>
      </div>
    </div>
  );
};

export const PistonCylinder: React.FC<{ 
  volume: number; 
  temperature: number; 
  heatTransfer: number; 
  work: number; 
  substance?: string;
  isLocked?: boolean;
}> = ({ volume, temperature, heatTransfer, work, substance = 'Air', isLocked = false }) => {
  const h = Math.min(94, Math.max(10, (volume * 40))); 
  const glowColor = temperature > 373 ? 'rgba(244, 63, 94, 0.15)' : temperature < 280 ? 'rgba(56, 189, 248, 0.15)' : 'transparent';

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="relative border-x-[12px] border-b-[12px] border-slate-900 rounded-b-[3rem] h-[500px] w-full bg-slate-900 overflow-hidden ring-8 ring-indigo-500/5">
        <div 
          className="absolute bottom-0 w-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) z-10" 
          style={{ height: `${h}%`, backgroundColor: glowColor }}
        >
          <UnifiedParticleSim 
            temperature={temperature} 
            density={Math.min(1, 0.5/volume)} 
            height={500} 
            substanceA={substance} 
            phase="Closed System"
          />
        </div>
        <div 
          className="absolute left-0 w-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) border-b-8 border-slate-900 z-30 shadow-2xl" 
          style={{ bottom: `${h}%`, height: '40px', backgroundColor: '#334155' }}
        >
          <div className="absolute top-[-400px] left-1/2 -translate-x-1/2 w-12 h-[400px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-x border-slate-800">
             {Math.abs(work) > 1 && (
               <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-500 ${work > 0 ? 'top-[-60px]' : 'top-0'}`}>
                  <i className={`fas ${work > 0 ? 'fa-arrow-up text-indigo-400' : 'fa-arrow-down text-rose-400'} text-2xl animate-bounce`}></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Work {work > 0 ? 'Out' : 'In'}</span>
               </div>
             )}
          </div>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <i className="fas fa-lock text-xs"></i>
            </div>
          )}
        </div>
        {Math.abs(heatTransfer) > 1 && (
          <div className="absolute bottom-10 left-0 w-full flex justify-around pointer-events-none z-40">
             {[1,2,3].map(i => (
               <i key={i} className={`fas ${heatTransfer > 0 ? 'fa-arrow-up text-orange-500' : 'fa-arrow-down text-cyan-500'} text-xl animate-pulse opacity-80`} style={{ animationDelay: `${i * 0.2}s` }}></i>
             ))}
          </div>
        )}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 w-full text-center">
         <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Boundary</p>
            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter">{isLocked ? 'Fixed / Rigid' : 'Movable / Floating'}</p>
         </div>
         <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Volume (v)</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{volume.toFixed(4)} m³/kg</p>
         </div>
      </div>
    </div>
  );
};

export const DeviceSchematic: React.FC<{ type: string; color?: string }> = ({ type, color = 'currentColor' }) => {
  let mainPath = "";
  let extraPaths: React.ReactNode = null;
  const viewBox = "0 0 100 100";

  switch(type) {
    case 'turbine':
      mainPath = "M 10,30 L 90,10 L 90,90 L 10,70 Z";
      extraPaths = (
        <>
          <path d="M 50,20 L 50,80 M 30,25 L 30,75 M 70,15 L 70,85" strokeWidth={2} opacity={0.3} />
          <circle cx="50" cy="50" r="5" fill={color} />
        </>
      );
      break;
    case 'compressor':
      mainPath = "M 10,10 L 90,30 L 90,70 L 10,90 Z";
      extraPaths = (
        <>
          <path d="M 50,20 L 50,80 M 30,25 L 30,75 M 70,15 L 70,85" strokeWidth={2} opacity={0.3} />
          <circle cx="50" cy="50" r="5" fill={color} />
        </>
      );
      break;
    case 'pump':
      mainPath = "M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0";
      extraPaths = (
        <path d="M 50,10 L 50,90 M 10,50 L 90,50" strokeWidth={4} />
      );
      break;
    case 'boiler':
    case 'heater':
      mainPath = "M 10,10 L 90,10 L 90,90 L 10,90 Z";
      extraPaths = (
        <path d="M 10,30 Q 50,10 90,30 M 10,50 Q 50,30 90,50 M 10,70 Q 50,50 90,70" strokeWidth={2} strokeDasharray="4 2" />
      );
      break;
    case 'condenser':
    case 'cooler':
      mainPath = "M 10,10 L 90,10 L 90,90 L 10,90 Z";
      extraPaths = (
        <path d="M 10,30 Q 50,50 90,30 M 10,50 Q 50,70 90,50 M 10,70 Q 50,90 90,70" strokeWidth={2} strokeDasharray="4 2" />
      );
      break;
    case 'nozzle':
      mainPath = "M 10,10 L 90,40 L 90,60 L 10,90 Z";
      break;
    default:
      mainPath = "M 10,10 L 90,10 L 90,90 L 10,90 Z";
  }

  return (
    <svg viewBox={viewBox} className="w-full h-full drop-shadow-xl" style={{ fill: 'none', stroke: color, strokeWidth: 4, strokeLinejoin: 'round' }}>
      <path d={mainPath} fill="rgba(255,255,255,0.05)" />
      {extraPaths}
    </svg>
  );
};
