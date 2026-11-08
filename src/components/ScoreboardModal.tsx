import React, { useState } from 'react';
import type { Player, RoundRecord, GameMode, RoleType } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Trophy, RotateCcw, ArrowRight, Share2, History, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface ScoreboardModalProps {
  players: Player[];
  history: RoundRecord[];
  currentRound: number;
  isHost: boolean;
  gameMode: GameMode;
  onNextRound: () => void;
  onRestartGame: () => void;
  onDeclareWinner?: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  players,
  history,
  currentRound,
  isHost,
  onNextRound,
  onRestartGame,
  onDeclareWinner,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'roundHistory'>('leaderboard');
  const [copied, setCopied] = useState(false);

  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            🥇 1
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300/20 border-2 border-slate-300 text-slate-200 flex items-center justify-center font-bold text-xs">
            🥈 2
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700/20 border-2 border-amber-600 text-amber-500 flex items-center justify-center font-bold text-xs">
            🥉 3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
            #{rank + 1}
          </div>
        );
    }
  };

  const shareScoreboard = () => {
    sound.playClick();
    const text = `👑 ChitChor Scorecard (Round ${currentRound}):\n` +
      sortedPlayers.map((p, i) => `${i + 1}. ${p.name}: ${p.score} Pts`).join('\n') +
      `\n\nPlay modern Raja Rani Chor Police at https://chitchor.fixeehub.com`;

    if (navigator.share) {
      navigator.share({ title: 'ChitChor Leaderboard', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Round {currentRound} Scorecard</span>
          </div>
          <h2 className="text-2xl font-sans font-black text-white tracking-wide">
            Court Leaderboard
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#090d16]/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('roundHistory')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'roundHistory'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {sortedPlayers.map((player, idx) => {
              const roleMeta = player.role ? ROLES_METADATA[player.role] : null;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#090d16]/70 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(idx)}
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isBot && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
                            BOT
                          </span>
                        )}
                      </div>
                      {roleMeta && (
                        <span className={`text-xs font-semibold ${roleMeta.color}`}>
                          Last: {roleMeta.nameHindi} (+{player.roundScore})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400 font-mono">
                      {player.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: ROUND HISTORY */}
        {activeTab === 'roundHistory' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No past round logs yet.
              </div>
            ) : (
              [...history].reverse().map((rec) => (
                <div
                  key={rec.round}
                  className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-slate-400 font-bold border-b border-slate-800 pb-1">
                    <span>Round #{rec.round}</span>
                    <span className={rec.guessResult.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                      {rec.guessResult.isCorrect ? '✓ Chor Caught' : '✗ Chor Escaped'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(rec.scores).map(([pid, info]) => {
                      const player = players.find((p) => p.id === pid);
                      return (
                        <div key={pid} className="flex justify-between bg-black/40 px-2.5 py-1.5 rounded">
                          <span className="text-slate-300 truncate max-w-[90px] font-medium">
                            {player?.name || 'Player'}
                          </span>
                          <span className="text-amber-400 font-mono font-bold">
                            +{info.points}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={shareScoreboard}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copied ? 'Copied to Clipboard!' : 'Share Scoreboard with Friends'}</span>
        </button>

        {/* Action Controls: Next Round & End Game / Declare Winner */}
        <div className="pt-2 flex flex-col gap-2.5">
          {isHost ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    onNextRound();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Next Round 🔄</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onDeclareWinner?.();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>End Game & Winner 🏆</span>
                </button>
              </div>

              <div className="flex justify-center pt-0.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    if (confirm('Reset all scores back to Round 1?')) {
                      onRestartGame();
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>Reset Match to Round 1</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full py-3 text-center text-xs text-slate-400 bg-[#0f172a] rounded-xl border border-slate-800 font-medium">
              Waiting for Host to deal the next round...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
