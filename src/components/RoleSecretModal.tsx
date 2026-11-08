import React from 'react';
import type { Player, RoleType, GameMode } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Crown, Sparkles, ShieldAlert, ShieldCheck, Footprints, Check, Sparkle } from 'lucide-react';
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
  player,
  role,
  gameMode,
  chitIndex,
  isLastHuman,
  nextPlayerName,
  onProceed,
}) => {
  if (!isOpen) return null;

  // Bulletproof fallback to ensure zero undefined rendering exceptions
  const validRole: RoleType = (role && ROLES_METADATA[role]) ? role : 'raja';
  const meta = ROLES_METADATA[validRole];

  const getRoleIcon = () => {
    switch (validRole) {
      case 'raja':
        return <Crown className="w-16 h-16 text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse" />;
      case 'rani':
        return <Sparkles className="w-16 h-16 text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.7)]" />;
      case 'katual':
        return <ShieldCheck className="w-16 h-16 text-purple-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]" />;
      case 'sipahi':
        return <ShieldAlert className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.7)]" />;
      case 'chor':
        return <Footprints className="w-16 h-16 text-rose-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]" />;
      default:
        return <Crown className="w-16 h-16 text-amber-400" />;
    }
  };

  const getHindiDuty = () => {
    switch (validRole) {
      case 'raja':
        return 'आप राजा हैं! +1,000 अंक पक्के। पुलिस को चोर पकड़ने का शाही हुक्म दें।';
      case 'rani':
        return gameMode === 'classic4'
          ? 'आप रानी हैं! +500 अंक। अपनी शाही पहचान सभी से गुप्त रखें।'
          : 'आप रानी हैं! +700 अंक। दरबार में अपनी गरिमा बनाए रखें।';
      case 'katual':
        return 'आप कोतवाल (कमांडेंट) हैं! +500 अंक पक्के। नगर की रक्षा करें।';
      case 'sipahi':
        return 'आप पुलिस हैं! चोर का सही पता लगाएं (+100 अंक)। गलत अनुमान पर 0 अंक!';
      case 'chor':
        return 'आप चोर हैं! पुलिस से छुपें। अगर पुलिस चूकी, तो आप +100 अंक जीतेंगे!';
      default:
        return meta.duty;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Clean High-Contrast Glassmorphic Role Reveal Modal */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0f172a]/95 border-2 border-amber-500/50 shadow-2xl p-6 sm:p-8 text-center z-50 my-auto space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Confidential Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Sparkle className="w-3.5 h-3.5 text-amber-400" />
            <span>Chit #{chitIndex + 1} • {player.name}</span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${meta.gradientBg} text-white shadow-md`}>
            +{meta.points} Pts
          </span>
        </div>

        {/* Center Role Badge & Crest */}
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <div className={`p-5 rounded-3xl ${meta.badgeBg} border-2 border-white/20 shadow-2xl`}>
            {getRoleIcon()}
          </div>

          <div>
            <h3 className={`text-3xl sm:text-4xl font-serif font-black tracking-wider uppercase ${meta.color}`}>
              {meta.nameEnglish}
            </h3>
            <h4 className="text-base font-bold text-amber-300/90 mt-0.5">
              {meta.nameHindi}
            </h4>
          </div>

          {/* Bilingual Secret Duty Description */}
          <div className="w-full bg-[#090d16] rounded-2xl p-4 border border-slate-700/70 text-left space-y-1.5 shadow-inner">
            <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed">
              {getHindiDuty()}
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              {meta.duty}
            </p>
          </div>
        </div>

        {/* Big High-Contrast Action Button: Got it! Keep Secret 🤫 */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onProceed();
            }}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {isLastHuman
                ? 'Got it! Keep Secret 🤫'
                : `Got it! Pass to ${nextPlayerName || 'Next Player'} 📱`}
            </span>
          </button>
          <p className="text-[10px] text-slate-400 font-medium mt-2">
            🔒 अपनी पहचान किसी को न बताएं • Keep your role hidden
          </p>
        </div>
      </div>
    </div>
  );
};
