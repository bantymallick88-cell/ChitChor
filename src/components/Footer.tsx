import React, { useState } from 'react';
import { ShieldCheck, Mail, Share2, MessageCircle, ExternalLink, X, Heart, Globe, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface FooterProps {
  currentRoomId?: string | null;
  onOpenRules: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentRoomId, onOpenRules }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleWhatsAppShare = () => {
    sound.playClick();
    const shareUrl = currentRoomId
      ? `${window.location.origin}/?room=${currentRoomId}`
      : 'https://chitchor.fixeehub.com';

    const message = encodeURIComponent(
      `👑 Hey! Let's play Raja Rani Chor Police online on ChitChor!\n` +
      `It's 100% free with 3D paper chits, no login & zero app download needed.\n` +
      `Tap here to play now: ${shareUrl}`
    );

    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <>
      {/* ================= PRIVACY POLICY MODAL ================= */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border-2 border-slate-700 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-lg text-white">
                  Privacy Policy • ChitChor
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>Last Updated: 2026</strong> — At <strong>ChitChor</strong> (a FixeeHub product), we respect and protect your privacy above all else.
              </p>
              <div className="bg-[#111827] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-emerald-400">1. Zero Personal Data Collected</h4>
                <p>
                  ChitChor does not require account creation, email addresses, phone numbers, or passwords. Your chosen nickname and avatar exist solely during your live session.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400">2. Direct Peer-to-Peer Networking</h4>
                <p>
                  Multiplayer game state synchronization utilizes encrypted WebRTC connections. No chit assignments, scores, or secret roles are recorded on central databases.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400">3. Local Storage</h4>
                <p>
                  We only store your sound volume preference (muted/unmuted) locally in your device's browser memory. No tracking or marketing cookies are deployed.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-purple-400">4. Contact & Compliance</h4>
                <p>
                  For any privacy inquiries or suggestions, reach us directly at{' '}
                  <a href="mailto:contact@fixeehub.com" className="text-emerald-400 underline">
                    contact@fixeehub.com
                  </a>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* ================= CONTACT SUPPORT MODAL ================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0f172a] border-2 border-slate-700 p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <h3 className="font-serif font-bold text-lg text-white">Contact Support</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Need assistance, have feature ideas, or want to partner with the FixeeHub team? We would love to hear from you!
            </p>

            <div className="bg-[#111827] p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Direct Email Support
              </div>
              <a
                href="mailto:contact@fixeehub.com"
                className="text-emerald-400 font-mono font-bold text-sm hover:underline block"
              >
                contact@fixeehub.com
              </a>
              <span className="text-[10px] text-slate-500 block">
                Typical reply within 24 hours
              </span>
            </div>

            <a
              href="mailto:contact@fixeehub.com?subject=ChitChor%20Feedback%20%26%20Support"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support Team</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= INLINE SLEEK FOOTER ================= */}
      <footer className="w-full border-t border-amber-500/20 bg-[#0a0d14]/90 backdrop-blur-md mt-auto py-5 px-4 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Quick Viral WhatsApp Share Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0f172a] to-blue-950/40 border border-emerald-500/30">
            <div className="text-center sm:text-left">
              <div className="font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Invite friends to your court</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Play Raja Rani Chor Police on any phone with 0 downloads!
              </p>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>🚀 Share Game with Friends on WhatsApp</span>
            </button>
          </div>

          {/* Links & Ecosystem Badge Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            {/* Copyright & Brand */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-serif font-black text-amber-400 tracking-wider">CHITCHOR</span>
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <span>The Modern Royal Paper Chit Game</span>
            </div>

            {/* FixeeHub Ecosystem Badge */}
            <a
              href="https://fixeehub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 text-[11px] font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Part of FixeeHub Workspace network</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            {/* Navigation & Legal Links */}
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <button
                onClick={onOpenRules}
                className="hover:text-amber-400 transition-colors"
              >
                📜 Rules
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="hover:text-blue-400 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

