import React, { useEffect, useState } from 'react';
import { Dices, Sparkles } from 'lucide-react';
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

    const interval = setInterval(() => {
      setShuffleStep((prev) => prev + 1);
    }, 280);

    const timer = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16]/90 backdrop-blur-md p-4">
      <div className="relative w-80 h-72 flex items-center justify-center">
        {Array.from({ length: count }).map((_, idx) => {
          const angle = ((idx + shuffleStep * 2) % count) * (360 / count) - 180;
          const rotateOffset = (idx % 2 === 0 ? 1 : -1) * (15 + (shuffleStep % 3) * 10);
          const xOffset = Math.sin((angle * Math.PI) / 180) * 45;
          const yOffset = Math.cos((angle * Math.PI) / 180) * 35;

          return (
            <div
              key={idx}
              className="absolute w-28 h-36 rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-2xl transition-all duration-300 flex flex-col items-center justify-center p-2 text-zinc-900"
              style={{
                transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotateOffset}deg) scale(${
                  1 + (idx === shuffleStep % count ? 0.08 : 0)
                })`,
                zIndex: (idx + shuffleStep) % count,
              }}
            >
              {/* Gold Foil Seal Mini */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-yellow-200 flex items-center justify-center shadow-md mb-2">
                <span className="text-[8px] font-black text-amber-950">चिट</span>
              </div>
              <div className="text-[10px] text-zinc-800 font-bold font-mono tracking-wider">
                CHIT #{idx + 1}
              </div>
              <div className="h-0.5 w-10 bg-zinc-300 my-1.5" />
              <div className="text-[8px] text-zinc-500 font-semibold">SECRET</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold animate-pulse shadow">
          <Dices className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Shuffling Crisp Royal Chits...</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Roles are being randomly assigned across the court
        </p>
      </div>
    </div>
  );
};
