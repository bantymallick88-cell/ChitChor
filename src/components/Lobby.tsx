import React, { useState, useEffect } from 'react';
import type { GameMode, Player } from '../types/game';
import { Crown, Users, Smartphone, Play, Copy, MessageCircle, QrCode, X, HelpCircle, UserPlus, Globe, KeyRound } from 'lucide-react';
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
  const [playerName, setPlayerName] = useState('Maharaja ' + Math.floor(10 + Math.random() * 90));
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic4');
  
  // Modals for online host / join
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

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
          dark: '#0284c7',
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

  // ---------------- ACTIVE ROOM CHAMBER VIEW ----------------
  if (currentRoomId) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-xs rounded-2xl bg-[#0f172a] border-2 border-blue-500/50 p-6 shadow-2xl text-center space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  Scan to Join Court
                </span>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
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
                <div className="text-xs text-slate-400">Room Code:</div>
                <div className="text-3xl font-black font-mono tracking-widest text-blue-400">
                  {currentRoomId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Header Card */}
        <div className="rounded-2xl p-5 bg-[#111827] border-2 border-blue-500/40 shadow-xl text-center space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Chamber Code
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>

          <div className="text-4xl font-black font-mono tracking-widest text-amber-400 my-1">
            {currentRoomId}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 justify-center pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Invite</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>QR</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Pill Toggle */}
        <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold uppercase">Court Size:</span>
          {isHost ? (
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => onModeChange?.('classic4')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  gameMode === 'classic4'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Players
              </button>
              <button
                onClick={() => onModeChange?.('extended5')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  gameMode === 'extended5'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                5 Players
              </button>
            </div>
          ) : (
            <span className="font-bold text-blue-400">
              {gameMode === 'classic4' ? '4-Player Classic' : '5-Player Extended'}
            </span>
          )}
        </div>

        {/* Player Slots */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Players ({players.length}/{requiredSlots})
            </span>
            {isHost && players.length < requiredSlots && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAddBot?.();
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30"
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
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    player
                      ? 'bg-[#111827] border-slate-700 shadow-md'
                      : 'bg-[#0f172a]/50 border-dashed border-slate-800 text-slate-600'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.isHost && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold border border-blue-500/40">
                              HOST
                            </span>
                          )}
                          {player.isBot && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                              BOT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-bold">
                        {index + 1}
                      </div>
                      <span className="text-xs text-slate-500">
                        Waiting for player to connect...
                      </span>
                    </div>
                  )}

                  {isHost && player && !player.isHost && (
                    <button
                      onClick={() => onRemovePlayer?.(player.id)}
                      className="text-xs text-slate-500 hover:text-red-400 px-2 py-1"
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
              className={`w-full py-4 rounded-2xl font-extrabold text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
                isRoomFull
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isRoomFull ? 'DEAL CHITS & PLAY' : `Waiting for ${requiredSlots - players.length} more`}</span>
            </button>
          ) : (
            <div className="text-center py-3 text-xs text-slate-400 bg-[#111827] rounded-xl border border-slate-800">
              Host will start the game once everyone joins...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- ULTRA-SIMPLE MAIN LOBBY SCREEN ----------------
  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Join Modal Popup */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xs rounded-2xl bg-[#0f172a] border-2 border-purple-500/50 p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Enter Room Code</span>
              </span>
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g. 7K9J"
              className="w-full bg-black/70 border-2 border-purple-500/60 focus:border-purple-400 rounded-xl px-4 py-3 text-center text-2xl font-mono font-black tracking-widest text-amber-300 uppercase outline-none"
            />

            <button
              disabled={roomCodeInput.trim().length < 3}
              onClick={() => {
                sound.playClick();
                onJoinOnlineRoom(roomCodeInput.trim(), playerName.trim() || 'Player', selectedAvatar);
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg ${
                roomCodeInput.trim().length >= 3
                  ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Enter Room
            </button>
          </div>
        </div>
      )}

      {/* Visual Title & Help Icon */}
      <div className="text-center relative">
        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
          CHITCHOR
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          The Modern Royal Paper Chit Game
        </p>

        {/* Small ❓ Help Button */}
        <button
          onClick={onOpenRules}
          title="How to Play"
          className="absolute right-1 top-1 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* 1. Large Character Avatar Selector (Visual Grid) */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Choose Character:
          </span>
          <span className="text-xs font-semibold text-amber-400">
            {ROYAL_AVATARS.find((a) => a.emoji === selectedAvatar)?.title || 'Courtier'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
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
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-2 border-amber-400 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-[#0f172a] border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-[10px] font-semibold text-slate-300 mt-1 truncate max-w-full">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Name Input */}
        <div className="pt-1">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={18}
            placeholder="Your name..."
            className="w-full bg-[#0a0f1d] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. Mode Selector Pills directly above Play Button */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Court Size:
          </span>
          <span className="text-[11px] text-slate-500">
            {selectedMode === 'classic4' ? 'Raja, Rani, Sipahi, Chor' : '+ Katual Commander'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedMode('classic4');
            }}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              selectedMode === 'classic4'
                ? 'bg-slate-800 border-2 border-emerald-400 text-emerald-300 shadow-md'
                : 'bg-[#111827] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>4 Players</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedMode('extended5');
            }}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              selectedMode === 'extended5'
                ? 'bg-slate-800 border-2 border-emerald-400 text-emerald-300 shadow-md'
                : 'bg-[#111827] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-purple-400" />
            <span>5 Players</span>
          </button>
        </div>
      </div>

      {/* 3. HUGE VIBRANT GREEN CTA BUTTON: PLAY NOW */}
      <div className="space-y-3 pt-1">
        <button
          onClick={() => {
            sound.playClick();
            const defaultPassPlayers: Player[] = (selectedMode === 'classic4'
              ? [
                  { id: 'p1', name: playerName.trim() || 'Player 1', avatar: selectedAvatar, isHost: true, score: 0, roundScore: 0 },
                  { id: 'p2', name: 'Courtier 2', avatar: '🦁', isHost: false, score: 0, roundScore: 0 },
                  { id: 'p3', name: 'Courtier 3', avatar: '💎', isHost: false, score: 0, roundScore: 0 },
                  { id: 'p4', name: 'Courtier 4', avatar: '⚔️', isHost: false, score: 0, roundScore: 0 },
                ]
              : [
                  { id: 'p1', name: playerName.trim() || 'Player 1', avatar: selectedAvatar, isHost: true, score: 0, roundScore: 0 },
                  { id: 'p2', name: 'Courtier 2', avatar: '🦁', isHost: false, score: 0, roundScore: 0 },
                  { id: 'p3', name: 'Courtier 3', avatar: '💎', isHost: false, score: 0, roundScore: 0 },
                  { id: 'p4', name: 'Courtier 4', avatar: '⚔️', isHost: false, score: 0, roundScore: 0 },
                  { id: 'p5', name: 'Courtier 5', avatar: '🛡️', isHost: false, score: 0, roundScore: 0 },
                ]);
            onStartPassAndPlay(defaultPassPlayers, selectedMode);
          }}
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY NOW (PASS & PLAY)</span>
        </button>

        {/* 4. Royal Blue & Deep Purple Badges for Online Play */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onStartOnlineHost(playerName.trim() || 'Host', selectedAvatar, selectedMode);
            }}
            className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <Globe className="w-4 h-4" />
            <span>Host Online</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowJoinModal(true);
            }}
            className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.01]"
          >
            <KeyRound className="w-4 h-4" />
            <span>Join with Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
