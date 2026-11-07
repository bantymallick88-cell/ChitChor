import React, { useEffect, useState } from 'react';
import type { Player, RoleType, GameMode } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Crown, Sparkles, ShieldAlert, ShieldCheck, Footprints, EyeOff, ArrowRight, Lock, Sparkle } from 'lucide-react';
import { sound } from '../utils/audio';

interface RoleSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  role: RoleType;
  gameMode: GameMode;
  chitIndex: number;
  isLastHuman: boolean;
  nextPlayerName?: string;
  onProceed: () => void;
}

export const RoleSecretModal: React.FC<RoleSecretModalProps> = ({
  isOpen,
  onClose,
  player,
  role,
  gameMode,
  chitIndex,
  isLastHuman,
  nextPlayerName,
  onProceed,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const meta = ROLES_METADATA[role];

  useEffect(() => {
    if (isOpen) {
      sound.playUnfold();
      sound.vibrate([20, 40, 60]);
      // Trigger 3D flip animation smoothly after mounting
      const timer = setTimeout(() => {
        setIsFlipped(true);
        if (role === 'raja' || role === 'rani') {
          sound.playRoyalFanfare();
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const getRoleIcon = () => {
    switch (role) {
      case 'raja':
        return <Crown className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse" />;
      case 'rani':
        return <Sparkles className="w-16 h-16 text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]" />;
      case 'katual':
        return <ShieldCheck className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />;
      case 'sipahi':
        return <ShieldAlert className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" />;
      case 'chor':
        return <Footprints className="w-16 h-16 text-rose-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />;
      default:
        return <Crown className="w-16 h-16 text-amber-400" />;
    }
  };

  const getHindiDuty = () => {
    switch (role) {
      case 'raja':
        return 'आप राजा हैं! +1,000 अंक पक्के। सिपाही को चोर ढूंढने का शाही हुक्म दें।';
      case 'rani':
        return gameMode === 'classic4'
          ? 'आप रानी हैं! +500 अंक। अपनी पहचान सभी से गुप्त रखें।'
          : 'आप रानी हैं! +700 अंक। दरबार में अपनी गरिमा बनाए रखें।';
      case 'katual':
        return 'आप कोतवाल (कमांडेंट) हैं! +500 अंक पक्के।';
      case 'sipahi':
        return 'आप सिपाhi हैं! चोर का सही पता लगाएं (+100 अंक)। गलत अनुमान पर 0 अंक!';
      case 'chor':
        return 'आप चोर हैं! सिपाही से छुपें। अगर सिपाही का अनुमान गलत हुआ, तो आप +100 अंक चुरा लेंगे!';
      default:
        return meta.duty;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm my-auto">
        {/* 3D Perspective Card Container */}
        <div
          className="relative w-full h-[32rem] perspective-1000 select-none"
          style={{ perspective: '1200px' }}
        >
          <div
            className={`w-full h-full relative transition-transform duration-700 preserve-3d ease-out ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* ================= FRONT: FOLDED CHIT WITH WAX SEAL ================= */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#ffffff] via-[#f7f4ee] to-[#ece5d8] text-zinc-900 border-2 border-amber-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Paper Fold Creases */}
              <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent transform -translate-y-1/2" />
              <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-zinc-400/50 to-transparent transform -translate-x-1/2" />
              <div className="absolute inset-2 border border-zinc-300/80 rounded-2xl pointer-events-none" />

              {/* Slip Header */}
              <div className="flex items-center justify-between z-10">
                <span className="text-[11px] tracking-wider text-amber-900 font-bold uppercase font-serif">
                  शाही चिट्ठी • Royal Slip #{chitIndex + 1}
                </span>
                <Lock className="w-4 h-4 text-amber-600" />
              </div>

              {/* Gold Wax Seal */}
              <div className="flex flex-col items-center justify-center z-10 my-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-xl border-2 border-yellow-200 ring-4 ring-amber-500/30 animate-pulse">
                  <div className="text-center text-amber-950 font-serif font-black text-sm tracking-wider">
                    CHITCHOR
                    <div className="text-[11px] font-bold text-amber-900">चिट्ठी खुल रही है...</div>
                  </div>
                </div>
                <div className="mt-4 text-xs font-bold text-zinc-600 tracking-wide uppercase">
                  Unfolding Your Secret Role...
                </div>
              </div>

              <div className="text-center z-10 bg-zinc-200/80 py-1.5 px-3 rounded-xl border border-zinc-300">
                <p className="text-[11px] font-medium text-zinc-600">
                  🔒 Private role — do not show to other players!
                </p>
              </div>
            </div>

            {/* ================= BACK: UNFOLDED VIBRANT ROYAL ROLE CARD ================= */}
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-b from-[#111827] via-[#0d1322] to-[#090d16] border-2 ${meta.borderGlow} shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden`}
            >
              {/* Inner Decorative Frame */}
              <div className="absolute inset-2 border border-white/10 rounded-2xl pointer-events-none" />

              {/* Top Bar: Chit Number & Guaranteed Points */}
              <div className="flex items-center justify-between z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-bold">
                  <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chit #{chitIndex + 1} • {player.name}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${meta.gradientBg} text-white shadow-lg`}
                >
                  +{meta.points} Pts
                </span>
              </div>

              {/* Center Role Display */}
              <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-3">
                <div className={`p-4 rounded-2xl ${meta.badgeBg} border border-white/15 shadow-xl`}>
                  {getRoleIcon()}
                </div>

                <div>
                  <h3 className={`text-3xl sm:text-4xl font-black tracking-wider uppercase font-serif ${meta.color}`}>
                    {meta.nameEnglish}
                  </h3>
                  <h4 className="text-base font-bold text-amber-300/90 mt-0.5">
                    {meta.nameHindi}
                  </h4>
                </div>

                {/* Duty Instruction Box (Bilingual & Non-Technical) */}
                <div className="bg-[#090d16]/90 rounded-2xl p-3.5 border border-slate-700/60 w-full text-left space-y-1">
                  <p className="text-xs sm:text-[13px] text-white font-medium leading-relaxed">
                    {getHindiDuty()}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {meta.duty}
                  </p>
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="space-y-2 z-10 pt-1">
                {/* Primary Proceed CTA */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onProceed();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <span>
                    {isLastHuman
                      ? 'Ready! Summon Raja & Sipahi 👑'
                      : `Pass to ${nextPlayerName || 'Next Player'} 📱`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary: Fold & Close */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hide & Keep Secret 🔒</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

