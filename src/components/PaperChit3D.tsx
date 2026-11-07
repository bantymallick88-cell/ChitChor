import React, { useState } from 'react';
import type { RoleType } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Crown, Sparkles, ShieldCheck, ShieldAlert, Footprints, Eye, EyeOff, Lock, Sparkle } from 'lucide-react';
import { sound } from '../utils/audio';

interface PaperChit3DProps {
  role?: RoleType;
  playerName?: string;
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
        return <Crown className="w-16 h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse" />;
      case 'rani':
        return <Sparkles className="w-16 h-16 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />;
      case 'katual':
        return <ShieldCheck className="w-16 h-16 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />;
      case 'sipahi':
        return <ShieldAlert className="w-16 h-16 text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />;
      case 'chor':
        return <Footprints className="w-16 h-16 text-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />;
      default:
        return <Crown className="w-16 h-16 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-sm mx-auto">
      {/* 3D Perspective Card Container */}
      <div
        onClick={handleToggle}
        className={`relative w-72 h-[26rem] cursor-pointer select-none perspective-1000 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ perspective: '1200px' }}
      >
        <div
          className={`w-full h-full relative transition-transform duration-700 preserve-3d ease-out ${
            isOpen ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT: CRISP WHITE FOLDED ROYAL CHIT ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-5 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#ffffff] via-[#faf8f5] to-[#ece7dc] text-zinc-900 border-2 border-amber-300/60 shadow-[0_15px_35px_rgba(0,0,0,0.45)] overflow-hidden">
            {/* Paper Fold Creases */}
            <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent transform -translate-y-1/2" />
            <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-zinc-400/50 to-transparent transform -translate-x-1/2" />
            
            {/* Delicate Paper Border */}
            <div className="absolute inset-2 border border-zinc-300/80 rounded-xl pointer-events-none" />

            {/* Top Slip Heading */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[11px] tracking-wider text-zinc-500 font-bold uppercase font-serif">
                शाही चिट्ठी • Royal Slip
              </span>
              <Lock className="w-4 h-4 text-amber-600" />
            </div>

            {/* Center Gold Foil Wax Seal */}
            <div className="flex flex-col items-center justify-center z-10 my-auto">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-xl border-2 border-yellow-100 ring-4 ring-amber-500/30 transform hover:rotate-6 transition-transform">
                {/* Gold Seal Ribbons */}
                <div className="absolute -bottom-4 w-5 h-8 bg-gradient-to-b from-amber-600 to-amber-800 transform rotate-12 -z-10 rounded-sm shadow-md" />
                <div className="absolute -bottom-4 w-5 h-8 bg-gradient-to-b from-amber-600 to-amber-800 transform -rotate-12 -z-10 rounded-sm shadow-md" />
                
                <div className="text-center">
                  <div className="text-amber-950 font-serif font-black text-sm tracking-wider">CHITCHOR</div>
                  <div className="text-amber-900 font-bold text-xs">राजा-रानी</div>
                </div>
              </div>

              <div className="mt-5 text-center space-y-1">
                <span className="text-xs font-bold text-zinc-700 tracking-wide block uppercase">
                  Folded Secret Note
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md animate-pulse">
                  <Eye className="w-3.5 h-3.5" /> Tap to Unfold
                </span>
              </div>
            </div>

            {/* Bottom Confidential Badge */}
            <div className="text-center z-10 bg-zinc-200/80 py-1.5 px-3 rounded-lg border border-zinc-300">
              <p className="text-[11px] font-medium text-zinc-600">
                🔒 Private role — do not show others!
              </p>
            </div>
          </div>

          {/* ================= BACK: UNFOLDED VIBRANT ROYAL ROLE CARD ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-5 flex flex-col justify-between shadow-2xl bg-gradient-to-b from-[#111624] via-[#0d121f] to-[#070a12] border-2 ${meta.borderGlow} overflow-hidden`}
          >
            {/* Subtle Inner Accent Frame */}
            <div className="absolute inset-2 border border-white/10 rounded-xl pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Secret Duty
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${meta.gradientBg} text-white shadow-md`}>
                {meta.points} Pts
              </span>
            </div>

            {/* Role Icon & Vibrant Character Presentation */}
            <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-3">
              <div className={`p-4 rounded-2xl ${meta.badgeBg} border border-white/10 shadow-lg`}>
                {getRoleIcon()}
              </div>

              <div>
                <h3 className={`text-3xl font-black tracking-wider uppercase font-serif ${meta.color}`}>
                  {meta.nameEnglish}
                </h3>
                <h4 className="text-sm font-bold text-zinc-300 mt-0.5">
                  {meta.nameHindi}
                </h4>
              </div>

              <div className="bg-black/50 rounded-xl p-3 border border-white/10 w-full">
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
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
              className="z-10 w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-colors shadow"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Fold & Hide Secret Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Player name label below card */}
      <div className="mt-3 text-center">
        <span className="text-xs text-zinc-400">
          Noble Courtier: <strong className="text-emerald-400 font-bold">{playerName}</strong>
        </span>
      </div>
    </div>
  );
};
