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
      text: 'Play the royal paper chit game Raja Rani Chor Sipahi online or pass & play!',
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0b0f19]/90 border-b border-slate-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 border border-yellow-200 flex items-center justify-center shadow-md">
            <Crown className="w-5 h-5 text-amber-950" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0f19]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black text-base sm:text-lg tracking-wider text-amber-400">
                CHITCHOR
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Royal Paper Chit Game • <span className="text-slate-300">chitchor.fixeehub.com</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              onClick={handleInstallApp}
              title="Install ChitChor PWA"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install PWA</span>
            </button>
          )}

          <button
            onClick={handleShareApp}
            title="Share Game"
            className="w-9 h-9 rounded-xl bg-[#111827] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            title="Rules & How to Play"
            className="w-9 h-9 rounded-xl bg-[#111827] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 rounded-xl bg-[#111827] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
