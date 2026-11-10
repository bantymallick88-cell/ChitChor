import React, { useState, useEffect } from 'react';
import type { GameMode, Player } from '../types/game';
import { Crown, Users, Bot, Play, Copy, MessageCircle, QrCode, X, UserPlus, Globe, KeyRound, Edit3, Sparkles, Check, Sliders, Dices, Layers } from 'lucide-react';
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
  onStartOnlineHost: (name: string, avatar: string, mode: GameMode, totalRounds?: number) => void;
  onJoinOnlineRoom: (roomCode: string, name: string, avatar: string) => void;
  onStartPassAndPlay: (players: Player[], mode: GameMode, totalRounds?: number) => void;
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

  // Button 1: Mode Toggle -> 'ai_bots' vs 'custom_players'
  const [playModeType, setPlayModeType] = useState<'ai_bots' | 'custom_players'>('ai_bots');

  // Button 2: Player & Round Config
  // Total players: 1 to 5 members
  const [memberCount, setMemberCount] = useState<number>(4);
  // Round count customization: 1 to 10 rounds (default 3)
  const [roundCount, setRoundCount] = useState<number>(3);

  // Custom Pass & Play player names modal
  const [showPassCustomizer, setShowPassCustomizer] = useState(false);
  const [customNames, setCustomNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
    'Player 5',
  ]);

  // Modals for online host / join
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Mode derived from memberCount
  const effectiveMode: GameMode = memberCount === 5 ? 'extended5' : 'classic4';

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

  const requiredSlots = (currentRoomId ? gameMode : effectiveMode) === 'classic4' ? 4 : 5;
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

  const handleLaunchGame = () => {
    sound.unlockAudioAndSpeech();
    sound.playClick();

    const totalSlots = memberCount === 5 ? 5 : 4;
    const humanCount = playModeType === 'ai_bots' ? 1 : Math.min(memberCount, totalSlots);
    const botCount = totalSlots - humanCount;

    const defaultAvatars = ['👑', '💎', '⚔️', '🛡️', '🦚'];
    const botPool = [
      { name: 'Bot Birbal 🤖', avatar: '🦁' },
      { name: 'Bot Tenali 🤖', avatar: '🐯' },
      { name: 'Bot Vikram 🤖', avatar: '🐘' },
      { name: 'Bot Betal 🤖', avatar: '💎' },
      { name: 'Bot Chanakya 🤖', avatar: '⚔️' },
    ];

    const humanPlayers: Player[] = Array.from({ length: humanCount }).map((_, i) => ({
      id: `p${i + 1}`,
      name: i === 0 ? (playerName.trim() || 'You') : (customNames[i]?.trim() || `Player ${i + 1}`),
      avatar: i === 0 ? selectedAvatar : defaultAvatars[i % defaultAvatars.length],
      isHost: i === 0,
      isBot: false,
      score: 0,
      roundScore: 0,
    }));

    const botPlayers: Player[] = Array.from({ length: botCount }).map((_, i) => ({
      id: `bot-${i + 1}`,
      name: botPool[i % botPool.length].name,
      avatar: botPool[i % botPool.length].avatar,
      isHost: false,
      isBot: true,
      score: 0,
      roundScore: 0,
    }));

    onStartPassAndPlay([...humanPlayers, ...botPlayers], effectiveMode, roundCount);
  };

  // ================= 1. ACTIVE ROOM CHAMBER VIEW (ONLINE PWA) =================
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

        {/* Room Header Card */}
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
                5 Players (Katual +500)
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

        {/* Start Game Button */}
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

  // ================= 2. STREAMLINED SETUP UI WITH 2 MAIN CONTROLS =================
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
              {Array.from({ length: memberCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-[#090d16] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl w-8 text-center">{i === 0 ? selectedAvatar : ['🦁', '💎', '⚔️', '🛡️', '🦚'][i - 1]}</span>
                  <input
                    type="text"
                    value={customNames[i] || `Player ${i + 1}`}
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

            <button
              onClick={() => {
                setShowPassCustomizer(false);
                handleLaunchGame();
              }}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
            >
              Start Game Now
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

        {/* Interactive Avatar Grid */}
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
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${
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

        {/* Compact Name Input */}
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
          {playModeType === 'custom_players' && (
            <button
              type="button"
              onClick={() => setShowPassCustomizer(true)}
              title="Edit all player names"
              className="px-3 py-2.5 rounded-xl bg-[#090d16]/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Names</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= BUTTON 1: MODE TOGGLE ================= */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Button 1: Select Game Mode</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">
            {playModeType === 'ai_bots' ? 'Instant AI Bots' : 'Friends & Pass & Play'}
          </span>
        </div>

        {/* 2 Clean Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Option A: AI Bots vs Player */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlayModeType('ai_bots');
            }}
            className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
              playModeType === 'ai_bots'
                ? 'border-2 border-emerald-500 bg-emerald-500/15 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/30 scale-[1.01]'
                : 'border border-slate-700/60 bg-[#131b2e]/50 hover:border-slate-600 hover:bg-[#131b2e]/80 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                <Bot className="w-3 h-3" />
                <span>Solo Mode</span>
              </span>
              {playModeType === 'ai_bots' && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                AI Bots vs Player
              </h3>
              <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                Play instantly with smart AI bots. Zero waiting!
              </p>
            </div>
          </button>

          {/* Option B: Custom Players */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlayModeType('custom_players');
            }}
            className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
              playModeType === 'custom_players'
                ? 'border-2 border-blue-500 bg-blue-500/15 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/30 scale-[1.01]'
                : 'border border-slate-700/60 bg-[#131b2e]/50 hover:border-slate-600 hover:bg-[#131b2e]/80 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                <Users className="w-3 h-3" />
                <span>Multiplayer</span>
              </span>
              {playModeType === 'custom_players' && (
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                Custom Players
              </h3>
              <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                Pass & Play on 1 phone or host online chamber.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ================= BUTTON 2: PLAYER & ROUND CONFIG ================= */}
      <div className="p-4 rounded-2xl bg-[#131b2e]/60 backdrop-blur-xl border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Button 2: Player & Round Config</span>
          </span>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            {memberCount} Members • {roundCount} {roundCount === 1 ? 'Round' : 'Rounds'}
          </span>
        </div>

        {/* 1. Total Players Selector (1 to 5 members) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Court Players:</span>
            </span>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {playModeType === 'ai_bots'
                ? `You + ${memberCount - 1} AI Bots`
                : `${memberCount} Human Players`}
            </span>
          </div>

          {/* Quick Segmented Buttons: 1 to 5 */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = memberCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMemberCount(num);
                  }}
                  className={`py-2 px-1 rounded-xl font-black text-xs transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-105 border border-cyan-300'
                      : 'bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{num === 1 ? '👤' : num === 5 ? '💎' : '👥'}</span>
                  <span>{num} {num === 1 ? 'P' : 'P'}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Helper Note */}
          <div className="text-[10px] text-slate-400 bg-[#090d16]/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>
              {memberCount === 5
                ? '👑 Extended 5-Courtier Game: Raja, Rani, Katual, Sipahi, Chor'
                : memberCount === 4
                ? '👑 Classic 4-Courtier Game: Raja, Rani, Sipahi, Chor'
                : `⚡ Fast Court (${memberCount} Human + ${4 - memberCount} Bots to complete 4-courtier match)`}
            </span>
            <span className="font-bold text-amber-400 shrink-0 ml-1">
              {memberCount === 5 ? '+Katual 500 Pts' : '1,600 Pts'}
            </span>
          </div>
        </div>

        {/* 2. Round Count Customization (1 to 10 rounds) */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Tournament Length (Rounds):</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {roundCount} {roundCount === 1 ? 'Round (Quick)' : `${roundCount} Rounds`}
            </span>
          </div>

          {/* Slider for smooth 1 to 10 customization */}
          <div className="px-1 py-1">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={roundCount}
              onChange={(e) => setRoundCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>1 Round</span>
              <span>3 Rnds</span>
              <span>5 Rnds</span>
              <span>10 Rnds</span>
            </div>
          </div>

          {/* Quick Round Chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[1, 3, 5, 10].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRoundCount(r);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roundCount === r
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r === 1 ? '1 Blitz' : r === 3 ? '3 Classic' : r === 5 ? '5 Champs' : '10 Epic'}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplayer Quick Actions (Only when Custom Players is selected) */}
        {playModeType === 'custom_players' && (
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartOnlineHost(playerName.trim() || 'Host', selectedAvatar, effectiveMode, roundCount);
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Host Online Chamber</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowJoinModal(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Join Room Code 🔑</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= PRIMARY LAUNCH CTA ================= */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleLaunchGame}
          className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider uppercase bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current animate-pulse" />
          <span>
            {playModeType === 'ai_bots'
              ? `DEAL & PLAY SOLO (${roundCount} ROUNDS 🚀)`
              : `START PASS & PLAY (${memberCount} PLAYERS • ${roundCount} RNDS 👑)`}
          </span>
        </button>
      </div>
    </div>
  );
};
