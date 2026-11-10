import React, { useEffect, useState, useRef } from 'react';
import type { Player } from '../types/game';
import { Trophy, Crown, RotateCcw, Share2, Sparkles, X, Check, Coins } from 'lucide-react';
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

interface GoldCoin {
  x: number;
  y: number;
  vy: number;
  vx: number;
  radius: number;
  angle: number;
  vAngle: number;
  symbol: string;
  shineOffset: number;
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sort descending by score
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Arcade Gold Coin Rain Shower
  const triggerArcadeCoinRain = () => {
    sound.playCoinShower();
    sound.playRoyalFanfare();

    // Golden confetti shower downwards
    const duration = 2600;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 8,
        angle: 270,
        spread: 140,
        origin: { x: Math.random(), y: -0.05 },
        colors: ['#ffd700', '#ffae00', '#fef08a', '#ffea00', '#ffffff'],
        startVelocity: 18,
        gravity: 0.9,
        ticks: 250,
        scalar: 1.25,
      });
    }, 90);
  };

  // Canvas Physics-Based 3D Rotating Gold Coin Rain
  useEffect(() => {
    if (!isOpen) return;

    triggerArcadeCoinRain();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 650);

    const symbols = ['👑', '₹', '🪙', '★', '1000'];
    const coinCount = 38;
    const coins: GoldCoin[] = Array.from({ length: coinCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      vy: 2.2 + Math.random() * 3.5,
      vx: (Math.random() - 0.5) * 1.5,
      radius: 12 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      vAngle: 0.04 + Math.random() * 0.08,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      shineOffset: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      coins.forEach((coin) => {
        coin.y += coin.vy;
        coin.x += coin.vx;
        coin.angle += coin.vAngle;

        // Reset to top when coin falls past bottom
        if (coin.y > height + 30) {
          coin.y = -30 - Math.random() * 80;
          coin.x = Math.random() * width;
          coin.vy = 2.2 + Math.random() * 3.5;
        }

        const scaleX = Math.cos(coin.angle);
        const radiusX = Math.abs(coin.radius * scaleX);
        const radiusY = coin.radius;

        if (radiusX > 1) {
          ctx.save();
          ctx.translate(coin.x, coin.y);

          // Outer Metallic Gold Rim
          const gradient = ctx.createLinearGradient(-radiusX, -radiusY, radiusX, radiusY);
          gradient.addColorStop(0, '#fff5a0');
          gradient.addColorStop(0.3, '#ffd700');
          gradient.addColorStop(0.7, '#cc8800');
          gradient.addColorStop(1, '#ffdf00');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#8a5a00';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner Coin Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, radiusX * 0.75, radiusY * 0.75, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#fff8b0';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Royal Coin Symbol
          if (radiusX > coin.radius * 0.45) {
            ctx.fillStyle = '#6a4300';
            ctx.font = `bold ${Math.floor(coin.radius * 0.85)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(coin.symbol, 0, 1);
          }

          // Shimmer Highlight
          const shineGrad = ctx.createLinearGradient(-radiusX, 0, radiusX, 0);
          shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
          shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
          shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = shineGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
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
    const text = `🪙 CHITCHOR ARCADE GOLD COIN CHAMPION! 👑\n👑 1st Rank: ${first?.name || 'Player'} (${first?.score || 0} Pts)\n\nFinal Standings after ${roundCount} Rounds:\n${leaderText}\n\nPlay free online at: https://chitchor.fixeehub.com`;

    if (navigator.share) {
      navigator.share({ title: 'ChitChor Royal Champion', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/92 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#18233f] via-[#0f172a] to-[#090d16] border-2 border-amber-400/80 p-5 sm:p-7 shadow-[0_0_75px_rgba(255,215,0,0.4)] space-y-5 my-auto text-center overflow-hidden">
        {/* Physics-Based Arcade Gold Coin Rain Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
        />

        {/* Floating Coin Ambient Accents */}
        <div className="absolute top-2 left-4 text-2xl animate-bounce opacity-90 select-none z-10">🪙</div>
        <div className="absolute top-2 right-12 text-2xl animate-bounce opacity-90 select-none z-10">👑</div>

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Arcade Gold Coin Celebration Header */}
        <div className="space-y-1.5 pt-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-amber-500/25 border border-amber-400/60 text-amber-300 text-xs font-black shadow-[0_0_20px_rgba(255,215,0,0.35)]">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>ARCADE GOLD COIN CELEBRATION • शाही विजयोत्सव</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500 tracking-wide drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]">
            Crowning the Grand Champion!
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Final tournament standings after {roundCount} {roundCount === 1 ? 'round' : 'rounds'}
          </p>
        </div>

        {/* ================= GOLDEN VICTORY PODIUM ================= */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2 px-2 relative z-10">
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
                <Crown className="w-7 h-7 text-amber-300 fill-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]" />
                <span className="text-5xl filter drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                  {first.avatar}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-full flex items-center gap-1">
                <span>{first.name}</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-300 mb-1.5">
                {first.score} pts
              </span>
              <div className="w-full h-34 sm:h-38 rounded-t-2xl bg-gradient-to-b from-amber-400/50 via-yellow-500/30 to-amber-950/70 border-t-2 border-x-2 border-amber-300 flex flex-col items-center justify-start pt-3 shadow-[0_0_35px_rgba(255,215,0,0.5)]">
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

        {/* Interactive Coin Shower Action Pill */}
        <div className="flex justify-center pt-1 relative z-10">
          <button
            type="button"
            onClick={triggerArcadeCoinRain}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 hover:from-yellow-500/40 hover:to-amber-500/40 border border-amber-400/70 text-amber-300 text-xs font-black shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Rain Arcade Gold Coins 🪙 (सिक्कों की बारिश!)</span>
          </button>
        </div>

        {/* Full Leaderboard Standings Table */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-left relative z-10">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 flex justify-between">
            <span>Rank & Courtier</span>
            <span>Accumulated Points</span>
          </div>

          {sorted.map((player, rank) => {
            const rankLabel =
              rank === 0
                ? '🥇 1st Rank'
                : rank === 1
                ? '🥈 2nd Rank'
                : rank === 2
                ? '🥉 3rd Rank'
                : rank === 3
                ? '🎖️ 4th Rank'
                : '🎖️ 5th Rank';

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all backdrop-blur-md ${
                  rank === 0
                    ? 'bg-amber-500/25 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                    : rank === 1
                    ? 'bg-slate-800/80 border-slate-600'
                    : rank === 2
                    ? 'bg-amber-950/40 border-amber-800/60'
                    : 'bg-[#090d16]/90 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-0.5 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      rank === 0
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : rank === 1
                        ? 'bg-slate-300 text-slate-900'
                        : rank === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {rankLabel}
                  </div>
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {player.isBot && (
                        <span className="text-[9px] bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                          BOT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="font-mono font-black text-sm sm:text-base text-amber-400">
                  {player.score.toLocaleString()} Pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: New Tournament & Share */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 relative z-10">
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
