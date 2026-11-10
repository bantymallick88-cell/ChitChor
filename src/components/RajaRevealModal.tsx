import React, { useEffect, useState } from 'react';
import type { Player } from '../types/game';
import { Crown, Volume2, ArrowRight, Sparkles, Shield, Mic } from 'lucide-react';
import { sound } from '../utils/audio';

interface RajaRevealModalProps {
  rajaPlayer: Player;
  onProceed: () => void;
  autoAdvanceSeconds?: number;
}

export const RajaRevealModal: React.FC<RajaRevealModalProps> = ({
  rajaPlayer,
  onProceed,
  autoAdvanceSeconds = 6,
}) => {
  const [countdown, setCountdown] = useState(autoAdvanceSeconds);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const isSpeakingRef = React.useRef(true);

  useEffect(() => {
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    sound.playRoyalFanfare();

    sound.playRajaVoice('मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!', () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    });

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // If speech is still ongoing, do not cut off! Hold until speaking finishes.
          if (isSpeakingRef.current) {
            return 1;
          }
          clearInterval(interval);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onProceed]);

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.unlockAudioAndSpeech();
    sound.playClick();
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setCountdown(autoAdvanceSeconds); // Extend countdown so replay audio finishes completely
    sound.playRajaVoice(
      'मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!',
      () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      },
      true // force restart for replay
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1a233b] via-[#131b2e] to-[#090d16] border-2 border-amber-400/80 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] space-y-6 text-center my-auto">
        {/* Crown & Royal Aura */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-500/20 to-amber-600/20 blur-md" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-2 border-yellow-200 flex items-center justify-center shadow-xl shadow-amber-500/40">
            <Crown className="w-10 h-10 text-amber-950 fill-amber-950 animate-bounce" />
          </div>
        </div>

        {/* Phase Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
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
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-amber-500/40 space-y-2 shadow-inner">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
            Hindi Royal Decree
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
            "मेरा पुलिस कौन है?! पुलिस, चोर को पकड़ो!"
          </div>
          <p className="text-xs text-slate-300 italic">
            ("Who is my Police?! Police, catch the thief!")
          </p>

          <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReplayVoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm relative z-30 pointer-events-auto"
            >
              <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Playing Voice (AI Speech)...' : 'Replay Voice (AI Speech)'}</span>
            </button>
          </div>
        </div>

        {/* CTA to Summon Police */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudioAndSpeech();
              sound.playClick();
              sound.playRajaVoice('मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!');
              onProceed();
            }}
            className="w-full py-4 px-6 rounded-xl font-black text-base tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer relative z-30 pointer-events-auto"
          >
            <span>Summon Police to Investigate</span>
            <span className="text-xs font-mono font-normal opacity-80">({countdown}s)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
