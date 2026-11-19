import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CellDropdown = ({
  value,
  options,
  onChange,
  renderTrigger,
  align = 'left',
  disabled = false,
  title = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optValue, e) => {
    e.stopPropagation();
    onChange(optValue);
    setIsOpen(false);
  };

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className="relative inline-block text-left" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${disabled ? 'cursor-default opacity-80' : 'cursor-pointer hover:opacity-90 group'}`}
        title={title || 'Click to change'}
      >
        {renderTrigger ? (
          renderTrigger(selectedOpt || { label: value, value }, isOpen)
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-dark-800/80 hover:bg-dark-750 border border-slate-700/60 text-slate-200 transition"
          >
            <span>{selectedOpt ? selectedOpt.label : value}</span>
            {!disabled && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[160px] rounded-xl bg-dark-900 border border-slate-700/80 shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={(e) => handleSelect(opt.value, e)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.dotColor && <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />}
                  {opt.icon && <opt.icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                  <div className="truncate">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && <div className="text-[10px] text-slate-500 truncate">{opt.sublabel}</div>}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
