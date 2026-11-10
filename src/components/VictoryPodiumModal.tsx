import React, { useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Trophy, Crown, RotateCcw, Share2, Sparkles, X, Award, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface VictoryPodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  roundCount: number;
  totalRounds?: number;
  onPlayAgain: () => void;
}

export const VictoryPodiumModal: React.FC<VictoryPodiumModalProps> = ({
  isOpen,
  onClose,
  players,
  roundCount,
  totalRounds = 3,
  onPlayAgain,
}) => {
  const [copied, setCopied] = useState(false);
  const [fireworkCount, setFireworkCount] = useState(0);

  // Sort descending by score
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Multi-burst Diwali Fireworks Show
  const triggerDiwaliFireworks = () => {
    sound.playFireworksCrackle();
    setFireworkCount((prev) => prev + 1);

    // Burst 1: High-rise fountain
    confetti({
      particleCount: 90,
      angle: 90,
      spread: 60,
      origin: { x: 0.5, y: 0.85 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#ec4899'],
      startVelocity: 45,
    });

    // Burst 2: Left Anaar / Sparkler
    setTimeout(() => {
      sound.playFireworksCrackle();
      confetti({
        particleCount: 75,
        angle: 60,
        spread: 75,
        origin: { x: 0.15, y: 0.5 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8'],
        startVelocity: 35,
      });
    }, 250);

    // Burst 3: Right Anaar / Sparkler
    setTimeout(() => {
      sound.playFireworksCrackle();
      confetti({
        particleCount: 75,
        angle: 120,
        spread: 75,
        origin: { x: 0.85, y: 0.5 },
        colors: ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24'],
        startVelocity: 35,
      });
    }, 500);

    // Burst 4: Center Grand Crackle
    setTimeout(() => {
      sound.playRoyalFanfare();
      sound.playFireworksCrackle();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#ffd700', '#f59e0b', '#10b981', '#06b6d4', '#ffffff'],
      });
    }, 800);
  };

  useEffect(() => {
    if (isOpen) {
      sound.playRoyalFanfare();
      triggerDiwaliFireworks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    sound.playClick();
    const leaderText = sorted
      .map(
        (p, i) =>
          `${i === 0 ? '👑 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i + 1}`} ${p.name}: ${p.score} Pts`
      )
      .join('\n');
    const text = `🎆 CHITCHOR DIWALI TOURNAMENT CHAMPION! 🪔\n👑 1st Rank: ${first?.name || 'Player'} (${first?.score || 0} Pts)\n\nFinal Standings after ${roundCount} Rounds:\n${leaderText}\n\nPlay free online at: https://chitchor.fixeehub.com`;

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
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1a233b] via-[#0f172a] to-[#090d16] border-2 border-amber-400/80 p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.35)] space-y-5 my-auto text-center overflow-hidden">
        {/* Festive Diya ambient glows */}
        <div className="absolute top-2 left-4 text-2xl animate-pulse opacity-80 select-none">🪔</div>
        <div className="absolute top-2 right-12 text-2xl animate-pulse opacity-80 select-none">🎇</div>

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

        {/* Festive Diwali Header */}
        <div className="space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-400/50 text-amber-300 text-xs font-black shadow-inner">
            <span>🪔</span>
            <span>DIWALI FESTIVAL CELEBRATION • शाही विजयोत्सव</span>
            <span>🎇</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 tracking-wide drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            Crowning the Grand Champion!
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Accumulated tournament standings after {roundCount} {roundCount === 1 ? 'round' : 'rounds'}
          </p>
        </div>

        {/* ================= GOLDEN VICTORY PODIUM ================= */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2 px-2">
          {/* 🥈 2nd Place (Silver) */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[105px] animate-in slide-in-from-bottom duration-500 delay-100">
              <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{second.avatar}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                {second.name}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-300 mb-1.5">
                {second.score} pts
              </span>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-slate-300/40 via-slate-500/30 to-slate-800/60 border-t-2 border-x-2 border-slate-300/70 flex flex-col items-center justify-start pt-3 shadow-lg">
                <span className="text-lg font-black text-slate-200">2nd</span>
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                  🥈 Silver
                </span>
              </div>
            </div>
          )}

          {/* 🥇 1st Place (Champion - Center Elevated) */}
          {first && (
            <div className="flex flex-col items-center flex-1 max-w-[125px] -mt-6 animate-in slide-in-from-bottom duration-500">
              <div className="relative mb-1">
                <Crown className="w-7 h-7 text-amber-300 fill-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                <span className="text-5xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  {first.avatar}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-full flex items-center gap-1">
                <span>{first.name}</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-300 mb-1.5">
                {first.score} pts
              </span>
              <div className="w-full h-34 sm:h-38 rounded-t-2xl bg-gradient-to-b from-amber-400/50 via-yellow-500/30 to-amber-950/70 border-t-2 border-x-2 border-amber-300 flex flex-col items-center justify-start pt-3 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Trophy className="w-6 h-6 text-amber-300 fill-amber-400 mb-0.5 animate-pulse" />
                <span className="text-xl font-black text-amber-200">1st</span>
                <span className="text-[10px] text-amber-300 uppercase font-black tracking-widest">
                  👑 Champion
                </span>
              </div>
            </div>
          )}

          {/* 🥉 3rd Place (Bronze) */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[105px] animate-in slide-in-from-bottom duration-500 delay-200">
              <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{third.avatar}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                {third.name}
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-500 mb-1.5">
                {third.score} pts
              </span>
              <div className="w-full h-18 sm:h-20 rounded-t-2xl bg-gradient-to-b from-amber-700/40 via-amber-800/30 to-slate-900/60 border-t-2 border-x-2 border-amber-600/70 flex flex-col items-center justify-start pt-2.5 shadow-lg">
                <span className="text-base font-black text-amber-400">3rd</span>
                <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider">
                  🥉 Bronze
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Diwali Fireworks Action Pill */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={triggerDiwaliFireworks}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 hover:from-orange-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Burst Fireworks 🎇 (पटाखे फोड़ें!)</span>
          </button>
        </div>

        {/* Full Leaderboard Standings Table */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-left">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 flex justify-between">
            <span>Rank & Courtier</span>
            <span>Accumulated Points</span>
          </div>

          {sorted.map((player, rank) => (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                rank === 0
                  ? 'bg-amber-500/20 border-amber-400 shadow-sm'
                  : rank === 1
                  ? 'bg-slate-800/60 border-slate-700'
                  : rank === 2
                  ? 'bg-amber-900/20 border-amber-800/60'
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

        {/* Action Buttons: New Tournament & Share */}
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
