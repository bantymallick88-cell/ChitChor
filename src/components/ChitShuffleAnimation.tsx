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

    // Rhythmic 3D card swapping cycles
    const interval = setInterval(() => {
      setShuffleStep((prev) => {
        if (prev % 2 === 0) sound.playShuffle();
        return prev + 1;
      });
    }, 200);

    // Conclude after 1.8s of smooth swirling & dealing
    const timer = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16]/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Dynamic 3D Orbital Shuffling Arena */}
      <div className="relative w-80 h-76 flex items-center justify-center perspective-[1200px]">
        {/* Swirling ambient glow vortex */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-teal-500/20 blur-2xl animate-spin duration-1000" />

        {Array.from({ length: count }).map((_, idx) => {
          // Dynamic 3D orbital trajectory
          const angle = ((idx + shuffleStep * 1.6) % count) * (360 / count);
          const rad = (angle * Math.PI) / 180;
          const xOffset = Math.sin(rad) * 95;
          const yOffset = Math.cos(rad) * 45;
          const rotateZ = (idx % 2 === 0 ? 1 : -1) * (15 + (shuffleStep % 4) * 10);
          const rotateY = Math.sin(rad) * 25;
          const scale = 0.92 + ((idx + shuffleStep) % count) * 0.08;

          return (
            <div
              key={idx}
              className="absolute w-28 h-40 rounded-2xl border-2 border-amber-300/90 bg-gradient-to-br from-[#fef9c3] via-[#fef08a] to-[#f59e0b] shadow-[0_20px_45px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out flex flex-col items-center justify-between p-3 select-none will-change-transform"
              style={{
                transform: `translate3d(${xOffset}px, ${yOffset}px, 0) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex: ((idx + shuffleStep) % count) + 10,
              }}
            >
              {/* Top Label */}
              <div className="w-full flex justify-between items-center text-[9px] font-black font-mono text-amber-950 uppercase tracking-widest">
                <span>CHIT #{idx + 1}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              </div>

              {/* Center Wax-Seal Stamp */}
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 border-2 border-yellow-200 shadow-xl flex items-center justify-center transform group-hover:scale-105">
                <span className="text-2xl filter drop-shadow">📜</span>
              </div>

              {/* Bottom Tag */}
              <div className="w-full text-center">
                <span className="text-[9px] font-extrabold text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Secret Role
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shuffling Announcement */}
      <div className="mt-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 text-sm font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
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
            className="text-[11px] font-bold text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700/80 hover:border-amber-400/60 shadow-md"
          >
            <span>Skip Shuffling</span>
            <FastForward className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
