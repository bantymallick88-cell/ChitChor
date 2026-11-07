import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Share2, Download, Crown, Scroll, Check } from 'lucide-react';
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
      text: 'Play the modern royal paper chit game Raja Rani Chor Police online with friends or pass & play with 0 downloads!',
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#090d16]/80 border-b border-slate-800/80 px-4 py-2.5 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-row items-center justify-between w-full flex-nowrap whitespace-nowrap gap-2 overflow-hidden">
        {/* Left Side: Logo Icon + "CHITCHOR" text inside flex items-center gap-2 my-auto shrink-0 */}
        <div className="flex items-center gap-2 my-auto shrink-0 whitespace-nowrap">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 border border-amber-300/70 shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform hover:scale-105">
            <Crown className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-950 fill-amber-950" />
            <div className="absolute -inset-0.5 rounded-xl bg-amber-400/20 blur-sm -z-10" />
          </div>

          <span className="font-sans font-black text-base sm:text-lg tracking-wider text-white leading-none whitespace-nowrap">
            CHITCHOR
          </span>

          {/* Minimalist Status Badge: Tiny glowing dot on mobile, "ONLINE PWA" on sm+ */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide shrink-0">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
            <span className="hidden sm:inline-flex whitespace-nowrap">ONLINE PWA</span>
          </div>
        </div>

        {/* Right Side: Action icons (Share 🔗, Rules 📜, Sound 🔊) inside flex items-center gap-1.5 shrink-0 my-auto */}
        <div className="flex items-center gap-1.5 shrink-0 my-auto flex-nowrap whitespace-nowrap">
          {canInstall && (
            <button
              onClick={handleInstallApp}
              title="Install ChitChor PWA"
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          {/* Share Button (🔗) */}
          <button
            onClick={handleShareApp}
            title={copiedLink ? 'Link Copied!' : 'Share Game / Room Link'}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border flex items-center justify-center gap-1.5 backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300 hidden md:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium hidden md:inline">Share</span>
              </>
            )}
          </button>

          {/* Rules / Codex Button (📜) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            title="How to Play Rules (📜)"
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border border-slate-700/60 text-slate-300 hover:text-amber-400 backdrop-blur-md shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-medium hidden md:inline">Rules</span>
          </button>

          {/* Sound Toggle Button (🔊) */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
