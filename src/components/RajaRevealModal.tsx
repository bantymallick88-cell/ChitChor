import React, { useEffect, useState, useRef } from 'react';
import type { Player } from '../types/game';
import { Crown, Volume2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface RajaRevealModalProps {
  rajaPlayer: Player;
  onProceed: () => void;
  autoAdvanceSeconds?: number;
}

export const RajaRevealModal: React.FC<RajaRevealModalProps> = ({
  rajaPlayer,
  onProceed,
  autoAdvanceSeconds = 8,
}) => {
  const [countdown, setCountdown] = useState(autoAdvanceSeconds);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [hasFinishedSpeaking, setHasFinishedSpeaking] = useState(false);
  const isSpeakingRef = useRef(true);
  const hasProceededRef = useRef(false);

  const safeProceed = () => {
    if (!hasProceededRef.current) {
      hasProceededRef.current = true;
      onProceed();
    }
  };

  useEffect(() => {
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    sound.playRoyalFanfare();

    // Play Hindi royal proclamation and wait until it finishes completely
    sound.playRajaVoice('मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!', () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setHasFinishedSpeaking(true);
    });

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // If speech is still ongoing, do not proceed! Hold until speaking finishes completely.
          if (isSpeakingRef.current) {
            return 1;
          }
          clearInterval(interval);
          safeProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.unlockAudioAndSpeech();
    sound.playClick();
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setHasFinishedSpeaking(false);
    setCountdown(autoAdvanceSeconds);
    sound.playRajaVoice(
      'मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!',
      () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setHasFinishedSpeaking(true);
      },
      true // force restart for manual replay
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in zoom-in-95 duration-300 pointer-events-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1a233b] via-[#131b2e] to-[#090d16] border-2 border-amber-400/80 p-6 sm:p-8 shadow-[0_0_55px_rgba(245,158,11,0.4)] space-y-5 text-center my-auto">
        {/* Crown & Royal Aura */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/25 via-yellow-500/20 to-amber-600/25 blur-md" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-2 border-yellow-200 flex items-center justify-center shadow-xl shadow-amber-500/40">
            <Crown className="w-10 h-10 text-amber-950 fill-amber-950 animate-bounce" />
          </div>
        </div>

        {/* Phase Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 2 • The Royal Proclamation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-300 tracking-wide">
            "Mera Police kaun hai?!"
          </h2>

          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="text-3xl">{rajaPlayer.avatar}</span>
            <span className="text-xl font-sans font-black text-amber-400">
              {rajaPlayer.name} is RAJA!
            </span>
          </div>
          <span className="text-[11px] text-amber-300/80 font-mono font-bold block">
            Guaranteed Royal Bounty: +1,000 Pts
          </span>
        </div>

        {/* Hindi Proclamation Banner (Royal Decree) */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-amber-500/50 space-y-2 shadow-inner">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
            Hindi Royal Decree (Audio Dialogue)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
            "मेरा पुलिस कौन है?! पुलिस, चोर को पकड़ो!"
          </div>
          <p className="text-xs text-slate-300 italic">
            ("Who is my Police?! Police, catch the thief!")
          </p>

          {/* Voice Status Pill */}
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Raja is Speaking Dialogue (Playing Full Audio)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dialogue Completed in Full!</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleReplayVoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Replay Voice</span>
            </button>
          </div>
        </div>

        {/* CTA to Summon Police - Automatically or Manually once audio finishes */}
        <div className="pt-1">
          <button
            type="button"
            disabled={isSpeaking}
            onClick={() => {
              sound.playClick();
              safeProceed();
            }}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isSpeaking
                ? 'bg-slate-800/80 text-amber-300/80 border border-amber-500/30 cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            }`}
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-5 h-5 animate-pulse text-amber-400" />
                <span>Listening to Royal Proclamation...</span>
              </>
            ) : (
              <>
                <span>Summon Police to Investigate</span>
                <span className="text-xs font-mono font-normal opacity-80">({countdown}s)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
