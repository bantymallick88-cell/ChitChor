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
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#090d16]/80 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Radiant Gold Crown Icon + CHITCHOR in modern bold sans-serif with sleek green ONLINE PWA status dot */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 border border-amber-300/70 flex-shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.45)] transition-transform hover:scale-105">
            <Crown className="w-5 h-5 text-amber-950 fill-amber-950" />
            <div className="absolute -inset-0.5 rounded-xl bg-amber-400/20 blur-sm -z-10" />
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-lg sm:text-xl tracking-wider text-white leading-none">
                  CHITCHOR
                </span>
                {/* Sleek Green "ONLINE PWA" status dot */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <span>ONLINE PWA</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight truncate hidden sm:block mt-0.5">
                Raja Rani Chor Police • <span className="text-emerald-400/80">chitchor.fixeehub.com</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean flex row with Share (🔗), Sound Toggle (🔊), and Rules (📜) icons grouped in tactile glass pill buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canInstall && (
            <button
              onClick={handleInstallApp}
              title="Install ChitChor PWA"
              className="h-9 px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install PWA</span>
            </button>
          )}

          {/* Share Button (🔗) */}
          <button
            onClick={handleShareApp}
            title={copiedLink ? 'Link Copied!' : 'Share Game / Room Link'}
            className={`h-9 px-3 rounded-full border flex items-center justify-center gap-1.5 backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">Share</span>
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
            className="h-9 px-3 rounded-full bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border border-slate-700/60 text-slate-300 hover:text-amber-400 backdrop-blur-md shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium hidden sm:inline">Rules</span>
          </button>

          {/* Sound Toggle Button (🔊) */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="h-9 w-9 rounded-full bg-[#131b2e]/70 hover:bg-[#1e293b]/90 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
