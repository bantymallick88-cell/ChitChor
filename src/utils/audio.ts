// Web Audio API Synthesizer & Haptics for ChitChor Royal Sounds

class SoundController {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public speechEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chitchor_muted');
      this.isMuted = saved === 'true';
      const speechSaved = localStorage.getItem('chitchor_speech');
      this.speechEnabled = speechSaved !== 'false';
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chitchor_muted', this.isMuted.toString());
    }
    return this.isMuted;
  }

  // Trigger mobile haptic feedback if supported
  public vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic errors on unsupported platforms
      }
    }
  }

  // Unlock AudioContext and Web Speech API on mobile touch/tap user gesture
  public unlockAudioAndSpeech() {
    this.initContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        // Prime speech synthesis with a silent zero-length utterance on user gesture
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch {
        // Ignore mobile sandbox restriction
      }
    }
  }

  // Web Audio API buffer trigger for mobile browsers (fallback audio fanfare)
  public playProclamationFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Regal trumpet frequencies: G4 (392.00), C5 (523.25), E5 (659.25), G5 (783.99)
      const notes = [
        { freq: 392.00, start: 0, dur: 0.12 },
        { freq: 523.25, start: 0.12, dur: 0.12 },
        { freq: 659.25, start: 0.24, dur: 0.15 },
        { freq: 783.99, start: 0.40, dur: 0.35 },
      ];

      notes.forEach(({ freq, start, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch {
      // Audio fallback
    }
  }

  // Dual Speech Engine for Raja: Direct Google TTS Stream + Web Speech Synthesis Fallback
  public playRajaVoice(phrase: string = 'मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!') {
    if (this.isMuted || !this.speechEnabled) return;

    this.playRoyalChime();
    this.playProclamationFanfare();

    // Fallback engine: Web Speech API synthesis
    const useWebSpeechFallback = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.rate = 0.88;
          utterance.pitch = 0.95;
          utterance.lang = 'hi-IN';

          const voices = window.speechSynthesis.getVoices();
          const hindiVoice = voices.find(
            (v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.lang.toLowerCase().includes('hindi')
          );
          if (hindiVoice) {
            utterance.voice = hindiVoice;
          }

          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch {
          // Graceful silent recovery
        }
      }
    };

    if (typeof window !== 'undefined') {
      try {
        // FIRST CHOICE: Direct online Google TTS audio stream via HTML5 Audio
        const audioUrl =
          'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
          encodeURIComponent(phrase) +
          '&tl=hi&client=tw-ob';

        const audio = new Audio(audioUrl);
        audio.preload = 'auto';

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.log('Google TTS audio blocked or offline, falling back to Web Speech Synthesis:', e);
            useWebSpeechFallback();
          });
        }
      } catch (err) {
        useWebSpeechFallback();
      }
    } else {
      useWebSpeechFallback();
    }
  }

  // Alias for backward compatibility
  public speakRoyalProclamation(phrase: string = 'मेरा पुलिस कौन है? पुलिस, चोर को पकड़ो!') {
    this.playRajaVoice(phrase);
  }

  // Royal Chime cue accompanying the King's decree
  public playRoyalChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.42);
    });
  }

  // Dramatic twist sound when Chor escapes & steals points
  public playTwistSound() {
    this.playWrongBuzzer();
  }

  // Celebratory victory sound
  public playVictorySound() {
    this.playRoyalFanfare();
  }

  // Soft button click
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate(15);
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Realistic paper rustle / chit unfolding sound
  public playPaperRustle() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate(25);
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(2400, this.ctx.currentTime + 0.15);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  // Chit Shuffle animation sound
  public playShuffle() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate([20, 40, 20, 40, 30]);
    if (!this.ctx) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playPaperRustle();
      }, i * 90);
    }
  }

  // Royal Fanfare for Raja / Victory
  public playRoyalFanfare() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate([50, 60, 50, 60, 150]);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, start: 0, dur: 0.14 },    // C5
      { f: 659.25, start: 0.12, dur: 0.14 }, // E5
      { f: 783.99, start: 0.24, dur: 0.18 }, // G5
      { f: 1046.50, start: 0.42, dur: 0.45 } // C6
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(0.2, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur);
    });
  }

  // Suspense heartbeat drum for investigation
  public playSuspenseBeat() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate(30);
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  // Wrong guess comedic buzzer
  public playWrongBuzzer() {
    if (this.isMuted) return;
    this.initContext();
    this.vibrate([100, 50, 150]);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(90, now + 0.35);

    osc2.frequency.setValueAtTime(154, now);
    osc2.frequency.linearRampToValueAtTime(94, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }
}

export const sound = new SoundController();
