
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block group">
      <div 
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help flex items-center gap-1"
      >
        {children}
        <i className="fas fa-circle-info text-[10px] text-slate-300 group-hover:text-indigo-400 transition-colors"></i>
      </div>
      {visible && (
        <div className="absolute z-[100] w-48 p-3 text-[11px] font-medium leading-relaxed text-white bg-slate-900 rounded-xl shadow-2xl -top-2 left-full ml-3 animate-fade border border-white/10">
          {text}
          <div className="absolute w-2 h-2 bg-slate-900 rotate-45 -left-1 top-3 border-l border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
