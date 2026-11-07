import React, { useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Trophy, Crown, RotateCcw, Share2, Sparkles, X, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface VictoryPodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  roundCount: number;
  onPlayAgain: () => void;
}

export const VictoryPodiumModal: React.FC<VictoryPodiumModalProps> = ({
  isOpen,
  onClose,
  players,
  roundCount,
  onPlayAgain,
}) => {
  const [copied, setCopied] = useState(false);

  // Sort descending by score
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  useEffect(() => {
    if (isOpen) {
      sound.playRoyalFanfare();
      // Multiple bursts of celebratory confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#10b981', '#34d399', '#ffffff'],
        });
      }, 400);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    sound.playClick();
    const leaderText = sorted.map((p, i) => `${i === 0 ? '👑 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i + 1}`} ${p.name}: ${p.score} Pts`).join('\n');
    const text = `🏆 CHITCHOR TOURNAMENT WINNER!\n👑 Champion: ${first?.name || 'Player'} (${first?.score || 0} Pts)\n\nFinal Standings after ${roundCount} Rounds:\n${leaderText}\n\nPlay free online at: https://chitchor.fixeehub.com`;

    if (navigator.share) {
      navigator.share({ title: 'ChitChor Royal Champion', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#131b2e] via-[#0f172a] to-[#090d16] border-2 border-amber-400/60 p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6 my-auto text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Grand Royal Tournament Finale</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-wide">
            Crowning the Champion!
          </h2>
          <p className="text-xs text-slate-400">
            Cumulative points across {roundCount} {roundCount === 1 ? 'round' : 'rounds'} played
          </p>
        </div>

        {/* ================= GOLDEN VICTORY PODIUM ================= */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2 px-2">
          {/* 🥈 2nd Place (Silver) */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[100px] animate-in slide-in-from-bottom duration-500 delay-100">
              <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{second.avatar}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                {second.name}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-300 mb-1.5">
                {second.score} pts
              </span>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-slate-400/40 via-slate-600/30 to-slate-800/50 border-t-2 border-x-2 border-slate-400/60 flex flex-col items-center justify-start pt-3 shadow-lg">
                <span className="text-lg font-black text-slate-200">2nd</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Silver</span>
              </div>
            </div>
          )}

          {/* 🥇 1st Place (Winner - Center Elevated) */}
          {first && (
            <div className="flex flex-col items-center flex-1 max-w-[120px] -mt-6 animate-in slide-in-from-bottom duration-500">
              <div className="relative mb-1">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  {first.avatar}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-full flex items-center gap-1">
                <span>{first.name}</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-400 mb-1.5">
                {first.score} pts
              </span>
              <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-b from-amber-400/40 via-yellow-600/30 to-amber-950/60 border-t-2 border-x-2 border-amber-300/80 flex flex-col items-center justify-start pt-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <Trophy className="w-6 h-6 text-amber-300 fill-amber-400 mb-0.5" />
                <span className="text-xl font-black text-amber-200">1st</span>
                <span className="text-[10px] text-amber-300 uppercase font-extrabold tracking-widest">
                  Champion
                </span>
              </div>
            </div>
          )}

          {/* 🥉 3rd Place (Bronze) */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[100px] animate-in slide-in-from-bottom duration-500 delay-200">
              <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{third.avatar}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                {third.name}
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-500 mb-1.5">
                {third.score} pts
              </span>
              <div className="w-full h-18 sm:h-20 rounded-t-2xl bg-gradient-to-b from-amber-700/40 via-amber-800/30 to-slate-900/50 border-t-2 border-x-2 border-amber-600/60 flex flex-col items-center justify-start pt-2.5 shadow-lg">
                <span className="text-base font-black text-amber-400">3rd</span>
                <span className="text-[9px] text-amber-500 uppercase font-bold tracking-wider">Bronze</span>
              </div>
            </div>
          )}
        </div>

        {/* Full Leaderboard Standings Table */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-left">
          {sorted.map((player, rank) => (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                rank === 0
                  ? 'bg-amber-500/15 border-amber-400/60 shadow-sm'
                  : 'bg-[#090d16]/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    rank === 0
                      ? 'bg-amber-500 text-amber-950 font-black'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-900'
                      : rank === 2
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{rank + 1}
                </div>
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>{player.name}</span>
                    {player.isBot && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
                        BOT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="font-mono font-black text-sm text-amber-400">
                {player.score.toLocaleString()} Pts
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again 🔄</span>
          </button>

          <button
            onClick={handleShare}
            className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#131b2e]/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Copied!' : 'Share Victory 🔗'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

