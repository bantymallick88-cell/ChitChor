import React, { useState, useEffect, useRef } from 'react';
import type { GameState, Player, RoleType, GameMode, GuessResult, RoundRecord } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Lobby } from './Lobby';
import { PaperChit3D } from './PaperChit3D';
import { ChitShuffleAnimation } from './ChitShuffleAnimation';
import { PoliceInvestigationModal } from './PoliceInvestigationModal';
import { ScoreboardModal } from './ScoreboardModal';
import { RulesModal } from './RulesModal';
import { PeerNetwork } from '../utils/peer';
import { sound } from '../utils/audio';
import { Crown, Sparkles, ShieldAlert, ArrowRight, Eye, RefreshCw, Users, HelpCircle } from 'lucide-react';

const BOT_AVATARS = ['🦁', '🐯', '🐘', '💎', '🦚'];
const BOT_NAMES = ['Birbal (Bot)', 'Tenali Rama (Bot)', 'Vikram (Bot)', 'Betal (Bot)', 'Chanakya (Bot)'];

export const ChitChorApp: React.FC = () => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>('p1');
  const [networkNotice, setNetworkNotice] = useState<string | null>(null);

  // Networking instance
  const networkRef = useRef<PeerNetwork | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    roomId: '',
    mode: 'classic4',
    phase: 'lobby',
    players: [],
    round: 1,
    activeGuesserId: null,
    guessResult: null,
    history: [],
    playMode: 'online',
    passAndPlayCurrentIndex: 0,
  });

  // Local view states
  const [showShuffle, setShowShuffle] = useState(false);
  const [isPassPhoneShielded, setIsPassPhoneShielded] = useState(false);

  // Initialize network listeners
  useEffect(() => {
    const net = new PeerNetwork();
    networkRef.current = net;

    net.onStatusChange((status) => {
      setNetworkNotice(status);
      setTimeout(() => setNetworkNotice(null), 4000);
    });

    net.onStateUpdate((updatedState) => {
      setGameState(updatedState);
    });

    net.onPlayerJoin((newPlayer) => {
      setGameState((prev) => {
        if (!prev.roomId) return prev;
        const exists = prev.players.some((p) => p.id === newPlayer.id || p.name === newPlayer.name);
        if (exists) return prev;
        const maxPlayers = prev.mode === 'classic4' ? 4 : 5;
        if (prev.players.length >= maxPlayers) return prev;

        const nextPlayers = [...prev.players, newPlayer];
        const nextState = { ...prev, players: nextPlayers };
        net.broadcastState(nextState);
        return nextState;
      });
    });

    net.onGuessSubmitted((guesserId, suspectId) => {
      handleProcessGuess(guesserId, suspectId);
    });

    return () => {
      net.destroy();
    };
  }, []);

  const me = gameState.players.find((p) => p.id === myPlayerId) || gameState.players[0] || {
    id: myPlayerId,
    name: 'You',
    avatar: '👑',
    isHost: true,
    score: 0,
    roundScore: 0,
  };

  const isHost = me?.isHost || gameState.playMode === 'pass_and_play';

  // -------------------- HOST ACTIONS --------------------
  const handleStartOnlineHost = async (name: string, avatar: string, mode: GameMode) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hostId = `host-${code.toLowerCase()}`;
    setMyPlayerId(hostId);

    const hostPlayer: Player = {
      id: hostId,
      name,
      avatar,
      isHost: true,
      score: 0,
      roundScore: 0,
    };

    const initial: GameState = {
      roomId: code,
      mode,
      phase: 'lobby',
      players: [hostPlayer],
      round: 1,
      activeGuesserId: null,
      guessResult: null,
      history: [],
      playMode: 'online',
    };

    setGameState(initial);

    if (networkRef.current) {
      await networkRef.current.initHost(code, hostPlayer);
    }
  };

  const handleJoinOnlineRoom = async (roomCode: string, name: string, avatar: string) => {
    const cleanCode = roomCode.trim().toUpperCase();
    const playerId = `guest-${Math.floor(1000 + Math.random() * 9000)}`;
    setMyPlayerId(playerId);

    const guestPlayer: Player = {
      id: playerId,
      name,
      avatar,
      isHost: false,
      score: 0,
      roundScore: 0,
    };

    setGameState((prev) => ({
      ...prev,
      roomId: cleanCode,
      phase: 'lobby',
      players: [guestPlayer],
      playMode: 'online',
    }));

    if (networkRef.current) {
      setNetworkNotice('Connecting to Chamber...');
      const joined = await networkRef.current.joinRoom(cleanCode, guestPlayer);
      if (!joined) {
        setNetworkNotice('Host peer busy. Check code or create a room!');
      }
    }
  };

  const handleStartPassAndPlay = (players: Player[], mode: GameMode) => {
    setMyPlayerId(players[0].id);
    const initial: GameState = {
      roomId: 'OFFLINE',
      mode,
      phase: 'lobby',
      players,
      round: 1,
      activeGuesserId: null,
      guessResult: null,
      history: [],
      playMode: 'pass_and_play',
      passAndPlayCurrentIndex: 0,
    };
    setGameState(initial);
    // Auto-trigger deal immediately for 1-tap start!
    setTimeout(() => {
      triggerChitDeal(initial);
    }, 100);
  };

  const handleModeChange = (mode: GameMode) => {
    if (!isHost) return;
    setGameState((prev) => {
      const next = { ...prev, mode };
      networkRef.current?.broadcastState(next);
      return next;
    });
  };

  const handleAddBot = () => {
    if (!isHost) return;
    setGameState((prev) => {
      const max = prev.mode === 'classic4' ? 4 : 5;
      if (prev.players.length >= max) return prev;
      const botIndex = prev.players.filter((p) => p.isBot).length;
      const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
      const botAvatar = BOT_AVATARS[botIndex % BOT_AVATARS.length];

      const botPlayer: Player = {
        id: `bot-${Date.now()}-${botIndex}`,
        name: botName,
        avatar: botAvatar,
        isHost: false,
        isBot: true,
        score: 0,
        roundScore: 0,
      };

      const nextState = { ...prev, players: [...prev.players, botPlayer] };
      networkRef.current?.broadcastState(nextState);
      return nextState;
    });
  };

  const handleRemovePlayer = (id: string) => {
    if (!isHost) return;
    setGameState((prev) => {
      const next = { ...prev, players: prev.players.filter((p) => p.id !== id) };
      networkRef.current?.broadcastState(next);
      return next;
    });
  };

  // -------------------- DEAL CHITS & GAME FLOW --------------------
  const triggerChitDeal = (stateToUse: GameState) => {
    const roles: RoleType[] =
      stateToUse.mode === 'classic4'
        ? ['raja', 'rani', 'sipahi', 'chor']
        : ['raja', 'rani', 'katual', 'sipahi', 'chor'];

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const updatedPlayers = stateToUse.players.map((p, idx) => ({
      ...p,
      role: shuffledRoles[idx],
      isRevealed: false,
      roundScore: 0,
    }));

    const sipahiPlayer = updatedPlayers.find((p) => p.role === 'sipahi');

    setShowShuffle(true);

    const nextState: GameState = {
      ...stateToUse,
      phase: 'dealing',
      players: updatedPlayers,
      activeGuesserId: sipahiPlayer ? sipahiPlayer.id : null,
      guessResult: null,
      passAndPlayCurrentIndex: 0,
    };

    setGameState(nextState);
    networkRef.current?.broadcastState(nextState);
  };

  const handleStartGameDeal = () => {
    if (!isHost) return;
    triggerChitDeal(gameState);
  };

  const handleShuffleAnimationComplete = () => {
    setShowShuffle(false);
    setGameState((prev) => {
      const nextState: GameState = {
        ...prev,
        phase: 'secret_peek',
      };
      if (prev.playMode === 'pass_and_play') {
        setIsPassPhoneShielded(false);
      }
      networkRef.current?.broadcastState(nextState);
      return nextState;
    });
  };

  // -------------------- POLICE INVESTIGATION --------------------
  const handleProceedToPoliceAction = () => {
    sound.speakRoyalProclamation('Mera Sipahi Kaun Hai?!');
    setGameState((prev) => {
      const nextState: GameState = {
        ...prev,
        phase: 'police_action',
      };
      networkRef.current?.broadcastState(nextState);
      return nextState;
    });
  };

  const handleProcessGuess = (guesserId: string, suspectId: string) => {
    const suspect = gameState.players.find((p) => p.id === suspectId);
    const guesser = gameState.players.find((p) => p.id === guesserId);
    if (!suspect || !guesser) return;

    const isCorrect = suspect.role === 'chor';

    const guessResult: GuessResult = {
      guesserId,
      guesserName: guesser.name,
      suspectId,
      suspectName: suspect.name,
      suspectRole: suspect.role || 'chor',
      isCorrect,
    };

    const roundScores: Record<string, { role: RoleType; points: number }> = {};

    const updatedPlayers = gameState.players.map((p) => {
      let earned = 0;
      if (p.role === 'raja') {
        earned = 1000;
      } else if (p.role === 'rani') {
        earned = gameState.mode === 'classic4' ? 500 : 700;
      } else if (p.role === 'katual') {
        earned = 500;
      } else if (p.role === 'sipahi') {
        earned = isCorrect ? 100 : 0;
      } else if (p.role === 'chor') {
        earned = isCorrect ? 0 : 100;
      }

      roundScores[p.id] = { role: p.role!, points: earned };

      return {
        ...p,
        roundScore: earned,
        score: p.score + earned,
        isRevealed: true,
      };
    });

    const newRecord: RoundRecord = {
      round: gameState.round,
      scores: roundScores,
      guessResult,
    };

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      guessResult,
      history: [...gameState.history, newRecord],
    };

    setGameState(nextState);
    networkRef.current?.broadcastState(nextState);
  };

  const handleSubmitGuess = (guesserId: string, suspectId: string) => {
    if (isHost) {
      handleProcessGuess(guesserId, suspectId);
    } else {
      networkRef.current?.sendGuessToHost(guesserId, suspectId);
    }
  };

  const handleContinueToScoreboard = () => {
    setGameState((prev) => {
      const nextState: GameState = {
        ...prev,
        phase: 'round_result',
      };
      networkRef.current?.broadcastState(nextState);
      return nextState;
    });
  };

  const handleNextRound = () => {
    if (!isHost) return;
    const nextRoundState = {
      ...gameState,
      round: gameState.round + 1,
    };
    setGameState(nextRoundState);
    triggerChitDeal(nextRoundState);
  };

  const handleRestartGame = () => {
    if (!isHost) return;
    const resetPlayers = gameState.players.map((p) => ({
      ...p,
      score: 0,
      roundScore: 0,
      role: undefined,
      isRevealed: false,
    }));

    const nextState: GameState = {
      ...gameState,
      phase: 'lobby',
      round: 1,
      players: resetPlayers,
      activeGuesserId: null,
      guessResult: null,
      history: [],
      passAndPlayCurrentIndex: 0,
    };

    setGameState(nextState);
    networkRef.current?.broadcastState(nextState);
  };

  const sipahiPlayer = gameState.players.find((p) => p.role === 'sipahi');

  const passCurrentPlayer =
    gameState.playMode === 'pass_and_play' && gameState.passAndPlayCurrentIndex !== undefined
      ? gameState.players[gameState.passAndPlayCurrentIndex]
      : me;

  const handlePassToNextCourtier = () => {
    sound.playClick();
    const nextIdx = (gameState.passAndPlayCurrentIndex || 0) + 1;
    if (nextIdx >= gameState.players.length) {
      handleProceedToPoliceAction();
    } else {
      setGameState((prev) => ({
        ...prev,
        passAndPlayCurrentIndex: nextIdx,
      }));
      setIsPassPhoneShielded(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sticky Glassmorphic Top Navbar */}
      <Navbar
        onOpenRules={() => setIsRulesOpen(true)}
        currentRoomId={gameState.roomId || null}
      />

      {/* Network Alert */}
      {networkNotice && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 text-blue-300 text-xs text-center py-1.5 px-4 animate-in fade-in">
          {networkNotice}
        </div>
      )}

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-5xl w-full mx-auto my-auto">
        {/* Shuffling Screen */}
        {showShuffle && (
          <ChitShuffleAnimation
            onComplete={handleShuffleAnimationComplete}
            count={gameState.mode === 'classic4' ? 4 : 5}
          />
        )}

        {/* ---------------- 1. LOBBY ---------------- */}
        {gameState.phase === 'lobby' && (
          <Lobby
            onStartOnlineHost={handleStartOnlineHost}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onStartPassAndPlay={handleStartPassAndPlay}
            onOpenRules={() => setIsRulesOpen(true)}
            currentRoomId={gameState.roomId || null}
            players={gameState.players}
            isHost={isHost}
            gameMode={gameState.mode}
            onModeChange={handleModeChange}
            onAddBot={handleAddBot}
            onRemovePlayer={handleRemovePlayer}
            onStartGame={handleStartGameDeal}
          />
        )}

        {/* ---------------- 2. SECRET CHIT PEEK ---------------- */}
        {gameState.phase === 'secret_peek' && (
          <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-300 text-center">
            {gameState.playMode === 'pass_and_play' && isPassPhoneShielded ? (
              <div className="p-8 rounded-2xl bg-[#111827] border-2 border-slate-700 shadow-2xl text-center space-y-4 my-8">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 mx-auto flex items-center justify-center text-3xl">
                  {passCurrentPlayer?.avatar || '👑'}
                </div>
                <h3 className="text-xl font-serif font-black text-white">
                  Pass Phone to {passCurrentPlayer?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Keep screen tilted away. Tap below when ready to privately unlock your royal chit.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPassPhoneShielded(false);
                  }}
                  className="w-full py-4 px-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                >
                  I Am {passCurrentPlayer?.name} (Unlock Chit)
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Round {gameState.round} • Secret Inspection</span>
                  </div>
                  <h2 className="text-2xl font-serif font-black text-white">
                    Your Royal Chit
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tap the folded white slip to unfold & peek
                  </p>
                </div>

                {/* 3D Paper Chit */}
                <PaperChit3D
                  role={gameState.playMode === 'pass_and_play' ? passCurrentPlayer?.role : me?.role}
                  playerName={gameState.playMode === 'pass_and_play' ? passCurrentPlayer?.name : me?.name}
                />

                {/* Next Step CTA */}
                <div className="pt-2">
                  {gameState.playMode === 'pass_and_play' ? (
                    <button
                      onClick={handlePassToNextCourtier}
                      className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>
                        {(gameState.passAndPlayCurrentIndex || 0) + 1 < gameState.players.length
                          ? `Done, Pass to Next Player (${(gameState.passAndPlayCurrentIndex || 0) + 2}/${gameState.players.length})`
                          : 'All Ready → Summon Sipahi!'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div>
                      {isHost ? (
                        <button
                          onClick={handleProceedToPoliceAction}
                          className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <Crown className="w-4 h-4 fill-current text-amber-300" />
                          <span>Raja Declares: "Mera Sipahi Kaun?!"</span>
                        </button>
                      ) : (
                        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 text-xs text-slate-400 font-medium">
                          Waiting for King to declare "Mera Sipahi Kaun?!"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ---------------- 3. POLICE INVESTIGATION ---------------- */}
        {gameState.phase === 'police_action' && sipahiPlayer && (
          <PoliceInvestigationModal
            sipahiPlayer={sipahiPlayer}
            currentPlayerId={
              gameState.playMode === 'pass_and_play' ? sipahiPlayer.id : myPlayerId
            }
            isHost={isHost}
            players={gameState.players}
            gameMode={gameState.mode}
            onGuessSubmitted={handleSubmitGuess}
            result={gameState.guessResult}
            onContinueToScoreboard={handleContinueToScoreboard}
          />
        )}

        {/* ---------------- 4. SCOREBOARD ---------------- */}
        {gameState.phase === 'round_result' && (
          <ScoreboardModal
            players={gameState.players}
            history={gameState.history}
            currentRound={gameState.round}
            isHost={isHost}
            gameMode={gameState.mode}
            onNextRound={handleNextRound}
            onRestartGame={handleRestartGame}
          />
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Modern Sleek Inline Footer with Privacy, Support & WhatsApp Share */}
      <Footer
        currentRoomId={gameState.roomId || null}
        onOpenRules={() => setIsRulesOpen(true)}
      />
    </div>
  );
};
