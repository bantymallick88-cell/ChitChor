import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, Share2, Download, Crown, Link as LinkIcon, Scroll } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  onOpenRules: () => void;
  currentRoomId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRules, currentRoomId }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
    if (!next) {
      sound.playClick();
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
  };

  const handleShareApp = () => {
    sound.playClick();
    const shareUrl = currentRoomId
      ? `${window.location.origin}/?room=${currentRoomId}`
      : 'https://chitchor.fixeehub.com';

    const shareData = {
      title: 'ChitChor — Play Raja Rani Chor Police Online',
      text: 'Play the royal Indian paper chit game Raja Rani Chor Police online with friends or pass & play with 0 downloads!',
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0d14]/80 border-b border-amber-500/20 px-3 sm:px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Locked CHITCHOR Logo with Horizontal Alignment */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border border-yellow-200 flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950 fill-amber-950" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0d14]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-base sm:text-lg tracking-wider text-amber-400 leading-none">
                CHITCHOR
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 leading-tight">
                ROYAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block mt-0.5">
              Raja Rani Chor Police • <span className="text-amber-400/80">chitchor.fixeehub.com</span>
            </p>
          </div>
        </div>

        {/* Right: Share (🔗), How to Play (📜), and Sound (🔊) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {canInstall && (
            <button
              onClick={handleInstallApp}
              title="Install ChitChor PWA"
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install PWA</span>
            </button>
          )}

          {/* Share Button (🔗) */}
          <button
            onClick={handleShareApp}
            title={copiedLink ? "Link Copied!" : "Share Room Link (🔗)"}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all ${
              copiedLink
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-[#111827]/90 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-amber-400'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* How to Play (📜) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            title="How to Play Codex (📜)"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#111827]/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Sound Toggle (🔊) */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound (🔊)' : 'Mute Sound'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#111827]/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
