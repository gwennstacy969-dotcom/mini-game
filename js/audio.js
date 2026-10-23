/**
 * RiYooIQ - Web Audio API Sound Synthesizer
 * Synthesizes all game sounds and cheerful background tunes natively without external audio files.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.isMusicPlaying = false;
        this.musicTimer = null;
        this.masterVolume = 0.8;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // Play crisp button click
    playClick() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Play joyful correct answer chime (arpeggio C5 -> E5 -> G5 -> C6)
    playCorrect() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.07;
            const duration = 0.25;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    // Play soft cartoon buzzer for wrong answer
    playWrong() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(196, now); // G3
        osc.frequency.linearRampToValueAtTime(130, now + 0.28); // C3

        gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Play power pull/push tension whoosh
    playPushOrTug() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // White noise burst with low-pass filter
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Countdown tick
    playTick() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Match Start Whistle / Fanfare
    playStart() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [587.33, 880]; // D5, A5
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.3 * this.masterVolume, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.2);
        });
    }

    // Victory celebration fanfare
    playVictory() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.5, d: 0.28 }, // C6
            { f: 880.00, d: 0.12 }, // A5
            { f: 1046.5, d: 0.45 }, // C6
        ];

        let cursor = this.ctx.currentTime + 0.05;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, cursor);

            gain.gain.setValueAtTime(0.32 * this.masterVolume, cursor);
            gain.gain.exponentialRampToValueAtTime(0.001, cursor + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(cursor);
            osc.stop(cursor + item.d);
            cursor += item.d + 0.04;
        });
    }

    // Cliff Fall / Defeat comical slide
    playFall() {
        if (!this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

        gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
    }

    // Cheerful Ambient Background Synth Melody (Gentle, low-volume, looped)
    startMusic() {
        if (!this.musicEnabled || this.isMusicPlaying) return;
        this.init();
        if (!this.ctx) return;

        this.isMusicPlaying = true;
        // Bouncy kid chord loop: C - G - Am - F progression
        const chords = [
            [261.63, 329.63, 392.00], // C major (C4, E4, G4)
            [196.00, 246.94, 293.66], // G major (G3, B3, D4)
            [220.00, 261.63, 329.63], // A minor (A3, C4, E4)
            [174.61, 220.00, 261.63]  // F major (F3, A3, C4)
        ];

        let chordIndex = 0;
        const stepTime = 1200; // ms per chord

        const playNextBar = () => {
            if (!this.isMusicPlaying || !this.musicEnabled || !this.ctx) return;

            const chord = chords[chordIndex];
            chordIndex = (chordIndex + 1) % chords.length;
            const now = this.ctx.currentTime;

            // Soft pad chord
            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                const noteVol = (i === 0 ? 0.06 : 0.04) * this.masterVolume;
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(noteVol, now + 0.2);
                gain.gain.linearRampToValueAtTime(0.001, now + (stepTime / 1000) * 0.95);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + (stepTime / 1000));
            });

            // Light staccato arpeggio ping
            const arpFreq = chord[1] * 2;
            const arpOsc = this.ctx.createOscillator();
            const arpGain = this.ctx.createGain();

            arpOsc.type = 'triangle';
            arpOsc.frequency.setValueAtTime(arpFreq, now + 0.3);

            arpGain.gain.setValueAtTime(0.03 * this.masterVolume, now + 0.3);
            arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            arpOsc.connect(arpGain);
            arpGain.connect(this.ctx.destination);

            arpOsc.start(now + 0.3);
            arpOsc.stop(now + 0.5);

            this.musicTimer = setTimeout(playNextBar, stepTime);
        };

        playNextBar();
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }
}

window.soundEngine = new SoundEngine();
