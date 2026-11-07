import React, { useState, useEffect } from 'react';
import type { GameMode, Player } from '../types/game';
import { Crown, Users, Smartphone, Plus, UserPlus, Play, Copy, Share2, Sparkles, Shield, MessageCircle } from 'lucide-react';
import { sound } from '../utils/audio';

const ROYAL_AVATARS = ['👑', '🦚', '🦁', '🐯', '🐘', '💎', '⚔️', '🛡️', '👳', '🧕'];
const BOT_NAMES = ['Birbal (Bot)', 'Tenali Rama (Bot)', 'Vikram (Bot)', 'Betal (Bot)', 'Chanakya (Bot)'];

interface LobbyProps {
  onStartOnlineHost: (name: string, avatar: string, mode: GameMode) => void;
  onJoinOnlineRoom: (roomCode: string, name: string, avatar: string) => void;
  onStartPassAndPlay: (players: Player[], mode: GameMode) => void;
  // If in an active hosted room
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
  currentRoomId,
  players = [],
  isHost = false,
  gameMode = 'classic4',
  onModeChange,
  onAddBot,
  onRemovePlayer,
  onStartGame,
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'pass_and_play'>('create');
  const [playerName, setPlayerName] = useState('Maharaja ' + Math.floor(10 + Math.random() * 90));
  const [selectedAvatar, setSelectedAvatar] = useState(ROYAL_AVATARS[0]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic4');
  const [copied, setCopied] = useState(false);

  // Check URL params for room
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomCodeInput(roomParam.toUpperCase());
        setTab('join');
      }
    }
  }, []);

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
      `👑 You have been summoned to ChitChor!\nJoin my royal paper chit room #${currentRoomId} now:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // If already in an active room lobby
  if (currentRoomId) {
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
        {/* Room Header Card */}
        <div className="rounded-2xl p-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-2 border-amber-500/40 royal-glow text-center space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Royal Chamber
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-400">4-Character Room Code:</div>
            <div className="text-4xl font-black font-mono tracking-widest text-amber-300 my-1">
              {currentRoomId}
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex gap-2 justify-center pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Invite via WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector (Host only) */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-semibold uppercase">Game Court Mode:</span>
            {isHost ? (
              <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-zinc-700">
                <button
                  onClick={() => onModeChange?.('classic4')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    gameMode === 'classic4'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  4 Players
                </button>
                <button
                  onClick={() => onModeChange?.('extended5')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    gameMode === 'extended5'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  5 Players
                </button>
              </div>
            ) : (
              <span className="font-bold text-amber-400">
                {gameMode === 'classic4' ? '4-Player Classic' : '5-Player Extended'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            {gameMode === 'classic4'
              ? 'Raja (1000) • Rani (500) • Sipahi (100) • Chor (0)'
              : 'Raja (1000) • Rani (700) • Katual (500) • Sipahi (100) • Chor (0)'}
          </p>
        </div>

        {/* Player Slot List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Court Seats ({players.length}/{requiredSlots})
            </span>
            {isHost && players.length < requiredSlots && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAddBot?.();
                }}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Fill with Bot</span>
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
                      ? 'bg-zinc-900/80 border-amber-500/30 shadow-md'
                      : 'bg-zinc-950/40 border-dashed border-zinc-800 text-zinc-600'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.isHost && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                              HOST
                            </span>
                          )}
                          {player.isBot && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700">
                              BOT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          Seat #{index + 1} • Ready in Court
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span className="text-xs italic text-zinc-500">
                        Waiting for noble courtier...
                      </span>
                    </div>
                  )}

                  {isHost && player && !player.isHost && (
                    <button
                      onClick={() => onRemovePlayer?.(player.id)}
                      className="text-[11px] text-zinc-500 hover:text-red-400 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Trigger */}
        <div className="pt-2">
          {isHost ? (
            <button
              disabled={!isRoomFull}
              onClick={() => {
                sound.playClick();
                onStartGame?.();
              }}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
                isRoomFull
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRoomFull ? 'Deal Royal Chits (Start)' : `Waiting for ${requiredSlots - players.length} more players`}</span>
            </button>
          ) : (
            <div className="text-center py-3 text-xs text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800">
              Waiting for Host to deal the royal chits...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial Setup Screen (Create / Join / Pass & Play)
  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Royal Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Modern Royal Paper Chit Game</span>
        </div>
        <h2 className="text-3xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
          CHITCHOR
        </h2>
        <p className="text-xs text-zinc-400">
          Pass & play offline or invite friends globally with a 4-digit code
        </p>
      </div>

      {/* Profile Setup Box */}
      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-amber-500/30 backdrop-blur-sm space-y-3">
        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
            Your Noble Name:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={18}
            placeholder="e.g. Maharaja Vihaan"
            className="w-full bg-black/60 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
            Choose Royal Avatar:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ROYAL_AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedAvatar(av);
                }}
                className={`w-10 h-10 rounded-xl text-xl flex-shrink-0 flex items-center justify-center transition-all ${
                  selectedAvatar === av
                    ? 'bg-amber-500/30 border-2 border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'bg-zinc-800/80 border border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
        <button
          onClick={() => {
            sound.playClick();
            setTab('create');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'create'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Host Room</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTab('join');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'join'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Join Room</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTab('pass_and_play');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'pass_and_play'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* TAB: HOST ROOM */}
      {tab === 'create' && (
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Select Game Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('classic4');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMode === 'classic4'
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-black/40 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">4-Player Classic</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Raja, Rani, Sipahi, Chor</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode('extended5');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMode === 'extended5'
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-black/40 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">5-Player Extended</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">+ Katual (Commander)</div>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartOnlineHost(playerName.trim() || 'Host', selectedAvatar, selectedMode);
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
          >
            Create Royal Chamber & Get 4-Digit Code
          </button>
        </div>
      )}

      {/* TAB: JOIN ROOM */}
      {tab === 'join' && (
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
              Enter 4-Character Room Code:
            </label>
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g. 7K9J"
              className="w-full bg-black/60 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-amber-300 placeholder-zinc-600 uppercase outline-none"
            />
          </div>

          <button
            disabled={roomCodeInput.trim().length < 3}
            onClick={() => {
              sound.playClick();
              onJoinOnlineRoom(roomCodeInput.trim(), playerName.trim() || 'Player', selectedAvatar);
            }}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
              roomCodeInput.trim().length >= 3
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 active:scale-[0.98]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            Enter Royal Court
          </button>
        </div>
      )}

      {/* TAB: PASS & PLAY */}
      {tab === 'pass_and_play' && (
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200/90 leading-relaxed">
            <strong>Single Device Mode:</strong> Perfect for parties, dinners, or offline gatherings! Pass this phone to each player to secretly view their chit, then let Sipahi make the accusation.
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Select Court Size:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode('classic4')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMode === 'classic4'
                    ? 'bg-amber-500/20 border-amber-400'
                    : 'bg-black/40 border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">4 Courtiers</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Raja, Rani, Sipahi, Chor</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('extended5')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMode === 'extended5'
                    ? 'bg-amber-500/20 border-amber-400'
                    : 'bg-black/40 border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">5 Courtiers</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">+ Katual Commander</div>
              </button>
            </div>
          </div>

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
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Launch Pass & Play Game
          </button>
        </div>
      )}
    </div>
  );
};
