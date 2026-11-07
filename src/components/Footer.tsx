import React, { useState } from 'react';
import { ShieldCheck, Mail, Share2, MessageCircle, ExternalLink, X, Globe, Sparkles, Heart } from 'lucide-react';
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
          <div className="relative w-full max-w-lg rounded-2xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-lg text-white">
                  Privacy Policy • ChitChor
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>Last Updated: 2026</strong> — At <strong>ChitChor</strong> (a FixeeHub product), your privacy is our highest priority.
              </p>
              <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-emerald-400">1. Zero Personal Data Collected</h4>
                <p className="text-slate-400">
                  ChitChor does not require account creation, email addresses, phone numbers, or passwords. Your chosen nickname and avatar exist solely during your live session.
                </p>
              </div>

              <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400">2. Direct Peer-to-Peer Networking</h4>
                <p className="text-slate-400">
                  Multiplayer game state synchronization utilizes encrypted WebRTC connections. No chit assignments, scores, or secret roles are recorded on central databases.
                </p>
              </div>

              <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400">3. Local Storage</h4>
                <p className="text-slate-400">
                  We only store your sound volume preference (muted/unmuted) locally in your device's browser memory. No tracking cookies are used.
                </p>
              </div>

              <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-purple-400">4. Contact & Compliance</h4>
                <p className="text-slate-400">
                  For privacy inquiries or suggestions, reach us directly at{' '}
                  <a href="mailto:contact@fixeehub.com" className="text-emerald-400 underline font-semibold">
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
          <div className="relative w-full max-w-sm rounded-2xl bg-[#131b2e]/95 backdrop-blur-2xl border border-slate-700/60 p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <h3 className="font-sans font-bold text-lg text-white">Contact Support</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Need assistance, have feature ideas, or want to partner with the FixeeHub team? We would love to hear from you!
            </p>

            <div className="bg-[#090d16]/80 p-4 rounded-xl border border-slate-800 space-y-2">
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support Team</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= EXPLICIT FOOTER ================= */}
      <footer className="w-full border-t border-slate-800/80 bg-[#090d16]/80 backdrop-blur-2xl mt-auto py-6 px-4 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Quick Viral WhatsApp Share Bar (Frosted Glass Container) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#131b2e]/60 backdrop-blur-xl border border-slate-700/50 shadow-xl">
            <div className="text-center sm:text-left">
              <div className="font-bold text-white flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Invite friends to your royal court</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Play Raja Rani Chor Police on any phone or browser with 0 downloads!
              </p>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Share</span>
            </button>
          </div>

          {/* Explicit 3-part layout: Left, Middle, Right */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-center lg:text-left">
            {/* Left: ChitChor © 2026 — Reimagining Royal Paper Chit Games for the Web. */}
            <div className="text-[11px] text-slate-400">
              <span>ChitChor © 2026 — Reimagining Royal Paper Chit Games for the Web.</span>
            </div>

            {/* Middle: Part of the FixeeHub Ecosystem network. */}
            <div>
              <a
                href="https://fixeehub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131b2e]/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-emerald-500/40 text-[11px] font-medium transition-colors group"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Part of the FixeeHub Ecosystem network.</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            {/* Right: Interactive links for "Privacy Policy", "Contact Support (contact@fixeehub.com)", and "WhatsApp Share" */}
            <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-300 leading-normal">
              <button
                onClick={onOpenRules}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                📜 Rules
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Contact Support (contact@fixeehub.com)
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>WhatsApp Share</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
