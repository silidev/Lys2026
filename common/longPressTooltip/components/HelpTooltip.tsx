const FILE_PATH = 'common/longPressTooltip/components/HelpTooltip.tsx';
import React, { useState, useEffect, useRef } from 'react';
import type { TooltipData } from '../types/index.ts';

interface HelpTooltipProps {
  tooltip: TooltipData | null;
  setTooltip: (tooltip: TooltipData | null) => void;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ tooltip, setTooltip }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [caretStyle, setCaretStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (tooltip && tooltipRef.current) {
      const { targetRect } = tooltip;
      const tooltipEl = tooltipRef.current;
      const { width: tipWidth, height: tipHeight } = tooltipEl.getBoundingClientRect();
      const margin = 8;
      let isAbove = true;

      let top = targetRect.top - tipHeight - margin;
      // If not enough space above, place below
      if (top < margin) {
        top = targetRect.bottom + margin;
        isAbove = false;
      }

      let left = targetRect.left + (targetRect.width / 2) - (tipWidth / 2);
      // Clamp horizontal position to be within viewport
      left = Math.max(margin, Math.min(left, window.innerWidth - tipWidth - margin));

      setStyle({ top: `${top}px`, left: `${left}px`, opacity: 1, willChange: 'opacity, transform' });
      
      const caretLeft = targetRect.left + (targetRect.width / 2) - left;
      
      setCaretStyle({
          left: `${caretLeft}px`,
          ...(isAbove
              ? { bottom: '-4px', transform: 'translateX(-50%) rotate(45deg)' }
              : { top: '-4px', transform: 'translateX(-50%) rotate(225deg)' }
          ),
      });

    }
  }, [tooltip]);

  if (!tooltip) return null;

  return (
    <div 
      className="fixed inset-0 z-[100]" 
      onClick={() => setTooltip(null)}
      // Prevent scrolling while tooltip is open
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        ref={tooltipRef}
        style={style}
        className="fixed bg-gray-900 text-white text-sm max-w-xs p-3 rounded-lg shadow-2xl transition-opacity duration-150 opacity-0 border border-gray-700 select-none"
        role="tooltip"
      >
        {tooltip.content.helpText && <p>{tooltip.content.helpText}</p>}
        {tooltip.content.nameInCode && (
            <p className={`text-xs text-gray-400 opacity-75 font-mono ${tooltip.content.helpText ? 'mt-1 pt-1 border-t border-gray-700' : ''}`}>
                {tooltip.content.nameInCode}
            </p>
        )}
        <div 
          className="absolute w-2.5 h-2.5 bg-gray-900"
          style={caretStyle}
        />
      </div>
    </div>
  );
};

export default HelpTooltip;