/**
 * CompareFloatingBar.jsx
 * -------------------
 * Floating action bar that appears when users select multiple cars or parts
 * across the website for side-by-side comparison in the Full-Screen Studio.
 */

import React from 'react';

export default function CompareFloatingBar({
  selectedItems = [],
  mode = 'vehicles', // 'vehicles' | 'parts'
  onRemoveItem,
  onClearAll,
  onCompareNow,
}) {
  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="pointer-events-auto bg-[#171915]/95 backdrop-blur-md border border-[#c5a77a]/50 text-white rounded-md shadow-2xl px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 max-w-4xl w-full">
        {/* Left: Summary text */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#c5a77a] text-[#11120f] font-bold text-xs flex items-center justify-center shrink-0">
            {selectedItems.length}
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#c5a77a] font-semibold">
              {mode === 'vehicles' ? 'Vehicles Multi-Select' : 'Accessories & Parts Multi-Select'}
            </div>
            <div className="text-xs text-white/80 font-medium">
              {selectedItems.length === 1
                ? 'Select at least 1 more to compare'
                : `Ready to compare ${selectedItems.length} items side-by-side`}
            </div>
          </div>
        </div>

        {/* Center: Selected Items Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 no-scrollbar flex-1">
          {selectedItems.map((item) => (
            <div
              key={`float-item-${item.id}`}
              className="flex items-center gap-2 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-xs shrink-0"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-5 h-5 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=100&q=80';
                  }}
                />
              )}
              <span className="max-w-[110px] sm:max-w-[140px] truncate text-[11px] text-white">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="text-white/60 hover:text-white hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer"
                title="Remove from comparison"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] uppercase tracking-wider text-white/60 hover:text-white px-2 py-1.5 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={selectedItems.length < 2}
            onClick={onCompareNow}
            className={`px-4 py-2 rounded-xs font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedItems.length >= 2
                ? 'bg-[#c5a77a] hover:bg-[#d8bb8d] text-[#11120f] shadow-lg shadow-[#c5a77a]/20'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <span>Compare Now</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
