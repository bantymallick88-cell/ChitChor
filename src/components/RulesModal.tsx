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
      <div className="relative w-full max-w-xl rounded-2xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-sans font-black text-white">
              ChitChor Royal Rules Codex
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed font-medium">
          {/* Quick Explainer */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
            <h4 className="font-bold text-emerald-300 text-sm">
              Quick Overview (Raja Rani Chor Sipahi)
            </h4>
            <p className="text-slate-300">
              Each player draws a secret folded paper chit. Raja cries <em>"Mera Sipahi Kaun Hai?!"</em>, Sipahi steps forward, and must guess who among the remaining court holds the Chor chit!
            </p>
          </div>

          {/* Mode A: 4-Player Classic */}
          <div className="space-y-2 border border-slate-800 bg-[#111827] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">Mode A: 4-Player Classic</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                1,600 Pts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Crown className="w-3.5 h-3.5" /> Raja (King)
                </div>
                <div className="text-amber-300 font-mono font-black mt-1">1,000 Pts</div>
                <div className="text-[10px] text-slate-400">Guaranteed royal tribute.</div>
              </div>
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-rose-500/30">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Rani (Queen)
                </div>
                <div className="text-rose-300 font-mono font-black mt-1">500 Pts</div>
                <div className="text-[10px] text-slate-400">Honored sovereign.</div>
              </div>
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sipahi (Police)
                </div>
                <div className="text-cyan-300 font-mono font-black mt-1">100 Pts</div>
                <div className="text-[10px] text-slate-400">Finds the thief (+100 or 0).</div>
              </div>
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Footprints className="w-3.5 h-3.5" /> Chor (Thief)
                </div>
                <div className="text-red-300 font-mono font-black mt-1">0 Pts Base</div>
                <div className="text-[10px] text-slate-400">Steals 100 pts on wrong guess!</div>
              </div>
            </div>
          </div>

          {/* Mode B: 5-Player Extended */}
          <div className="space-y-2 border border-slate-800 bg-[#111827] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 text-sm">Mode B: 5-Player Extended</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                2,300 Pts
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between bg-[#0f172a] p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold">👑 Raja:</span>
                <span className="font-mono text-amber-300 font-bold">1,000 Pts</span>
              </div>
              <div className="flex justify-between bg-[#0f172a] p-2 rounded border border-slate-800">
                <span className="text-rose-400 font-bold">💎 Rani:</span>
                <span className="font-mono text-rose-300 font-bold">700 Pts</span>
              </div>
              <div className="flex justify-between bg-[#0f172a] p-2 rounded border border-slate-800">
                <span className="text-purple-400 font-bold">🛡️ Katual (Commander):</span>
                <span className="font-mono text-purple-300 font-bold">500 Pts</span>
              </div>
              <div className="flex justify-between bg-[#0f172a] p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">⚔️ Sipahi:</span>
                <span className="font-mono text-cyan-300 font-bold">100 Pts</span>
              </div>
              <div className="flex justify-between bg-[#0f172a] p-2 rounded border border-slate-800">
                <span className="text-red-400 font-bold">🎭 Chor:</span>
                <span className="font-mono text-red-300 font-bold">0 Pts (Steals 100 on wrong guess)</span>
              </div>
            </div>
          </div>

          {/* Scoring Logic */}
          <div className="space-y-1.5 border border-cyan-500/30 bg-cyan-950/20 p-4 rounded-xl">
            <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" /> The Investigation Rules
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong>Sipahi Guesses Correctly:</strong> Sipahi retains their <strong>100 Pts</strong>. Chor receives <strong>0 Pts</strong>.
              </li>
              <li>
                <strong>Sipahi Guesses Wrong:</strong> Sipahi gets <strong>0 Pts</strong>, and the hidden Chor steals the full <strong>100 Pts</strong> bounty!
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
