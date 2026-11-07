import type { GameState, Player, RoleType, GameMode } from '../types/game';

export type NetworkMessage =
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'PLAYER_JOIN'; player: Player }
  | { type: 'PLAYER_LEAVE'; playerId: string }
  | { type: 'GUESS_SUBMIT'; guesserId: string; suspectId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART_GAME' };

export class PeerNetwork {
  private peer: any = null;
  private connections: Map<string, any> = new Map();
  private hostConnection: any = null;
  public myPeerId: string = '';
  public isHost: boolean = false;
  private onStateUpdateCallback: ((state: GameState) => void) | null = null;
  private onPlayerJoinCallback: ((player: Player) => void) | null = null;
  private onGuessSubmittedCallback: ((guesserId: string, suspectId: string) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;

  constructor() {}

  public async initHost(roomCode: string, hostPlayer: Player): Promise<string> {
    this.isHost = true;
    const { Peer } = await import('peerjs');
    const fullPeerId = `chitchor-${roomCode.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(fullPeerId, {
          debug: 1,
        });

        this.peer.on('open', (id: string) => {
          this.myPeerId = id;
          this.onStatusChangeCallback?.('Room created online');
          resolve(id);
        });

        this.peer.on('connection', (conn: any) => {
          conn.on('open', () => {
            this.connections.set(conn.peer, conn);
            this.onStatusChangeCallback?.(`Player connected: ${conn.peer.slice(-4)}`);
          });

          conn.on('data', (data: NetworkMessage) => {
            this.handleIncomingMessage(data, conn);
          });

          conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.onStatusChangeCallback?.('A player disconnected');
          });
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer error (Host):', err);
          this.onStatusChangeCallback?.(`Network notice: ${err.type || 'P2P ready'}`);
          resolve(fullPeerId); // Resolve anyway so game doesn't crash
        });
      } catch (e) {
        console.error('Failed to init host peer', e);
        resolve(fullPeerId);
      }
    });
  }

  public async joinRoom(roomCode: string, player: Player, targetHostPeerId?: string): Promise<boolean> {
    this.isHost = false;
    const { Peer } = await import('peerjs');
    const myId = `chitchor-p-${Math.floor(10000 + Math.random() * 90000)}`;

    return new Promise((resolve) => {
      try {
        this.peer = new Peer(myId, { debug: 1 });

        this.peer.on('open', (id: string) => {
          this.myPeerId = id;
          this.onStatusChangeCallback?.('Connecting to royal chamber...');

          // Connect to host
          const hostId = targetHostPeerId || `chitchor-${roomCode.toUpperCase()}`;
          const conn = this.peer.connect(hostId, { reliable: true });

          conn.on('open', () => {
            this.hostConnection = conn;
            this.onStatusChangeCallback?.('Joined room successfully!');
            // Send join info
            conn.send({
              type: 'PLAYER_JOIN',
              player: { ...player, id: this.myPeerId }
            });
            resolve(true);
          });

          conn.on('data', (data: NetworkMessage) => {
            this.handleIncomingMessage(data, conn);
          });

          conn.on('error', (err: any) => {
            console.warn('Connection error to host:', err);
            resolve(false);
          });

          setTimeout(() => {
            if (!this.hostConnection) {
              resolve(false);
            }
          }, 6000);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer error (Client):', err);
          resolve(false);
        });
      } catch (e) {
        console.error('Failed to init client peer', e);
        resolve(false);
      }
    });
  }

  private handleIncomingMessage(msg: NetworkMessage, conn?: any) {
    if (msg.type === 'STATE_UPDATE') {
      this.onStateUpdateCallback?.(msg.state);
    } else if (msg.type === 'PLAYER_JOIN' && this.isHost) {
      this.onPlayerJoinCallback?.(msg.player);
    } else if (msg.type === 'GUESS_SUBMIT' && this.isHost) {
      this.onGuessSubmittedCallback?.(msg.guesserId, msg.suspectId);
    }
  }

  public broadcastState(state: GameState) {
    if (!this.isHost) return;
    const msg: NetworkMessage = { type: 'STATE_UPDATE', state };
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  public sendGuessToHost(guesserId: string, suspectId: string) {
    const msg: NetworkMessage = { type: 'GUESS_SUBMIT', guesserId, suspectId };
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }
  }

  public onStateUpdate(cb: (state: GameState) => void) {
    this.onStateUpdateCallback = cb;
  }

  public onPlayerJoin(cb: (player: Player) => void) {
    this.onPlayerJoinCallback = cb;
  }

  public onGuessSubmitted(cb: (guesserId: string, suspectId: string) => void) {
    this.onGuessSubmittedCallback = cb;
  }

  public onStatusChange(cb: (status: string) => void) {
    this.onStatusChangeCallback = cb;
  }

  public destroy() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.hostConnection) this.hostConnection.close();
    if (this.peer) this.peer.destroy();
  }
}

