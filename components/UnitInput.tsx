
import React from 'react';

interface UnitInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit: string;
  onUnitChange: (unit: any) => void;
  options: string[];
}

const UnitInput: React.FC<UnitInputProps> = ({ label, value, onChange, unit, onUnitChange, options }) => {
  return (
    <div className="space-y-2 group">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 group-focus-within:text-teal-600 transition-colors">
        {label}
      </label>
      <div className="flex bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200 focus-within:border-teal-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/5 transition-all shadow-sm">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 px-5 py-3.5 outline-none text-sm font-bold text-slate-700 bg-transparent"
        />
        <div className="bg-slate-100/50 border-l border-slate-100 flex items-center px-1">
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="bg-transparent px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter outline-none cursor-pointer hover:text-teal-600 transition-colors"
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UnitInput;
