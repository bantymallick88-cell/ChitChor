import React, { useState, useEffect, useRef } from 'react';
import type { GameState, Player, RoleType, GameMode, GuessResult, RoundRecord } from '../types/game';
import { ROLES_METADATA } from '../types/game';
import { Navbar } from './Navbar';
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
  const [hasRevealedMyChit, setHasRevealedMyChit] = useState(false);

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
    // Generate 4-char uppercase royal room code
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
      setNetworkNotice('Connecting to Host chamber...');
      const joined = await networkRef.current.joinRoom(cleanCode, guestPlayer);
      if (!joined) {
        setNetworkNotice('Unable to reach host peer directly. Check code or host another!');
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
  const handleStartGameDeal = () => {
    if (!isHost) return;

    // Shuffle roles
    const roles: RoleType[] =
      gameState.mode === 'classic4'
        ? ['raja', 'rani', 'sipahi', 'chor']
        : ['raja', 'rani', 'katual', 'sipahi', 'chor'];

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const updatedPlayers = gameState.players.map((p, idx) => ({
      ...p,
      role: shuffledRoles[idx],
      isRevealed: false,
      roundScore: 0,
    }));

    const sipahiPlayer = updatedPlayers.find((p) => p.role === 'sipahi');

    setShowShuffle(true);
    setHasRevealedMyChit(false);

    const nextState: GameState = {
      ...gameState,
      phase: 'dealing',
      players: updatedPlayers,
      activeGuesserId: sipahiPlayer ? sipahiPlayer.id : null,
      guessResult: null,
      passAndPlayCurrentIndex: 0,
    };

    setGameState(nextState);
    networkRef.current?.broadcastState(nextState);
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

    // Calculate Points
    // MODE A: Raja 1000, Rani 500, Sipahi 100 (if correct) or 0 (if wrong), Chor 0 (if caught) or 100 (if wrong)
    // MODE B: Raja 1000, Rani 700, Katual 500, Sipahi 100/0, Chor 0/100
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
        earned = isCorrect ? 0 : 100; // Chor steals the 100 bounty if Sipahi guessed wrong!
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
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
    }));
    handleStartGameDeal();
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

  // Find the Raja and Sipahi players
  const rajaPlayer = gameState.players.find((p) => p.role === 'raja');
  const sipahiPlayer = gameState.players.find((p) => p.role === 'sipahi');

  // Pass and play active player
  const passCurrentPlayer =
    gameState.playMode === 'pass_and_play' && gameState.passAndPlayCurrentIndex !== undefined
      ? gameState.players[gameState.passAndPlayCurrentIndex]
      : me;

  const handlePassToNextCourtier = () => {
    sound.playClick();
    const nextIdx = (gameState.passAndPlayCurrentIndex || 0) + 1;
    if (nextIdx >= gameState.players.length) {
      // All courtiers have peeked at their chits!
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
    <div className="min-h-screen bg-[#0a0d14] text-zinc-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar onOpenRules={() => setIsRulesOpen(true)} />

      {/* Network Alert Banner */}
      {networkNotice && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs text-center py-1.5 px-4 animate-in fade-in">
          {networkNotice}
        </div>
      )}

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl w-full mx-auto">
        {/* Shuffling Overlay */}
        {showShuffle && (
          <ChitShuffleAnimation
            onComplete={handleShuffleAnimationComplete}
            count={gameState.mode === 'classic4' ? 4 : 5}
          />
        )}

        {/* ---------------- PHASE 1: LOBBY ---------------- */}
        {gameState.phase === 'lobby' && (
          <Lobby
            onStartOnlineHost={handleStartOnlineHost}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onStartPassAndPlay={handleStartPassAndPlay}
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

        {/* ---------------- PHASE 2: SECRET CHIT PEEK ---------------- */}
        {gameState.phase === 'secret_peek' && (
          <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-300 text-center">
            {/* Pass & Play Privacy Curtain */}
            {gameState.playMode === 'pass_and_play' && isPassPhoneShielded ? (
              <div className="p-8 rounded-2xl bg-zinc-950 border-2 border-amber-500/40 royal-glow text-center space-y-4 my-8">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-3xl">
                  {passCurrentPlayer?.avatar || '👑'}
                </div>
                <h3 className="text-xl font-serif font-black text-amber-300">
                  Pass Phone to {passCurrentPlayer?.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Keep the phone hidden from other courtiers. When ready, tap below to privately unlock your royal chit.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPassPhoneShielded(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg"
                >
                  I Am {passCurrentPlayer?.name} (Reveal Chit)
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Round {gameState.round} • Chit Distribution</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-300">
                    Your Secret Royal Chit
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Tap the folded paper to unfold and secretly inspect your duty
                  </p>
                </div>

                {/* The 3D Interactive Chit */}
                <PaperChit3D
                  role={gameState.playMode === 'pass_and_play' ? passCurrentPlayer?.role : me?.role}
                  playerName={gameState.playMode === 'pass_and_play' ? passCurrentPlayer?.name : me?.name}
                  onRevealToggled={(unfolded) => {
                    if (unfolded) setHasRevealedMyChit(true);
                  }}
                />

                {/* Progress / Next Action */}
                <div className="pt-2">
                  {gameState.playMode === 'pass_and_play' ? (
                    <button
                      onClick={handlePassToNextCourtier}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>
                        {(gameState.passAndPlayCurrentIndex || 0) + 1 < gameState.players.length
                          ? `Done, Pass to Next Courtier (${(gameState.passAndPlayCurrentIndex || 0) + 2}/${gameState.players.length})`
                          : 'All Courtiers Ready → Summon Police!'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div>
                      {isHost ? (
                        <button
                          onClick={handleProceedToPoliceAction}
                          className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <Crown className="w-4 h-4 fill-current" />
                          <span>Raja Declares: "Mera Sipahi Kaun?!"</span>
                        </button>
                      ) : (
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
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

        {/* ---------------- PHASE 3: POLICE ACTION (GUESSING) ---------------- */}
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

        {/* ---------------- PHASE 4: ROUND RESULT & SCORECARD ---------------- */}
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

      {/* Rules / Codex Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Footer Branding */}
      <footer className="w-full py-3 px-4 text-center border-t border-zinc-900 text-zinc-600 text-[11px] flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span>ChitChor © {new Date().getFullYear()}</span>
          <span>•</span>
          <a
            href="https://chitchor.fixeehub.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-500/80 hover:text-amber-400 transition-colors"
          >
            chitchor.fixeehub.com
          </a>
        </div>
        <div className="text-zinc-500 mt-1 sm:mt-0 flex items-center gap-3">
          <span>Raja Rani Chor Sipahi Reimagined</span>
          <span>•</span>
          <button
            onClick={() => setIsRulesOpen(true)}
            className="text-amber-500/80 hover:text-amber-400 underline decoration-amber-500/40"
          >
            Royal Codex
          </button>
        </div>
      </footer>
    </div>
  );
};
