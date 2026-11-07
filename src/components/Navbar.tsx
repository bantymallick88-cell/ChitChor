import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, Share2, Download, Crown, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRules }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

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
    const shareData = {
      title: 'ChitChor - The Modern Royal Paper Chit Game',
      text: 'Play the legendary Indian royal paper chit game Raja Rani Chor Sipahi online with friends or pass & play!',
      url: window.location.origin,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard! Share it with your friends.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0d14]/80 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center royal-glow">
            <Crown className="w-5 h-5 text-amber-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black text-lg tracking-wider text-amber-300">
                CHITCHOR
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                ROYAL PWA
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              The Modern Royal Paper Chit Game • <span className="text-amber-400/80">chitchor.fixeehub.com</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              onClick={handleInstallApp}
              title="Install ChitChor PWA"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Install PWA</span>
            </button>
          )}

          <button
            onClick={handleShareApp}
            title="Share Game"
            className="w-9 h-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-300 flex items-center justify-center transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            title="Royal Codex / Rules"
            className="w-9 h-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-300 flex items-center justify-center transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-300 flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
