import React, { useState } from 'react';
import type { RoleType } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Crown, Sparkles, ShieldCheck, ShieldAlert, Footprints, Eye, EyeOff, Lock, Sparkle } from 'lucide-react';
import { sound } from '../utils/audio';

interface PaperChit3DProps {
  role?: RoleType;
  playerName?: string;
  isHost?: boolean;
  disabled?: boolean;
  onRevealToggled?: (isUnfolded: boolean) => void;
}

export const PaperChit3D: React.FC<PaperChit3DProps> = ({
  role = 'sipahi',
  playerName = 'Player',
  disabled = false,
  onRevealToggled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const meta = ROLES_METADATA[role];

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    sound.playPaperRustle();
    if (next && (role === 'raja' || role === 'rani')) {
      setTimeout(() => sound.playRoyalFanfare(), 250);
    }
    onRevealToggled?.(next);
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'raja':
        return <Crown className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />;
      case 'rani':
        return <Sparkles className="w-16 h-16 text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />;
      case 'katual':
        return <ShieldCheck className="w-16 h-16 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />;
      case 'sipahi':
        return <ShieldAlert className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />;
      case 'chor':
        return <Footprints className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />;
      default:
        return <Crown className="w-16 h-16 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 w-full max-w-sm mx-auto">
      {/* 3D Perspective Container */}
      <div
        onClick={handleToggle}
        className={`relative w-72 h-96 cursor-pointer select-none perspective-1000 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ perspective: '1200px' }}
      >
        <div
          className={`w-full h-full relative transition-transform duration-700 preserve-3d ease-out ${
            isOpen ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT: FOLDED ROYAL CHIT ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-4 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#1c1813] via-[#241f17] to-[#120f0c] border-2 border-amber-500/40 royal-glow overflow-hidden">
            {/* Parchment Paper Texture Creases */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* Paper Fold Crease Lines */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-700/60 to-transparent transform -translate-y-1/2" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-amber-700/60 to-transparent transform -translate-x-1/2" />
            <div className="absolute inset-0 border border-amber-500/20 rounded-xl m-2 pointer-events-none" />

            {/* Top Royal Emblem */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] tracking-widest text-amber-500/70 font-semibold uppercase">
                राजकीय चिट्ठी • Royal Chit
              </span>
              <Lock className="w-4 h-4 text-amber-400/80" />
            </div>

            {/* Middle Folded Wax Seal */}
            <div className="flex flex-col items-center justify-center z-10 my-auto">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 flex items-center justify-center shadow-xl border-2 border-amber-300/60 ring-4 ring-red-900/40">
                {/* Decorative Seal Ribbons */}
                <div className="absolute -bottom-4 w-6 h-8 bg-gradient-to-b from-red-800 to-red-950 transform rotate-12 -z-10 rounded-sm" />
                <div className="absolute -bottom-4 w-6 h-8 bg-gradient-to-b from-red-800 to-red-950 transform -rotate-12 -z-10 rounded-sm" />
                <div className="text-center">
                  <div className="text-amber-200 font-bold text-xs tracking-wider">CHITCHOR</div>
                  <div className="text-amber-100 font-serif font-black text-lg">राजा-रानी</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs font-medium text-amber-300/90 tracking-wide block uppercase">
                  Folded Secret Paper
                </span>
                <span className="text-amber-400 font-semibold text-sm flex items-center justify-center gap-1 mt-1">
                  <Eye className="w-4 h-4 animate-bounce" /> Tap to Unfold & Secret Peek
                </span>
              </div>
            </div>

            {/* Bottom Confidential Notice */}
            <div className="text-center z-10 bg-black/40 py-1.5 px-3 rounded-lg border border-amber-500/20 backdrop-blur-sm">
              <p className="text-[11px] text-amber-200/70">
                Keep screen tilted away from other players!
              </p>
            </div>
          </div>

          {/* ================= BACK: UNFOLDED SECRET ROYAL ROLE ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-5 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#181a20] via-[#12141a] to-[#0a0d14] border-2 ${meta.borderGlow} overflow-hidden`}
          >
            {/* Ornate Inner Borders */}
            <div className="absolute inset-0 border border-amber-500/20 rounded-xl m-2 pointer-events-none" />
            <div className="absolute top-2 left-2 text-amber-500/30 text-xs">⚜</div>
            <div className="absolute top-2 right-2 text-amber-500/30 text-xs">⚜</div>
            <div className="absolute bottom-2 left-2 text-amber-500/30 text-xs">⚜</div>
            <div className="absolute bottom-2 right-2 text-amber-500/30 text-xs">⚜</div>

            {/* Header info */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                  Secret Identity
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {meta.points} Pts
              </span>
            </div>

            {/* Role Emblem & Character Display */}
            <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-2">
              <div className={`p-4 rounded-2xl ${meta.badgeBg} border border-amber-500/30`}>
                {getRoleIcon()}
              </div>

              <div>
                <h3 className={`text-2xl font-black tracking-wider uppercase font-serif ${meta.color}`}>
                  {meta.nameEnglish}
                </h3>
                <h4 className="text-sm font-semibold text-amber-200/80">
                  {meta.nameHindi}
                </h4>
              </div>

              <div className="bg-black/60 rounded-xl p-2.5 border border-amber-500/20 w-full">
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {meta.duty}
                </p>
              </div>
            </div>

            {/* Hide button trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              type="button"
              className="z-10 w-full py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Tap to Fold & Hide Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helper label below card */}
      <div className="mt-3 text-center">
        <span className="text-xs text-zinc-400">
          Playing as: <strong className="text-amber-300">{playerName}</strong>
        </span>
      </div>
    </div>
  );
};
