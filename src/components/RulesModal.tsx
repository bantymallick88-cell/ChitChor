import React from 'react';
import { X, BookOpen, Crown, Sparkles, ShieldCheck, ShieldAlert, Footprints, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#141720] via-[#0d1017] to-[#0a0d14] border-2 border-amber-500/30 p-6 shadow-2xl royal-glow space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-serif font-black text-amber-300">
              ChitChor Royal Codex & Rules
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed">
          {/* Origins */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
            <h4 className="font-bold text-amber-300 text-sm">
              The Heritage of Raja Rani Chor Sipahi
            </h4>
            <p className="text-zinc-300">
              ChitChor modernizes the beloved Indian paper-slip parlour game played across generations with handwritten slips tossed into the air. Now reborn as a 3D digital multiplayer experience with authentic scoring rules!
            </p>
          </div>

          {/* Mode A: 4-Player Classic */}
          <div className="space-y-2 border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">Mode A: 4-Player Classic</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                Total 1,600 Pts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-black/40 p-2.5 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Crown className="w-3.5 h-3.5" /> Raja (King)
                </div>
                <div className="text-amber-200 font-mono font-bold mt-1">1,000 Pts</div>
                <div className="text-[10px] text-zinc-400">Guaranteed royal tribute.</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-pink-500/20">
                <div className="flex items-center gap-1.5 text-pink-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Rani (Queen)
                </div>
                <div className="text-pink-200 font-mono font-bold mt-1">500 Pts</div>
                <div className="text-[10px] text-zinc-400">Honored sovereign.</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sipahi (Police)
                </div>
                <div className="text-emerald-200 font-mono font-bold mt-1">100 Pts</div>
                <div className="text-[10px] text-zinc-400">Must catch the thief!</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Footprints className="w-3.5 h-3.5" /> Chor (Thief)
                </div>
                <div className="text-red-300 font-mono font-bold mt-1">0 Pts (Base)</div>
                <div className="text-[10px] text-zinc-400">Steals 100 pts if not caught!</div>
              </div>
            </div>
          </div>

          {/* Mode B: 5-Player Extended */}
          <div className="space-y-2 border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">Mode B: 5-Player Extended</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                Total 2,300 Pts
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-amber-300 font-semibold">👑 Raja:</span>
                <span className="font-mono text-amber-400 font-bold">1,000 Pts</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-pink-300 font-semibold">💎 Rani:</span>
                <span className="font-mono text-pink-400 font-bold">700 Pts</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-purple-300 font-semibold">🛡️ Katual (Commander):</span>
                <span className="font-mono text-purple-400 font-bold">500 Pts</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-emerald-300 font-semibold">⚔️ Sipahi:</span>
                <span className="font-mono text-emerald-400 font-bold">100 Pts</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-red-400 font-semibold">🎭 Chor:</span>
                <span className="font-mono text-red-400 font-bold">0 Pts (Steals 100 on wrong guess)</span>
              </div>
            </div>
          </div>

          {/* The Investigation Phase Rules */}
          <div className="space-y-2 border border-amber-500/30 bg-amber-950/20 p-4 rounded-xl">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4" /> The Interrogation Rule
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
              <li>
                Chits are dealt face-down. Each player secretly unfolds their 3D chit.
              </li>
              <li>
                Raja loudly proclaims: <strong>"Mera Sipahi Kaun Hai?!"</strong>
              </li>
              <li>
                The player with the <strong>Sipahi</strong> chit stands forward.
              </li>
              <li>
                Sipahi must examine the suspects (unrevealed players) and accuse one of being the <strong>Chor</strong>.
              </li>
              <li>
                <strong>If Sipahi is Correct:</strong> Sipahi retains their <strong>100 Pts</strong> bounty. Chor gets 0.
              </li>
              <li>
                <strong>If Sipahi is Wrong:</strong> Sipahi receives <strong>0 Pts</strong>, and the hidden Chor steals the entire <strong>+100 Pts</strong> bounty!
              </li>
            </ol>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};

