import React, { useEffect, useState } from 'react';
import { Sparkles, Dices } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-80 h-72 flex items-center justify-center">
        {Array.from({ length: count }).map((_, idx) => {
          const angle = ((idx + shuffleStep * 2) % count) * (360 / count) - 180;
          const rotateOffset = (idx % 2 === 0 ? 1 : -1) * (15 + (shuffleStep % 3) * 10);
          const xOffset = Math.sin((angle * Math.PI) / 180) * 45;
          const yOffset = Math.cos((angle * Math.PI) / 180) * 35;

          return (
            <div
              key={idx}
              className="absolute w-28 h-36 rounded-xl border-2 border-amber-400/60 bg-gradient-to-br from-[#241f17] to-[#120f0c] shadow-2xl transition-all duration-300 flex flex-col items-center justify-center p-2"
              style={{
                transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotateOffset}deg) scale(${
                  1 + (idx === shuffleStep % count ? 0.08 : 0)
                })`,
                zIndex: (idx + shuffleStep) % count,
              }}
            >
              {/* Wax Seal Mini */}
              <div className="w-8 h-8 rounded-full bg-red-700 border border-amber-300 flex items-center justify-center shadow-md mb-2">
                <span className="text-[8px] font-bold text-amber-200">चिट</span>
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono tracking-wider">
                CHIT #{idx + 1}
              </div>
              <div className="h-0.5 w-10 bg-amber-500/30 my-1.5" />
              <div className="text-[8px] text-zinc-400">SECRET</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold animate-pulse">
          <Dices className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Shuffling Royal Chits...</span>
        </div>
        <p className="text-xs text-zinc-400">
          Fate is being sealed in the royal court
        </p>
      </div>
    </div>
  );
};
