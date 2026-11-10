import React, { useEffect, useState } from 'react';
import { Dices, Sparkles, FastForward } from 'lucide-react';
import { sound } from '../utils/audio';

interface ChitShuffleAnimationProps {
  onComplete: () => void;
  count?: number;
}

export const ChitShuffleAnimation: React.FC<ChitShuffleAnimationProps> = ({
  onComplete,
  count = 4,
}) => {
  const [shuffleStep, setShuffleStep] = useState(0);

  useEffect(() => {
    sound.playShuffle();

    // Frequent rhythmic swaps
    const interval = setInterval(() => {
      setShuffleStep((prev) => {
        if (prev === 2) sound.playShuffle();
        return prev + 1;
      });
    }, 220);

    // Conclude after 1.6s of smooth swirling
    const timer = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 1600);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16]/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-80 h-72 flex items-center justify-center perspective-[1000px]">
        {Array.from({ length: count }).map((_, idx) => {
          // Calculate dynamic 3D orbital trajectory
          const angle = ((idx + shuffleStep * 1.5) % count) * (360 / count);
          const rad = (angle * Math.PI) / 180;
          const xOffset = Math.sin(rad) * 65;
          const yOffset = Math.cos(rad) * 35;
          const rotateZ = (idx % 2 === 0 ? 1 : -1) * (12 + (shuffleStep % 4) * 8);
          const scale = 0.95 + ((idx + shuffleStep) % count) * 0.05;

          return (
            <div
              key={idx}
              className="absolute w-28 h-40 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#f59e0b] shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out flex flex-col items-center justify-between p-3 select-none"
              style={{
                transform: `translate3d(${xOffset}px, ${yOffset}px, 0) rotate(${rotateZ}deg) scale(${scale})`,
                zIndex: ((idx + shuffleStep) % count) + 10,
              }}
            >
              {/* Top Label */}
              <div className="w-full flex justify-between items-center text-[9px] font-black font-mono text-amber-950 uppercase tracking-widest">
                <span>CHIT #{idx + 1}</span>
                <Sparkles className="w-3 h-3 text-amber-800" />
              </div>

              {/* Center Wax-Seal Stamp */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 border-2 border-yellow-200 shadow-lg flex items-center justify-center">
                <span className="text-xl filter drop-shadow">📜</span>
              </div>

              {/* Bottom Tag */}
              <div className="w-full text-center">
                <span className="text-[9px] font-bold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Royal Slip
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-sm font-black shadow-lg shadow-amber-500/20 animate-pulse">
          <Dices className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Shuffling Royal Parchments...</span>
        </div>
        <p className="text-xs text-slate-300 font-medium">
          Roles are being secretly scrambled across the royal court
        </p>

        <div>
          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] font-bold text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800"
          >
            <span>Skip Shuffling</span>
            <FastForward className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
