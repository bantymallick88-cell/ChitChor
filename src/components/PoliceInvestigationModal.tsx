import React, { useState, useEffect } from 'react';
import type { Player, RoleType, GameMode } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { ShieldAlert, Footprints, CheckCircle2, XCircle, ArrowRight, Eye, Sparkles, Bot } from 'lucide-react';
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
  const [botThinkingStep, setBotThinkingStep] = useState(0);
  const [botProgress, setBotProgress] = useState(15);

  const isCurrentPlayerSipahi = currentPlayerId === sipahiPlayer.id;

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

  // When result arrives, trigger audio and confetti
  useEffect(() => {
    if (result) {
      if (result.isCorrect) {
        sound.playRoyalFanfare();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#ffffff', '#ec4899'],
        });
      } else {
        sound.playWrongBuzzer();
      }
    }
  }, [result]);

  // AI bot Sipahi guess simulation with 2-second realistic "Thinking..." animation
  useEffect(() => {
    if (sipahiPlayer.isBot && isHost && !result && suspects.length > 0) {
      const step1 = setTimeout(() => {
        setBotThinkingStep(1);
        setBotProgress(55);
      }, 700);

      const step2 = setTimeout(() => {
        setBotThinkingStep(2);
        setBotProgress(90);
      }, 1400);

      const timer = setTimeout(() => {
        setBotProgress(100);
        // Smart AI Logic: Real Chor exists among suspects!
        const realChor = suspects.find((p) => p.role === 'chor');
        let chosenSuspect = suspects[0];
        // 55% intelligent deduction vs 45% bluff/mistake
        if (realChor && Math.random() < 0.55) {
          chosenSuspect = realChor;
        } else {
          const nonChors = suspects.filter((p) => p.role !== 'chor');
          if (nonChors.length > 0 && Math.random() < 0.75) {
            chosenSuspect = nonChors[Math.floor(Math.random() * nonChors.length)];
          } else {
            chosenSuspect = suspects[Math.floor(Math.random() * suspects.length)];
          }
        }
        onGuessSubmitted(sipahiPlayer.id, chosenSuspect.id);
      }, 2000);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(timer);
      };
    }
  }, [sipahiPlayer.isBot, isHost, result, suspects]);

  const handleConfirmAccusation = () => {
    if (!selectedSuspectId) return;
    setIsAccusing(true);
    sound.playClick();
    setTimeout(() => {
      onGuessSubmitted(sipahiPlayer.id, selectedSuspectId);
      setIsAccusing(false);
    }, 500);
  };

  const getSuspectName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Suspect';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Royal Court Investigation</span>
          </div>
          <h2 className="text-2xl font-sans font-black text-amber-400 tracking-wide">
            "Mera Sipahi Kaun Hai?!"
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Sipahi <strong className="text-cyan-400 font-bold">{sipahiPlayer.name}</strong> must identify the Chor!
          </p>
        </div>

        {/* ---------------- RESULT VIEW ---------------- */}
        {result ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 text-center">
            <div
              className={`p-5 rounded-2xl border-2 ${
                result.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                  : 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
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

              <h3 className="text-xl font-serif font-extrabold text-white mb-1">
                {result.isCorrect ? 'CHOR CAUGHT RED-HANDED!' : 'WRONG GUESS! CHOR ESCAPED!'}
              </h3>

              <p className="text-sm text-slate-200 mb-3">
                Sipahi accused <strong className="text-amber-400">{result.suspectName}</strong>, whose secret role was{' '}
                <span className="font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded bg-black/60 border border-slate-700">
                  {ROLES_METADATA[result.suspectRole]?.nameHindi || result.suspectRole}
                </span>
              </p>

              {/* Scoring breakdown */}
              <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-xs space-y-1.5 text-left font-medium">
                {result.isCorrect ? (
                  <>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>✓ Sipahi ({sipahiPlayer.name}):</span>
                      <span>+100 Points</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>✗ Chor ({result.suspectName}):</span>
                      <span>0 Points (Captured)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-red-400 font-bold">
                      <span>✗ Sipahi ({sipahiPlayer.name}):</span>
                      <span>0 Points (Bounty Stolen)</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>✓ Real Chor Steals Bounty:</span>
                      <span>+100 Points</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onContinueToScoreboard}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>View Live Round Scorecard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ---------------- INVESTIGATION SELECTION ---------------- */
          <div className="space-y-4">
            {isCurrentPlayerSipahi ? (
              <>
                <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-cyan-200 font-medium">
                    <strong>You are the Sipahi!</strong> One of the courtiers below is secretly the Chor. Choose wisely!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Tap to Accuse Suspect:
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
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.01]'
                              : 'bg-[#090d16]/80 border-slate-700/60 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{suspect.avatar}</span>
                            <div>
                              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                <span>{suspect.name}</span>
                                {suspect.isBot && (
                                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                                    BOT
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                Suspect Courtier
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-400 text-black font-black text-xs'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && '✓'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={!selectedSuspectId || isAccusing}
                  onClick={handleConfirmAccusation}
                  className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl ${
                    selectedSuspectId && !isAccusing
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-red-600/30 hover:brightness-110 active:scale-[0.98]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {isAccusing
                    ? 'Interrogating Courtier...'
                    : selectedSuspectId
                    ? `Accuse ${getSuspectName(selectedSuspectId)} as Chor!`
                    : 'Select a suspect above'}
                </button>
              </>
            ) : sipahiPlayer.isBot ? (
              /* SMART AI BOT THINKING VIEW */
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
                    {botThinkingStep === 0 && '⚡ Scanning courtier micro-expressions & tells...'}
                    {botThinkingStep === 1 && '🧠 Calculating deception probability matrix...'}
                    {botThinkingStep >= 2 && '🔍 Preparing royal warrant for the prime suspect!'}
                  </p>
                </div>

                {/* Animated 2-Second Progress Bar */}
                <div className="w-full max-w-xs mx-auto bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 transition-all duration-700 ease-out"
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
                        <span className="font-medium truncate max-w-[80px]">{s.name}</span>
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
                    Sipahi is Interrogating the Court...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Keep your poker face! Sipahi <strong className="text-cyan-400">{sipahiPlayer.name}</strong> is looking for tells.
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
