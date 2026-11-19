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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#141418] hover:bg-[#1a1a20] border border-white/[0.08] text-zinc-200 transition"
          >
            <span>{selectedOpt ? selectedOpt.label : value}</span>
            {!disabled && <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition" />}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[170px] rounded-xl bg-[#141418] border border-white/[0.10] shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
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
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                  isSelected
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.dotColor}`} />}
                  {opt.icon && <opt.icon className="w-3.5 h-3.5 shrink-0 text-zinc-400" />}
                  <div className="truncate">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && <div className="text-[10px] text-zinc-500 truncate">{opt.sublabel}</div>}
                  </div>
                </div>
                {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
