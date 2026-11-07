import React from 'react';
import type { Player } from '../types/game';
import { Sparkles, Crown, Bot, Check, ArrowRight, Eye } from 'lucide-react';
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

  const botPlayers = players.filter((p) => p.isBot);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-300 text-center">
      {/* Clean Turn Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Round {round} • Turn: {currentPlayer.name} {currentPlayer.avatar}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-wide">
          {pickedChitIndex === null ? 'Pick Your Royal Chit' : 'Royal Chit Secured!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          {pickedChitIndex === null
            ? 'चिट चुनें — Tap any folded parchment to unlock your secret role'
            : 'Your royal role is revealed! You can re-peek or summon the royal court.'}
        </p>
      </div>

      {/* Connected Courtiers Status Bar */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap py-0.5">
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

      {/* ================= ROYAL CHITS CONTAINER ================= */}
      <div className="p-4 sm:p-6 bg-[#131b2e]/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl space-y-4">
        {/* Chits Grid with Large Touch Targets */}
        <div
          className={`grid ${
            totalChits === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'
          } gap-3 sm:gap-4`}
        >
          {Array.from({ length: totalChits }).map((_, i) => {
            const isPickedByHuman = pickedChitIndex === i;
            const isAssignedToBot =
              pickedChitIndex !== null && !isPickedByHuman && botPlayers.length > 0;
            const botClaimer = isAssignedToBot
              ? botPlayers[(i + (i > pickedChitIndex ? -1 : 0)) % botPlayers.length]
              : null;

            return (
              <div
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sound.playClick();
                  handleSelectChit(i);
                }}
                className="cursor-pointer relative z-30 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sound.playClick();
                    handleSelectChit(i);
                  }}
                  className={`group relative w-full flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 select-none cursor-pointer min-h-[160px] overflow-hidden ${
                    isPickedByHuman
                      ? 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 border-emerald-500 ring-4 ring-emerald-500/30 text-emerald-950 shadow-2xl scale-105'
                      : isAssignedToBot
                      ? 'bg-[#0f172a]/85 border-slate-700/60 text-slate-300 opacity-80 hover:opacity-100 hover:border-slate-600 shadow-md'
                      : 'bg-gradient-to-br from-[#fef3c7] via-[#fef08a] to-[#fde68a] text-slate-900 shadow-xl rounded-2xl border-2 border-amber-400/50 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-1.5 active:scale-95'
                  }`}
                >
                  {/* Subtle Paper Crease Lines (Folded Parchment Effect) */}
                  {!isAssignedToBot && (
                    <>
                      <div className="absolute inset-x-3 top-1/2 h-[1px] bg-amber-500/20 transform -translate-y-1/2 pointer-events-none" />
                      <div className="absolute inset-y-3 left-1/2 w-[1px] bg-amber-500/20 transform -translate-x-1/2 pointer-events-none" />
                      <div className="absolute inset-1.5 border border-amber-600/15 rounded-xl pointer-events-none" />
                    </>
                  )}

                  {/* Top Badge */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold z-10">
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
                  <div className="my-2 z-10 flex flex-col items-center justify-center">
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
                  <div className="text-center w-full z-10">
                    {isPickedByHuman ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                          Your Chit
                        </div>
                        <div className="text-[10px] text-emerald-900 font-bold bg-emerald-200/90 px-2.5 py-0.5 rounded-full inline-block shadow-sm">
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
                        <div className="text-[11px] font-black tracking-wider uppercase text-slate-900 bg-amber-300/80 hover:bg-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl shadow-sm inline-block">
                          ⚡ TAP TO PICK
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Clean Sub-Note */}
        <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            AI Bots pick their chits automatically in the background without delays!
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
            👆 Please tap any folded parchment above to reveal your role!
          </div>
        )}
      </div>
    </div>
  );
};
