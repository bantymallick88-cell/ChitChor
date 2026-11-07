import React, { useState, useEffect } from 'react';
import type { GameMode, Player } from '../types/game';
import { Crown, Users, Play, Copy, MessageCircle, QrCode, X, UserPlus, Globe, KeyRound, Edit3, Shield, Sparkles, Check, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '../utils/audio';

const ROYAL_AVATARS = [
  { emoji: '👑', title: 'Maharaja' },
  { emoji: '🦚', title: 'Maharani' },
  { emoji: '🦁', title: 'Nawab' },
  { emoji: '🐯', title: 'Sultan' },
  { emoji: '🐘', title: 'Shehzada' },
  { emoji: '💎', title: 'Begum' },
  { emoji: '⚔️', title: 'Commander' },
  { emoji: '🛡️', title: 'Kotwal' },
];

interface LobbyProps {
  onStartOnlineHost: (name: string, avatar: string, mode: GameMode) => void;
  onJoinOnlineRoom: (roomCode: string, name: string, avatar: string) => void;
  onStartPassAndPlay: (players: Player[], mode: GameMode) => void;
  onOpenRules?: () => void;
  currentRoomId?: string | null;
  players?: Player[];
  isHost?: boolean;
  gameMode?: GameMode;
  onModeChange?: (mode: GameMode) => void;
  onAddBot?: () => void;
  onRemovePlayer?: (id: string) => void;
  onStartGame?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartOnlineHost,
  onJoinOnlineRoom,
  onStartPassAndPlay,
  onOpenRules,
  currentRoomId,
  players = [],
  isHost = false,
  gameMode = 'classic4',
  onModeChange,
  onAddBot,
  onRemovePlayer,
  onStartGame,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(ROYAL_AVATARS[0].emoji);
  const [playerName, setPlayerName] = useState('Player 1');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic4');

  // Custom Pass & Play player names modal
  const [showPassCustomizer, setShowPassCustomizer] = useState(false);
  const [customNames, setCustomNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

  // Modals for online host / join
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Sync customNames length with mode
  useEffect(() => {
    if (selectedMode === 'classic4') {
      setCustomNames((prev) => [
        prev[0] || 'Player 1',
        prev[1] || 'Player 2',
        prev[2] || 'Player 3',
        prev[3] || 'Player 4',
      ]);
    } else {
      setCustomNames((prev) => [
        prev[0] || 'Player 1',
        prev[1] || 'Player 2',
        prev[2] || 'Player 3',
        prev[3] || 'Player 4',
        prev[4] || 'Player 5',
      ]);
    }
  }, [selectedMode]);

  // Check URL params for room
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomCodeInput(roomParam.toUpperCase());
        setShowJoinModal(true);
      }
    }
  }, []);

  // Generate QR code for active room
  useEffect(() => {
    if (currentRoomId && typeof window !== 'undefined') {
      const joinUrl = `${window.location.origin}/?room=${currentRoomId}`;
      QRCode.toDataURL(joinUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [currentRoomId]);

  const requiredSlots = (currentRoomId ? gameMode : selectedMode) === 'classic4' ? 4 : 5;
  const isRoomFull = players.length === requiredSlots;

  const handleCopyLink = () => {
    sound.playClick();
    if (!currentRoomId) return;
    const url = `${window.location.origin}/?room=${currentRoomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    sound.playClick();
    if (!currentRoomId) return;
    const url = `${window.location.origin}/?room=${currentRoomId}`;
    const text = encodeURIComponent(
      `👑 You are summoned to ChitChor!\nJoin Royal Chamber #${currentRoomId} now:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const startPassAndPlayWithNames = (namesToUse: string[]) => {
    sound.playClick();
    const defaultAvatars = ['👑', '🦁', '💎', '⚔️', '🛡️'];
    const passPlayers: Player[] = namesToUse.map((n, i) => ({
      id: `p${i + 1}`,
      name: n.trim() || `Player ${i + 1}`,
      avatar: i === 0 ? selectedAvatar : defaultAvatars[i % defaultAvatars.length],
      isHost: i === 0,
      score: 0,
      roundScore: 0,
    }));
    onStartPassAndPlay(passPlayers, selectedMode);
  };

  // ================= 1. ACTIVE ROOM CHAMBER VIEW =================
  if (currentRoomId) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-xs rounded-2xl bg-[#0f172a]/95 border border-slate-700/60 p-6 shadow-2xl text-center space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  Scan to Join Court
                </span>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {qrCodeDataUrl && (
                <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                  <img src={qrCodeDataUrl} alt="Room QR Code" className="w-52 h-52 mx-auto rounded" />
                </div>
              )}

              <div>
                <div className="text-xs text-slate-400">Chamber Code:</div>
                <div className="text-3xl font-black font-mono tracking-widest text-amber-400">
                  {currentRoomId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Header Card - High-end frosted glassmorphism */}
        <div className="bg-[#131b2e]/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-5 text-center space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                Royal Chamber
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span>ONLINE PWA</span>
            </div>
          </div>

          <div className="py-1">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Share Chamber Code
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-amber-400 my-1 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {currentRoomId}
            </div>
          </div>

          {/* Quick Share Actions */}
          <div className="flex gap-2 justify-center pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Invite</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Pill Toggle */}
        <div className="p-3.5 rounded-2xl bg-[#131b2e]/60 backdrop-blur-xl border border-slate-700/50 flex justify-between items-center text-xs">
          <span className="text-slate-300 font-bold uppercase tracking-wider">Court Size:</span>
          {isHost ? (
            <div className="flex gap-1.5 bg-[#090d16]/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onModeChange?.('classic4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'classic4'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4 Players (Classic)
              </button>
              <button
                onClick={() => onModeChange?.('extended5')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'extended5'
                    ? 'bg-purple-600 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                5 Players (Katual)
              </button>
            </div>
          ) : (
            <span className="font-bold text-amber-400">
              {gameMode === 'classic4' ? '4-Player Classic' : '5-Player Extended'}
            </span>
          )}
        </div>

        {/* Player Slots */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Connected Courtiers ({players.length}/{requiredSlots})
            </span>
            {isHost && players.length < requiredSlots && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAddBot?.();
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/30 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Bot</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {Array.from({ length: requiredSlots }).map((_, index) => {
              const player = players[index];
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    player
                      ? 'bg-[#131b2e]/70 border-slate-700/60 shadow-md backdrop-blur-md'
                      : 'bg-[#0f172a]/40 border-dashed border-slate-800 text-slate-500'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1 bg-slate-800/50 rounded-lg">{player.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{player.name}</span>
                          {player.isHost && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-500/30">
                              HOST
                            </span>
                          )}
                          {player.isBot && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                              BOT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-bold">
                        {index + 1}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Waiting for friend to join court...
                      </span>
                    </div>
                  )}

                  {isHost && player && !player.isHost && (
                    <button
                      onClick={() => onRemovePlayer?.(player.id)}
                      className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Button (Primary Launch CTA) */}
        <div className="pt-2">
          {isHost ? (
            <button
              disabled={!isRoomFull}
              onClick={() => {
                sound.playClick();
                onStartGame?.();
              }}
              className={`w-full py-4 rounded-xl font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all ${
                isRoomFull
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800/70 text-slate-500 cursor-not-allowed border border-slate-700/60'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isRoomFull ? 'DEAL CHITS & START' : `Waiting for ${requiredSlots - players.length} more`}</span>
            </button>
          ) : (
            <div className="text-center py-3.5 text-xs text-slate-400 bg-[#131b2e]/60 rounded-xl border border-slate-800 backdrop-blur-md">
              Waiting for Host to deal the royal chits...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= 2. SUPER EASY & HUMAN-CENTRIC LOBBY UX =================
  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Custom Names Modal for Pass & Play */}
      {showPassCustomizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0f172a]/95 border border-slate-700/60 p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Player Names (Pass & Play)</span>
              </span>
              <button
                onClick={() => setShowPassCustomizer(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-left">
              {customNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-[#090d16] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl w-8 text-center">{i === 0 ? selectedAvatar : ['🦁', '💎', '⚔️', '🛡️'][i - 1]}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...customNames];
                      updated[i] = e.target.value;
                      setCustomNames(updated);
                    }}
                    placeholder={`Player ${i + 1}`}
                    maxLength={16}
                    className="flex-1 bg-transparent text-sm text-white font-medium outline-none placeholder-slate-600"
                  />
                </div>
              ))}
            </div>

            {/* Pass & Play Amber Gold CTA */}
            <button
              onClick={() => {
                setShowPassCustomizer(false);
                startPassAndPlayWithNames(customNames);
              }}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
            >
              Start Pass & Play Now
            </button>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xs rounded-2xl bg-[#0f172a]/95 border border-purple-500/40 p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Enter Room Code</span>
              </span>
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter the 4-letter chamber code shared by the host:
            </p>

            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g. 7K9J"
              autoFocus
              className="w-full bg-[#090d16] border-2 border-purple-500/60 focus:border-purple-400 rounded-xl px-4 py-3 text-center text-3xl font-mono font-black tracking-widest text-amber-300 uppercase outline-none transition-colors"
            />

            {/* Electric Purple/Violet CTA */}
            <button
              disabled={roomCodeInput.trim().length < 3}
              onClick={() => {
                sound.playClick();
                onJoinOnlineRoom(roomCodeInput.trim(), playerName.trim() || 'Player', selectedAvatar);
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg ${
                roomCodeInput.trim().length >= 3
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-purple-600/25 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Enter Chamber
            </button>
          </div>
        </div>
      )}

      {/* Main Frosted Glass Card: Character Avatar & Name */}
      <div className="bg-[#131b2e]/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Select Your Avatar:</span>
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            {ROYAL_AVATARS.find((a) => a.emoji === selectedAvatar)?.title || 'Courtier'}
          </span>
        </div>

        {/* Interactive Avatar Grid with Glowing Selection Rings */}
        <div className="grid grid-cols-4 gap-2">
          {ROYAL_AVATARS.map((item) => {
            const isSelected = selectedAvatar === item.emoji;
            return (
              <button
                key={item.emoji}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedAvatar(item.emoji);
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#090d16] bg-emerald-500/15 border border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-105'
                    : 'bg-[#0f172a]/70 border border-slate-800/80 hover:border-slate-600/80 hover:bg-[#1e293b]/50'
                }`}
              >
                <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
                <span className="text-[10px] font-semibold text-slate-300 mt-1 truncate max-w-full">
                  {item.title}
                </span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Name Input with Glass Styling */}
        <div className="pt-1 flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                const updated = [...customNames];
                updated[0] = e.target.value;
                setCustomNames(updated);
              }}
              maxLength={18}
              placeholder="Enter your court name..."
              className="w-full bg-[#090d16]/80 border border-slate-700/60 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassCustomizer(true)}
            title="Edit all 4/5 player names for pass & play"
            className="px-3 py-2.5 rounded-xl bg-[#090d16]/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Court Names</span>
          </button>
        </div>
      </div>

      {/* Simplified Mode Selection: Large visual cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Game Mode & Court Size:
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedMode === 'classic4' ? '4 Chits • 1,600 Pts' : '5 Chits • 3,100 Pts'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: 4-Player Classic (Golden Accent) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedMode('classic4');
            }}
            className={`p-3.5 rounded-2xl text-left transition-all duration-200 relative flex flex-col justify-between ${
              selectedMode === 'classic4'
                ? 'bg-[#131b2e]/90 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
                : 'bg-[#131b2e]/40 border border-slate-800 hover:border-slate-700 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>4-Player</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CLASSIC
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Raja, Rani, Sipahi & Chor
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Standard 1,600 Pts</span>
              {selectedMode === 'classic4' && (
                <span className="text-amber-400 font-bold">● Active</span>
              )}
            </div>
          </button>

          {/* Card 2: 5-Player Extended (Purple Katual Accent) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedMode('extended5');
            }}
            className={`p-3.5 rounded-2xl text-left transition-all duration-200 relative flex flex-col justify-between ${
              selectedMode === 'extended5'
                ? 'bg-[#131b2e]/90 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-[1.02]'
                : 'bg-[#131b2e]/40 border border-slate-800 hover:border-slate-700 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-purple-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>5-Player</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  KATUAL
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                + Katual (800 Pts) Commander
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Extended 3,100 Pts</span>
              {selectedMode === 'extended5' && (
                <span className="text-purple-400 font-bold">● Active</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons (Distinct Visual Hierarchy) */}
      <div className="space-y-3 pt-1">
        {/* PRIMARY LAUNCH CTA: High-glow Emerald Teal gradient */}
        <button
          onClick={() => {
            startPassAndPlayWithNames(customNames);
          }}
          className="w-full py-4 px-6 rounded-xl font-black text-base sm:text-lg tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY NOW (PASS & PLAY)</span>
        </button>

        {/* Secondary CTAs: Host Chamber (Sapphire Blue) & Join Room (Electric Purple) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Host Chamber: Vibrant Royal Sapphire Blue */}
          <button
            onClick={() => {
              sound.playClick();
              onStartOnlineHost(playerName.trim() || 'Host', selectedAvatar, selectedMode);
            }}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Host Chamber</span>
          </button>

          {/* Join Room: Electric Purple/Violet */}
          <button
            onClick={() => {
              sound.playClick();
              setShowJoinModal(true);
            }}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};
