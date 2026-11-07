import React from 'react';
import type { Player, GameMode } from '../types/game';
import { Sparkles, Crown, Bot, Check, ArrowRight, Eye, Lock } from 'lucide-react';
import { sound } from '../utils/audio';

interface ChitCanvasProps {
  totalChits: number;
  players: Player[];
  currentPlayer: Player;
  round: number;
  pickedChitIndex: number | null;
  onPickChit?: (index: number) => void;
  onChitClick?: (index: number) => void;
  onOpenSecretModal: () => void;
  onProceed: () => void;
  isLastHuman: boolean;
  nextPlayerName?: string;
}

export const ChitCanvas: React.FC<ChitCanvasProps> = ({
  totalChits,
  players,
  currentPlayer,
  round,
  pickedChitIndex,
  onPickChit,
  onChitClick,
  onOpenSecretModal,
  onProceed,
  isLastHuman,
  nextPlayerName,
}) => {
  const handleSelectChit = (i: number) => {
    onPickChit?.(i);
    onChitClick?.(i);
  };
  // Identify which chit indexes are auto-claimed by AI bots
  // (All bots auto-claim non-picked chits without blocking the human)
  const botPlayers = players.filter((p) => p.isBot);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-300 text-center">
      {/* Turn Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Round {round} • Turn: {currentPlayer.name} {currentPlayer.avatar}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-wide">
          {pickedChitIndex === null ? 'Pick Your Royal Chit' : 'Royal Chit Selected!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          {pickedChitIndex === null
            ? 'चिट चुनें — Tap any folded slip below to unfold your secret role'
            : 'Your royal role is secured! You can re-peek or summon the royal court.'}
        </p>
      </div>

      {/* Royal Courtiers Status Bar */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
        {players.map((p) => {
          const isCurrent = p.id === currentPlayer.id;
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

      {/* ================= ROYAL TABLE: INTERACTIVE FOLDED CHITS ================= */}
      <div className="p-4 sm:p-5 bg-[#131b2e]/70 backdrop-blur-xl rounded-3xl border border-slate-700/60 shadow-2xl space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Royal Parchment Table ({totalChits} Slips)</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {pickedChitIndex !== null ? '1 Picked' : 'Tap to Pick'}
          </span>
        </div>

        {/* Chits Grid with Large Touch Targets */}
        <div
          className={`grid ${
            totalChits === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'
          } gap-3`}
        >
          {Array.from({ length: totalChits }).map((_, i) => {
            const isPickedByHuman = pickedChitIndex === i;
            // Map remaining slots to bots when human has picked
            const isAssignedToBot =
              pickedChitIndex !== null && !isPickedByHuman && botPlayers.length > 0;
            const botClaimer = isAssignedToBot
              ? botPlayers[(i + (i > pickedChitIndex ? -1 : 0)) % botPlayers.length]
              : null;

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sound.playClick();
                  handleSelectChit(i);
                }}
                className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 select-none cursor-pointer min-h-[140px] ${
                  isPickedByHuman
                    ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/20 border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-105'
                    : isAssignedToBot
                    ? 'bg-[#0f172a]/80 border-slate-700/60 opacity-80 hover:opacity-100 hover:border-slate-600'
                    : 'bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100 hover:from-white hover:to-amber-100 border-amber-300 shadow-md hover:shadow-amber-400/30 hover:-translate-y-1 active:scale-95 text-amber-950'
                }`}
              >
                {/* Top Badge */}
                <div className="w-full flex items-center justify-between text-[11px] font-bold">
                  <span
                    className={
                      isPickedByHuman
                        ? 'text-emerald-300'
                        : isAssignedToBot
                        ? 'text-slate-400'
                        : 'text-amber-900'
                    }
                  >
                    #{i + 1}
                  </span>
                  {isPickedByHuman ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : isAssignedToBot ? (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-700/70" />
                  )}
                </div>

                {/* Center Icon */}
                <div className="my-1.5 transform transition-transform group-hover:scale-110">
                  {isPickedByHuman ? (
                    <span className="text-3xl sm:text-4xl filter drop-shadow">👑</span>
                  ) : isAssignedToBot ? (
                    <span className="text-3xl filter grayscale opacity-75">📜</span>
                  ) : (
                    <span className="text-3xl sm:text-4xl filter drop-shadow">📜</span>
                  )}
                </div>

                {/* Bottom Label */}
                <div className="text-center w-full">
                  {isPickedByHuman ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                        Your Chit
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                        Tap to Peek 👁️
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
                      <div className="text-xs font-serif font-black text-amber-950 uppercase tracking-wider">
                        Chit #{i + 1}
                      </div>
                      <div className="text-[10px] text-amber-900 font-bold bg-amber-200/80 px-2 py-0.5 rounded-full inline-block">
                        चुनें • Tap
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanatory Note */}
        <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            AI Bots pick their chits automatically without waiting or blocking your turn!
          </span>
        </div>
      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="pt-2 space-y-2.5">
        {pickedChitIndex !== null ? (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenSecretModal();
              }}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm bg-[#131b2e] hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Re-Peek My Role (पहचान देखें)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onProceed();
              }}
              className="flex-1 py-3.5 px-5 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <span>
                {isLastHuman
                  ? 'Summon Court & Raja 👑'
                  : `Pass to ${nextPlayerName || 'Next Player'} 📱`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#131b2e]/60 border border-slate-700/50 text-xs sm:text-sm text-slate-300 font-medium">
            👆 Please tap any folded chit above to reveal your role!
          </div>
        )}
      </div>
    </div>
  );
};

