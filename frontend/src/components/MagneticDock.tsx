import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface DockItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export interface MagneticDockProps {
  items: DockItemData[];
  iconSize?: number;
  maxScale?: number;
  magneticDistance?: number;
  showLabels?: boolean;
  position?: string;
  className?: string;
}

interface DockItemProps {
  item: DockItemData;
  mouseY: number | null;
  iconSize: number;
  maxScale: number;
  magneticDistance: number;
  showLabels: boolean;
}

function DockItem({
  item,
  mouseY,
  iconSize,
  maxScale,
  magneticDistance,
  showLabels,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);

  // Recalculate distance and magnification on mouse move
  useEffect(() => {
    if (mouseY === null || !ref.current) {
      setScale(1);
      setOffsetX(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const itemCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(mouseY - itemCenterY);

    if (distance < magneticDistance) {
      // Smooth cosine curve magnification from 1 to maxScale
      const factor = Math.cos((distance / magneticDistance) * (Math.PI / 2));
      const newScale = 1 + (maxScale - 1) * factor;
      setScale(newScale);
      setOffsetX((newScale - 1) * 12); // Come forward and to the right toward cursor
    } else {
      setScale(1);
      setOffsetX(0);
    }
  }, [mouseY, magneticDistance, maxScale]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        aria-label={item.label}
        onClick={item.onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center rounded-2xl focus:outline-none cursor-pointer border-none bg-transparent p-0 select-none z-10 hover:z-40 active:scale-95 transition-transform"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          transform: `translate3d(${offsetX}px, 0, 0) scale(${scale})`,
          transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformOrigin: 'center left',
          willChange: 'transform',
        }}
      >
        {/* macOS Squircle Glass Tile Container */}
        <div
          className={`relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
            item.isActive
              ? 'bg-gradient-to-b from-[#2563EB] to-[#4F46E5] border border-cyan-400/50 shadow-[0_0_22px_rgba(37,99,235,0.45)]'
              : 'bg-gradient-to-b from-[#202534]/95 to-[#111420]/95 border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/25 hover:from-[#262c3e] hover:to-[#161a28]'
          }`}
          style={{
            boxShadow: isHovered
              ? item.isActive
                ? '0 8px 25px rgba(37,99,235,0.6), 0 0 15px rgba(34,211,238,0.4), inset 0 1px 1px rgba(255,255,255,0.6)'
                : '0 8px 24px rgba(0,0,0,0.45), 0 0 14px rgba(255,255,255,0.12), inset 0 1px 1px rgba(255,255,255,0.25)'
              : undefined,
          }}
        >
          {/* Specular Glossy Shine Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 45%, transparent 60%)',
              opacity: isHovered ? 0.95 : 0.6,
            }}
          />

          {/* Icon */}
          <div
            className={`relative z-10 flex items-center justify-center transition-colors ${
              item.isActive
                ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                : isHovered
                ? 'text-white'
                : 'text-slate-300'
            }`}
          >
            {item.icon}
          </div>
        </div>

        {/* macOS Active Dot Indicator (glowing cyan dot under tile) */}
        {item.isActive && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
        )}
      </button>

      {/* Floating Glass Tooltip */}
      {showLabels && isHovered && (
        <div
          className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#10141f]/95 backdrop-blur-md text-white text-xs font-semibold border border-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.6)] whitespace-nowrap pointer-events-none z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <span>{item.label}</span>
          {/* Tooltip Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#10141f] mr-[-1px]" />
        </div>
      )}
    </div>
  );
}

/**
 * Collapsed Icon-only Magnetic Dock (No outer border outline - clean floating tiles)
 */
export function MagneticDock({
  items,
  iconSize = 42,
  maxScale = 1.38,
  magneticDistance = 95,
  showLabels = true,
  className = '',
}: MagneticDockProps) {
  const [mouseY, setMouseY] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseY(e.clientY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseY(null);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col items-center gap-3 p-0 bg-transparent border-0 shadow-none ${className}`}
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          item={item}
          mouseY={mouseY}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticDistance={magneticDistance}
          showLabels={showLabels}
        />
      ))}
    </div>
  );
}

export interface ExpandedDockItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function ExpandedDockItem({
  item,
  mouseY,
}: {
  item: ExpandedDockItemData;
  mouseY: number | null;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);

  const magneticDistance = 90;

  useEffect(() => {
    if (mouseY === null || !ref.current) {
      setScale(1);
      setTranslateX(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const itemCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(mouseY - itemCenterY);

    if (distance < magneticDistance) {
      const factor = Math.cos((distance / magneticDistance) * (Math.PI / 2));
      setScale(1 + 0.045 * factor); // Scales up to 1.045x
      setTranslateX(8 * factor);     // Slides forward to the right by up to 8px
    } else {
      setScale(1);
      setTranslateX(0);
    }
  }, [mouseY]);

  return (
    <div className="relative w-full">
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        aria-label={item.label}
        onClick={item.onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl cursor-pointer w-full text-left border-none outline-none select-none z-10 active:scale-[0.98] ${
          item.isActive
            ? 'text-white'
            : isHovered
            ? 'text-white'
            : 'text-slate-400'
        }`}
        style={{
          transform: `translate3d(${translateX}px, 0, 0) scale(${scale})`,
          transformOrigin: 'center left',
          transition: 'transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 150ms ease, background 150ms ease',
          willChange: 'transform',
          background: item.isActive
            ? 'linear-gradient(135deg, #2563EB, #4F46E5)'
            : isHovered
            ? 'rgba(255, 255, 255, 0.08)'
            : translateX > 1
            ? 'rgba(255, 255, 255, 0.035)'
            : 'transparent',
          border: isHovered
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid transparent',
          boxShadow: item.isActive
            ? '0 0 25px rgba(37,99,235,0.4), inset 0 1px 1px rgba(255,255,255,0.3)'
            : isHovered
            ? '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'none',
        }}
      >
        <div className={`flex-shrink-0 transition-all duration-200 ${
          item.isActive ? 'text-white' : isHovered ? 'text-white scale-110' : translateX > 1 ? 'text-slate-200' : 'text-slate-400'
        }`}>
          {item.icon}
        </div>
        <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {item.label}
        </span>
        {item.isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-white/90 flex-shrink-0 shadow-[0_0_6px_#fff]" />
        )}
      </button>
    </div>
  );
}

/**
 * Expanded Full-width Magnetic Dock Navigation
 */
export function ExpandedMagneticDock({
  items,
  className = '',
}: {
  items: ExpandedDockItemData[];
  className?: string;
}) {
  const [mouseY, setMouseY] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseY(e.clientY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseY(null);
  }, []);

  return (
    <nav
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col gap-1.5 px-3 select-none ${className}`}
    >
      {items.map((item) => (
        <ExpandedDockItem key={item.id} item={item} mouseY={mouseY} />
      ))}
    </nav>
  );
}
