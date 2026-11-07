import React, { useState } from 'react';
import type { Player, RoundRecord, GameMode, RoleType } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Trophy, Medal, RotateCcw, ArrowRight, Share2, History, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface ScoreboardModalProps {
  players: Player[];
  history: RoundRecord[];
  currentRound: number;
  isHost: boolean;
  gameMode: GameMode;
  onNextRound: () => void;
  onRestartGame: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  players,
  history,
  currentRound,
  isHost,
  onNextRound,
  onRestartGame,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'roundHistory'>('leaderboard');
  const [copied, setCopied] = useState(false);

  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            🥇 1
          </div>
        );
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-400/20 border border-slate-300 text-slate-200 flex items-center justify-center font-bold text-xs">
            🥈 2
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-600 text-amber-500 flex items-center justify-center font-bold text-xs">
            🥉 3
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-semibold text-xs">
            #{rank + 1}
          </div>
        );
    }
  };

  const shareScoreboard = () => {
    sound.playClick();
    const leader = sortedPlayers[0];
    const text = `👑 ChitChor Royal Scorecard (Round ${currentRound}):\n` +
      sortedPlayers.map((p, i) => `${i + 1}. ${p.name}: ${p.score} Pts`).join('\n') +
      `\n\nPlay modern Raja Rani Chor Sipahi at https://chitchor.fixeehub.com`;

    if (navigator.share) {
      navigator.share({ title: 'ChitChor Leaderboard', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#141720] via-[#0d1017] to-[#0a0d14] border-2 border-amber-500/30 p-6 shadow-2xl royal-glow space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Round {currentRound} Complete</span>
          </div>
          <h2 className="text-2xl font-serif font-black text-amber-300 tracking-wide">
            Royal Court Scorecard
          </h2>
          <p className="text-xs text-zinc-400">
            Points accrued across royal decrees and captures
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Grand Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('roundHistory')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'roundHistory'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Round Log ({history.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERALL LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {sortedPlayers.map((player, idx) => {
              const roleMeta = player.role ? ROLES_METADATA[player.role] : null;
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(idx)}
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isBot && (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded border border-zinc-700">
                            BOT
                          </span>
                        )}
                      </div>
                      {roleMeta && (
                        <span className={`text-[11px] font-semibold ${roleMeta.color}`}>
                          Last: {roleMeta.nameHindi} (+{player.roundScore})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-amber-400 font-mono">
                      {player.score.toLocaleString()} <span className="text-xs font-normal">pts</span>
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
              <div className="text-center py-8 text-zinc-500 text-xs">
                No past round logs yet.
              </div>
            ) : (
              [...history].reverse().map((rec) => (
                <div
                  key={rec.round}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-zinc-400 font-semibold border-b border-zinc-800 pb-1">
                    <span>Round #{rec.round}</span>
                    <span className={rec.guessResult.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                      {rec.guessResult.isCorrect ? '✓ Chor Caught' : '✗ Chor Escaped'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(rec.scores).map(([pid, info]) => {
                      const player = players.find((p) => p.id === pid);
                      return (
                        <div key={pid} className="flex justify-between bg-black/40 px-2 py-1 rounded">
                          <span className="text-zinc-300 truncate max-w-[90px]">
                            {player?.name || 'Player'}
                          </span>
                          <span className="text-amber-300 font-mono font-bold">
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
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{copied ? 'Copied to Clipboard!' : 'Brag / Share Scorecard'}</span>
        </button>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          {isHost ? (
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  onNextRound();
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Deal Next Round</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (confirm('Restart game from Round 1 and reset all scores?')) {
                    onRestartGame();
                  }
                }}
                className="py-3 px-4 rounded-xl font-semibold text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </>
          ) : (
            <div className="w-full py-3 text-center text-xs text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800">
              Waiting for Host to start the next round...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

