import React, { useState, useEffect, useRef } from 'react';
import type { Player, RoleType, GameMode, GuessResult } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Bot, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface PoliceInvestigationModalProps {
  sipahiPlayer: Player;
  currentPlayerId: string;
  isHost: boolean;
  players: Player[];
  gameMode: GameMode;
  onGuessSubmitted: (guesserId: string, suspectId: string) => void;
  result: GuessResult | null;
  onContinueToScoreboard: () => void;
  onNextRound?: () => void;
  onDeclareWinner?: () => void;
  currentRound?: number;
  totalRounds?: number;
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
  onNextRound,
  onDeclareWinner,
  currentRound = 1,
  totalRounds = 3,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [botThinkingStep, setBotThinkingStep] = useState(0);
  const [botProgress, setBotProgress] = useState(25);

  const isFinalRound = currentRound >= totalRounds;

  const isCurrentPlayerSipahi = !sipahiPlayer.isBot && currentPlayerId === sipahiPlayer.id;

  // Stable players ref to prevent re-triggering effects on array reference changes
  const playersRef = useRef(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Suspects: everyone EXCEPT Raja and Sipahi
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

  // When result arrives, trigger audio and celebratory fanfare
  useEffect(() => {
    if (result) {
      if (result.isCorrect) {
        sound.playVictorySound();
        sound.playRoyalFanfare();
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#ffffff', '#ec4899'],
        });
      } else {
        sound.playTwistSound();
        sound.playWrongBuzzer();
      }
    }
  }, [result]);

  // ================= 1. INSTANT BOT SIPAHI GUESS (EXACTLY 800MS) =================
  const hasGuessedRef = useRef(false);

  useEffect(() => {
    if (!result) {
      hasGuessedRef.current = false;
    }
  }, [result]);

  useEffect(() => {
    if (sipahiPlayer.isBot && !result && !hasGuessedRef.current) {
      hasGuessedRef.current = true;
      setBotThinkingStep(1);
      setBotProgress(60);

      // EXACTLY 800 milliseconds timer as requested
      const timer = setTimeout(() => {
        setBotProgress(100);
        setBotThinkingStep(2);

        const currentPlayers = playersRef.current;
        const validSuspects = currentPlayers.filter(
          (p) => p.role !== 'raja' && p.role !== 'sipahi'
        );

        if (validSuspects.length > 0) {
          const realChor = validSuspects.find((p) => p.role === 'chor');
          let chosenSuspect = validSuspects[0];

          // 55% intelligent deduction vs 45% bluff/random
          if (realChor && Math.random() < 0.55) {
            chosenSuspect = realChor;
          } else {
            chosenSuspect = validSuspects[Math.floor(Math.random() * validSuspects.length)];
          }

          onGuessSubmitted(sipahiPlayer.id, chosenSuspect.id);
        }
      }, 800);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [sipahiPlayer.id, sipahiPlayer.isBot, result, onGuessSubmitted]);

  // ================= 2. HUMAN SIPAHI FAST SELECTION (ZERO LAG) =================
  const handleFastAccuse = (suspectId: string) => {
    sound.playClick();
    setSelectedSuspectId(suspectId);
    // Instant submission with zero artificial delay
    onGuessSubmitted(sipahiPlayer.id, suspectId);
  };

  const getSuspectName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Suspect';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-5 sm:p-7 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Royal Court Investigation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-amber-400 tracking-wide">
            {isCurrentPlayerSipahi ? 'Identify the Hidden Chor!' : 'Police Investigation Active'}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            {isCurrentPlayerSipahi ? (
              <span>You are the <strong className="text-cyan-400 font-bold">Police</strong>! Tap any suspect courtier below to accuse them as Chor.</span>
            ) : (
              <span>Police <strong className="text-cyan-400 font-bold">{sipahiPlayer.name}</strong> must identify the hidden Chor!</span>
            )}
          </p>
        </div>

        {/* ================= RESULT VIEW & INSTANT POINTS SCORECARD ================= */}
        {result ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            {/* Outcome Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 ${
                result.isCorrect
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                  : 'bg-red-950/50 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
              }`}
            >
              <div className="flex justify-center mb-2.5">
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

              <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-1">
                {result.isCorrect
                  ? '🎉 CHOR CAUGHT RED-HANDED! 🎉'
                  : '😅 WRONG GUESS! CHOR ESCAPED! 😅'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 mb-3">
                Police accused <strong className="text-amber-400">{result.suspectName}</strong>, whose secret role was{' '}
                <span className="font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded bg-black/70 border border-slate-700">
                  {ROLES_METADATA[result.suspectRole]?.nameEnglish} ({ROLES_METADATA[result.suspectRole]?.nameHindi})
                </span>
              </p>

              {/* Instant Round Points Scorecard */}
              <div className="bg-[#090d16]/90 p-3 sm:p-4 rounded-xl border border-slate-700/80 text-xs space-y-2 text-left font-medium">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 pb-1 border-b border-slate-800 flex justify-between">
                  <span>Courtier & Role</span>
                  <span>Round Pts • Total</span>
                </div>

                {players.map((p) => {
                  const isSipahi = p.role === 'sipahi';
                  const isChor = p.role === 'chor';
                  const isWinnerRole = result.isCorrect ? isSipahi : isChor;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between py-1 px-1.5 rounded-lg transition-colors ${
                        isWinnerRole
                          ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span>{p.avatar}</span>
                        <span className="truncate">{p.name}</span>
                        {p.role && (
                          <span className="text-[10px] text-slate-400 font-serif uppercase">
                            ({ROLES_METADATA[p.role]?.nameEnglish})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs font-bold text-right shrink-0">
                        <span className={p.roundScore > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          +{p.roundScore}
                        </span>
                        <span className="text-slate-500 ml-1.5">({p.score})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clean Fast Action Controls */}
            <div className="space-y-2 pt-1">
              {isFinalRound ? (
                /* FINAL TOURNAMENT ROUND COMPLETED */
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (onDeclareWinner) {
                      onDeclareWinner();
                    } else {
                      onContinueToScoreboard();
                    }
                  }}
                  className="w-full py-4 px-4 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Trophy className="w-5 h-5 fill-slate-950 animate-bounce" />
                  <span>View Final Tournament Results (Round {currentRound}/{totalRounds}) 🎆</span>
                </button>
              ) : (
                /* INTERMEDIATE ROUNDS */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* NEXT ROUND BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (onNextRound) {
                        onNextRound();
                      } else {
                        onContinueToScoreboard();
                      }
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Next Round ({currentRound + 1}/{totalRounds}) 🔄</span>
                  </button>

                  {/* END GAME & DECLARE WINNER BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (onDeclareWinner) {
                        onDeclareWinner();
                      } else {
                        onContinueToScoreboard();
                      }
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 fill-slate-950" />
                    <span>Declare Winner 🏆</span>
                  </button>
                </div>
              )}

              {/* View Full Scorecard Link */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onContinueToScoreboard();
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Court Leaderboard History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ================= INVESTIGATION SELECTION ================= */
          <div className="space-y-4">
            {isCurrentPlayerSipahi ? (
              /* HUMAN SIPAHI: 1-TAP FAST SELECTION (ZERO LAG) */
              <>
                <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-2xl text-center">
                  <p className="text-xs text-cyan-200 font-medium">
                    <strong>You are the Police!</strong> Tap any suspect courtier below to accuse them as Chor instantly.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                    ⚡ Tap Suspect to Accuse:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {suspects.map((suspect) => {
                      const isSelected = selectedSuspectId === suspect.id;
                      return (
                        <button
                          key={suspect.id}
                          type="button"
                          onClick={() => handleFastAccuse(suspect.id)}
                          className={`w-full text-left cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                            isSelected
                              ? 'bg-cyan-500/25 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.01]'
                              : 'bg-[#090d16]/85 border-slate-700/60 hover:border-cyan-400 hover:bg-cyan-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow">{suspect.avatar}</span>
                            <div>
                              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                <span>{suspect.name}</span>
                                {suspect.isBot && (
                                  <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                                    BOT
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                Suspect Courtier
                              </span>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>Accuse</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : sipahiPlayer.isBot ? (
              /* SMART AI BOT THINKING VIEW (800MS FAST SCAN) */
              <div className="text-center py-5 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <span className="text-3xl animate-bounce">{sipahiPlayer.avatar}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    <Bot className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    <span>Smart AI Inquest Active</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {sipahiPlayer.name} is Analyzing the Court...
                  </h4>
                  <p className="text-xs text-cyan-300 font-mono tracking-tight animate-pulse min-h-[1.5rem]">
                    {botThinkingStep === 0 && '⚡ Scanning courtier tells & micro-expressions...'}
                    {botThinkingStep === 1 && '🧠 Calculating deception probability matrix...'}
                    {botThinkingStep >= 2 && '🔍 Royal warrant issued! Identifying prime suspect...'}
                  </p>
                </div>

                {/* Animated 800ms Progress Bar */}
                <div className="w-full max-w-xs mx-auto bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 transition-all duration-300 ease-out"
                    style={{ width: `${botProgress}%` }}
                  />
                </div>

                {/* Suspects being scanned */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                    Courtiers Under Interrogation:
                  </span>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {suspects.map((s) => (
                      <div
                        key={s.id}
                        className="px-2.5 py-1.5 rounded-xl bg-[#090d16] border border-slate-700/60 flex items-center gap-1.5 text-xs text-slate-300"
                      >
                        <span>{s.avatar}</span>
                        <span className="font-medium truncate max-w-[85px]">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* HUMAN SPECTATOR / WAITING VIEW */
              <div className="text-center py-6 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-100">
                    Police is Interrogating the Court...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Keep your poker face! Police <strong className="text-cyan-400">{sipahiPlayer.name}</strong> is inspecting for tells.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
