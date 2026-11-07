import React, { useState, useEffect } from 'react';
import type { Player, RoleType, GameMode } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { ShieldAlert, Footprints, CheckCircle2, XCircle, Crown, Eye, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface PoliceInvestigationModalProps {
  sipahiPlayer: Player;
  currentPlayerId: string;
  isHost: boolean;
  players: Player[];
  gameMode: GameMode;
  onGuessSubmitted: (guesserId: string, suspectId: string) => void;
  result: {
    guesserId: string;
    suspectId: string;
    suspectRole: RoleType;
    isCorrect: boolean;
  } | null;
  onContinueToScoreboard: () => void;
}

export const PoliceInvestigationModal: React.FC<PoliceInvestigationModalProps> = ({
  sipahiPlayer,
  currentPlayerId,
  isHost,
  players,
  gameMode,
  onGuessSubmitted,
  result,
  onContinueToScoreboard,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isAccusing, setIsAccusing] = useState(false);

  const isCurrentPlayerSipahi = currentPlayerId === sipahiPlayer.id;

  // Potential suspects: everyone EXCEPT Raja and Sipahi
  const suspects = players.filter(
    (p) => p.role !== 'raja' && p.role !== 'sipahi'
  );

  // Trigger suspense beat on mount
  useEffect(() => {
    sound.playSuspenseBeat();
    const interval = setInterval(() => {
      if (!result) {
        sound.playSuspenseBeat();
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [result]);

  // When result arrives, trigger audio and confetti
  useEffect(() => {
    if (result) {
      if (result.isCorrect) {
        sound.playRoyalFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#ffffff', '#ef4444'],
        });
      } else {
        sound.playWrongBuzzer();
      }
    }
  }, [result]);

  // If Sipahi is an AI bot, bot picks after 2.5s automatically
  useEffect(() => {
    if (sipahiPlayer.isBot && isHost && !result && suspects.length > 0) {
      const timer = setTimeout(() => {
        const randomSuspect = suspects[Math.floor(Math.random() * suspects.length)];
        onGuessSubmitted(sipahiPlayer.id, randomSuspect.id);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [sipahiPlayer.isBot, isHost, result, suspects]);

  const handleConfirmAccusation = () => {
    if (!selectedSuspectId) return;
    setIsAccusing(true);
    sound.playClick();
    setTimeout(() => {
      onGuessSubmitted(sipahiPlayer.id, selectedSuspectId);
      setIsAccusing(false);
    }, 600);
  };

  const getSuspectName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Suspect';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#141720] via-[#0d1017] to-[#0a0d14] border-2 border-amber-500/30 p-6 shadow-2xl royal-glow">
        {/* Modal Top Ornate Ribbon */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Royal Court Investigation • शाही जांच</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-300 tracking-wide">
            "Mera Sipahi Kaun Hai?!"
          </h2>
          <p className="text-xs text-zinc-400">
            Sipahi <strong className="text-emerald-400">{sipahiPlayer.name}</strong> has answered the King's summons to identify the thief!
          </p>
        </div>

        {/* -------------------- RESULT VIEW -------------------- */}
        {result ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 text-center">
            <div
              className={`p-5 rounded-2xl border-2 ${
                result.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  : 'bg-red-950/40 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              }`}
            >
              <div className="flex justify-center mb-3">
                {result.isCorrect ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400 animate-pulse" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-serif font-bold text-white mb-1">
                {result.isCorrect ? 'CHOR CAUGHT RED-HANDED!' : 'WRONG ACCUSATION! CHOR ESCAPED!'}
              </h3>

              <p className="text-sm text-zinc-300 mb-3">
                Sipahi accused <strong className="text-amber-300">{result.suspectName}</strong>, whose secret role was{' '}
                <span className="font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded bg-black/60 border border-amber-500/30">
                  {ROLES_METADATA[result.suspectRole]?.nameHindi || result.suspectRole}
                </span>
              </p>

              {/* Scoring Outcome Breakdown */}
              <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-xs space-y-1.5 text-left">
                {result.isCorrect ? (
                  <>
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>✓ Sipahi ({sipahiPlayer.name}):</span>
                      <span>+100 Points</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>✗ Chor ({result.suspectName}):</span>
                      <span>0 Points (Captured)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-red-400 font-semibold">
                      <span>✗ Sipahi ({sipahiPlayer.name}):</span>
                      <span>0 Points (Bounty Stolen)</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-semibold">
                      <span>✓ Real Chor Steals Bounty:</span>
                      <span>+100 Points</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onContinueToScoreboard}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              View Round Leaderboard & Scores →
            </button>
          </div>
        ) : (
          /* -------------------- INVESTIGATION CHOICES -------------------- */
          <div className="space-y-4">
            {isCurrentPlayerSipahi ? (
              <>
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-emerald-200">
                    <strong>You are the Sipahi!</strong> One of the suspects below is the elusive Chor. Inspect their faces and choose carefully!
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Choose Your Accusation:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {suspects.map((suspect) => {
                      const isSelected = selectedSuspectId === suspect.id;
                      return (
                        <div
                          key={suspect.id}
                          onClick={() => {
                            setSelectedSuspectId(suspect.id);
                            sound.playClick();
                          }}
                          className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-[1.01]'
                              : 'bg-zinc-900/60 border-zinc-700/60 hover:border-amber-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{suspect.avatar}</span>
                            <div>
                              <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                                <span>{suspect.name}</span>
                                {suspect.isBot && (
                                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700">
                                    BOT
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400">
                                Unrevealed Courtier • Secret Role
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400 text-black'
                                : 'border-zinc-600'
                            }`}
                          >
                            {isSelected && <span className="font-black text-xs">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={!selectedSuspectId || isAccusing}
                  onClick={handleConfirmAccusation}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg ${
                    selectedSuspectId && !isAccusing
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white hover:brightness-110 active:scale-[0.98]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  }`}
                >
                  {isAccusing
                    ? 'Interrogating Suspect...'
                    : selectedSuspectId
                    ? `Accuse ${getSuspectName(selectedSuspectId)} as Chor!`
                    : 'Select a suspect above'}
                </button>
              </>
            ) : (
              /* SPECTATOR / OTHER PLAYER VIEW */
              <div className="text-center py-6 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-zinc-200">
                    Sipahi is Questioning the Suspects...
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Maintain your poker face! Sipahi <strong className="text-emerald-400">{sipahiPlayer.name}</strong> is evaluating who the Chor is.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-amber-500/20 rounded-xl p-3 text-left space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase">
                    Suspects Under Watch:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suspects.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5"
                      >
                        <span>{s.avatar}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
