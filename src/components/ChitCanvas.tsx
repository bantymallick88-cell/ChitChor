import React, { useState, useEffect } from 'react';
import type { Player, RoleType } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Sparkles, Crown, Bot, Check, ArrowRight, Eye, ShieldAlert, ShieldCheck, Footprints, Sparkle } from 'lucide-react';
import { sound } from '../utils/audio';

interface ChitCanvasProps {
  totalChits: number;
  players: Player[];
  currentPlayer: Player;
  round: number;
  pickedChitIndex: number | null;
  onPickChit?: (index: number) => void;
  onChitClick?: (index: number) => void;
  onOpenSecretModal?: () => void;
  onProceed: () => void;
  isLastHuman: boolean;
  nextPlayerName?: string;
}

export const ChitCanvas: React.FC<ChitCanvasProps> = ({
  totalChits = 4,
  players = [],
  currentPlayer,
  round = 1,
  pickedChitIndex = null,
  onPickChit,
  onChitClick,
  onProceed,
  isLastHuman = true,
  nextPlayerName,
}) => {
  // Safe fallbacks to prevent undefined property crashes
  const safePlayers = Array.isArray(players) ? players : [];
  const safeCurrentPlayer: Player = currentPlayer || safePlayers[0] || {
    id: 'p1',
    name: 'You',
    avatar: '👑',
    role: 'raja',
    isHost: true,
    isBot: false,
    score: 0,
    roundScore: 0,
  };

  const [userPicked, setUserPicked] = useState<boolean>(pickedChitIndex !== null);
  const [activeChitIdx, setActiveChitIdx] = useState<number | null>(pickedChitIndex);

  // Sync with prop updates
  useEffect(() => {
    if (pickedChitIndex !== null) {
      setUserPicked(true);
      setActiveChitIdx(pickedChitIndex);
    }
  }, [pickedChitIndex]);

  const handleChitPick = (i: number) => {
    console.log("CHIT CLICKED IN CANVAS:", i);
    sound.unlockAudioAndSpeech();
    setUserPicked(true);
    setActiveChitIdx(i);
    sound.playChitDeal();
    sound.playUnfold();

    if (onPickChit) {
      onPickChit(i);
    }
    if (onChitClick) {
      onChitClick(i);
    }
  };

  const botPlayers = safePlayers.filter((p) => p && p.isBot);
  const effectiveChitIndex = activeChitIdx !== null ? activeChitIdx : (pickedChitIndex !== null ? pickedChitIndex : null);
  const isAnyChitPicked = userPicked || effectiveChitIndex !== null;

  // Determine current player's role with bulletproof fallback
  const playerRole: RoleType = (safeCurrentPlayer.role && ROLES_METADATA[safeCurrentPlayer.role])
    ? safeCurrentPlayer.role
    : 'raja';
  const roleMeta = ROLES_METADATA[playerRole];

  const getHindiDuty = (role: RoleType) => {
    switch (role) {
      case 'raja':
        return 'आप राजा हैं! +1,000 अंक पक्के। पुलिस को चोर पकड़ने का शाही हुक्म दें।';
      case 'rani':
        return 'आप रानी हैं! +500 अंक। अपनी शाही पहचान सभी से गुप्त रखें।';
      case 'katual':
        return 'आप कोतवाल (कमांडेंट) हैं! +500 अंक पक्के। नगर की रक्षा करें।';
      case 'sipahi':
        return 'आप पुलिस हैं! चोर का सही पता लगाएं (+100 अंक)। गलत अनुमान पर 0 अंक!';
      case 'chor':
        return 'आप चोर हैं! पुलिस से छुपें। अगर पुलिस चूकी, तो आप +100 अंक जीतेंगे!';
      default:
        return roleMeta?.duty || '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-300 text-center relative z-10 pointer-events-auto">
      {/* Clean Turn Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Round {round} • Turn: {safeCurrentPlayer.name} {safeCurrentPlayer.avatar}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-wide">
          {!isAnyChitPicked ? 'Pick Your Royal Chit' : 'Royal Chit Secured!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          {!isAnyChitPicked
            ? 'चिट चुनें — Tap any folded parchment to unlock your secret role'
            : 'Your royal role is revealed below! Tap Summon Court to begin.'}
        </p>
      </div>

      {/* Connected Courtiers Status Bar */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap py-0.5">
        {safePlayers.map((p) => {
          const isCurrent = p.id === safeCurrentPlayer.id;
          return (
            <div
              key={p.id}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isCurrent
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-105'
                  : p.isBot
                  ? 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                  : 'bg-[#131b2e]/60 text-slate-300 border-slate-700/50'
              }`}
            >
              <span>{p.avatar}</span>
              <span className="truncate max-w-[85px]">{p.name}</span>
              {isCurrent && <span className="text-emerald-400 text-[10px]">● You</span>}
              {p.isBot && <span className="text-[10px] text-cyan-400 font-mono">Bot</span>}
            </div>
          );
        })}
      </div>

      {/* ================= ROYAL CHITS CONTAINER ================= */}
      <div className="p-4 sm:p-6 bg-[#131b2e]/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl space-y-4 relative z-10 pointer-events-auto">
        {/* Chits Grid: Direct native buttons with zero overlays */}
        <div
          className={`grid ${
            totalChits === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'
          } gap-3 sm:gap-4 relative z-20 pointer-events-auto`}
        >
          {Array.from({ length: totalChits || 4 }).map((_, i) => {
            const isPickedByHuman = effectiveChitIndex === i;
            const isAssignedToBot =
              isAnyChitPicked && !isPickedByHuman && botPlayers.length > 0;
            const botClaimer = isAssignedToBot && botPlayers.length > 0
              ? botPlayers[i % botPlayers.length]
              : null;

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("CLICK DETECTED ON CHIT", i);
                  alert("Chit " + (i + 1) + " clicked!");
                  handleChitPick(i);
                }}
                className={`group relative w-full flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 select-none cursor-pointer relative z-20 pointer-events-auto min-h-[165px] overflow-hidden ${
                  isPickedByHuman
                    ? 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 border-emerald-500 ring-4 ring-emerald-500/30 text-emerald-950 shadow-2xl scale-105'
                    : isAssignedToBot
                    ? 'bg-[#0f172a]/85 border-slate-700/60 text-slate-300 opacity-80 hover:opacity-100 hover:border-slate-600 shadow-md'
                    : 'bg-gradient-to-br from-[#fef3c7] via-[#fef08a] to-[#fde68a] text-slate-900 shadow-xl rounded-2xl border-2 border-amber-400/50 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-1.5 active:scale-95'
                }`}
              >
                {/* Top Badge (pointer-events-none so click passes directly to button) */}
                <div className="w-full flex items-center justify-between text-[11px] font-bold z-10 pointer-events-none">
                  <span
                    className={
                      isPickedByHuman
                        ? 'text-emerald-800'
                        : isAssignedToBot
                        ? 'text-slate-400'
                        : 'text-amber-950 font-serif font-black'
                    }
                  >
                    CHIT #{i + 1}
                  </span>

                  {isPickedByHuman ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : isAssignedToBot ? (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-700/70" />
                  )}
                </div>

                {/* Center Wax-Seal Medallion 📜 */}
                <div className="my-2 z-10 pointer-events-none flex flex-col items-center justify-center">
                  {isPickedByHuman ? (
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border-2 border-emerald-200 ring-4 ring-emerald-500/20">
                      <span className="text-2xl filter drop-shadow">👑</span>
                    </div>
                  ) : isAssignedToBot ? (
                    <div className="relative w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <span className="text-2xl filter grayscale opacity-70">📜</span>
                    </div>
                  ) : (
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-100 ring-4 ring-amber-500/20 transform group-hover:rotate-6 group-hover:scale-105 transition-all">
                      <span className="text-2xl filter drop-shadow">📜</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Label */}
                <div className="text-center w-full z-10 pointer-events-none">
                  {isPickedByHuman ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                        Your Chit
                      </div>
                      <div className="text-[10px] text-emerald-900 font-bold bg-emerald-200/90 px-2.5 py-0.5 rounded-full inline-block shadow-sm">
                        Unlocked ✓
                      </div>
                    </div>
                  ) : isAssignedToBot && botClaimer ? (
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-300 truncate">
                        {botClaimer.name}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-mono">
                        Auto-Picked 🤖
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-black tracking-wider uppercase text-slate-900 bg-amber-300/90 border border-amber-500/40 px-3 py-1 rounded-xl shadow-sm inline-block">
                        ⚡ TAP TO PICK
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Clean Sub-Note */}
        <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            AI Bots pick their chits automatically without any delays!
          </span>
        </div>
      </div>

      {/* ================= DIRECT ONSCREEN ROLE DISPLAY ================= */}
      {isAnyChitPicked && (
        <div className="p-6 rounded-3xl bg-[#0f172a]/95 border-2 border-amber-500 shadow-2xl text-center space-y-4 my-4 animate-in zoom-in-95 duration-200 relative z-20 pointer-events-auto">
          {/* Top Pill */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold">
              <Sparkle className="w-3.5 h-3.5 text-amber-400" />
              <span>Chit #{(effectiveChitIndex !== null ? effectiveChitIndex : 0) + 1} • {safeCurrentPlayer.name}</span>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${roleMeta.gradientBg} text-white shadow-md`}>
              +{roleMeta.points} Pts
            </span>
          </div>

          {/* Big High-Contrast Role Announcement */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-5xl font-serif font-black text-amber-400 tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              YOU GOT: {roleMeta.nameEnglish.toUpperCase()}
            </div>
            <div className="text-lg font-bold text-amber-200">
              {roleMeta.nameHindi}
            </div>
          </div>

          {/* Bilingual Secret Duty Description */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#090d16] border border-slate-700/80 text-xs sm:text-sm text-slate-200 leading-relaxed text-left space-y-1 shadow-inner">
            <p className="font-semibold text-white">
              {getHindiDuty(playerRole)}
            </p>
            <p className="text-[11px] text-slate-400">
              {roleMeta.duty}
            </p>
          </div>

          {/* Primary Action Button to Proceed */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                sound.unlockAudioAndSpeech();
                sound.playClick();
                if (isLastHuman) {
                  sound.speakRoyalProclamation('मेरा पुलिस कौन है?! पुलिस, चोर को पकड़ो!');
                }
                onProceed();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>
                {isLastHuman
                  ? 'Summon Court & Raja 👑'
                  : `Got it! Pass to ${nextPlayerName || 'Next Player'} 📱`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-slate-400 font-medium mt-2">
              🔒 अपनी पहचान किसी को न बताएं • Keep your role hidden
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
