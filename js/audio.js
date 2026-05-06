/* audio.js — Tone.js setup. Runs first; defines window.DAW. */
window.DAW = {
  bpm: 120,
  isPlaying: false,
  selectedInstrument: 'piano',
  recorderActive: false,
  sequencerGrid: Array(6).fill(null).map(() => Array(16).fill(false)),
};

(function initAudio() {
  /* ── Master output ───────────────────────────────────────── */
  const masterVol = new Tone.Volume(-10).toDestination();
  window.DAW.masterVolume = masterVol;

  /* ── Shared effects ──────────────────────────────────────── */
  const reverb     = new Tone.Reverb({ decay: 1.8, wet: 0.28 }).connect(masterVol);
  const lowpass    = new Tone.Filter(2200, 'lowpass').connect(masterVol);
  const wooshFilter = new Tone.Filter({ type: 'bandpass', frequency: 300, Q: 1.2 }).connect(masterVol);

  /* ── Drum synths ─────────────────────────────────────────── */
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.055,
    octaves: 10,
    envelope: { attack: 0.001, decay: 0.38, sustain: 0, release: 0.12 },
  }).connect(masterVol);

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 },
  }).connect(masterVol);

  const hihat = new Tone.MetalSynth({
    frequency: 420,
    envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).connect(masterVol);

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.004, decay: 0.09, sustain: 0, release: 0.05 },
  }).connect(masterVol);

  const cowbell = new Tone.MetalSynth({
    frequency: 562,
    envelope: { attack: 0.001, decay: 0.42, release: 0.12 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 3000,
    octaves: 0.5,
  }).connect(masterVol);

  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.1 },
  }).connect(masterVol);

  window.DAW.drumSynths = { kick, snare, hihat, clap, cowbell, tom };

  /* ── Melody synths ───────────────────────────────────────── */
  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
  }).connect(reverb);

  const bell = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.15, release: 2.2 },
  }).connect(reverb);

  const guitar = new Tone.PolySynth(Tone.PluckSynth, {
    attackNoise: 1,
    dampening: 3800,
    resonance: 0.97,
  }).connect(masterVol);

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
  }).connect(lowpass);

  window.DAW.melodySynths = { piano, bell, guitar, synth };
  window.DAW.activeMelodySynth = piano;

  /* ── Fun pad synths ──────────────────────────────────────── */
  const airhorn = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.25 },
  }).connect(masterVol);

  const boing = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0, sustain: 1, release: 0.35 },
  }).connect(masterVol);

  const whistle = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.85, release: 0.3 },
  }).connect(masterVol);

  const zap = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.08 },
  }).connect(masterVol);

  const woosh = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.04, decay: 0.7, sustain: 0, release: 0.3 },
  }).connect(wooshFilter);

  window.DAW.padSynths = { airhorn, boing, whistle, zap, woosh };

  /* ── Methods ─────────────────────────────────────────────── */

  window.DAW.playDrum = function (drumName, time) {
    const t = time !== undefined ? time : Tone.now();
    const d = window.DAW.drumSynths;
    switch (drumName) {
      case 'kick':    d.kick.triggerAttackRelease('C1', '8n', t);  break;
      case 'snare':   d.snare.triggerAttackRelease('8n', t);        break;
      case 'hihat':   d.hihat.triggerAttackRelease('16n', t);       break;
      case 'clap':    d.clap.triggerAttackRelease('8n', t);         break;
      case 'cowbell': d.cowbell.triggerAttackRelease('16n', t);     break;
      case 'tom':     d.tom.triggerAttackRelease('G1', '8n', t);   break;
    }
  };

  window.DAW.playNote = function (note) {
    Tone.start();
    const active = window.DAW.activeMelodySynth;
    if (window.DAW.selectedInstrument === 'guitar') {
      active.triggerAttack(note, Tone.now());
    } else {
      active.triggerAttackRelease(note, '8n', Tone.now());
    }
  };

  window.DAW.releaseNote = function (note) {
    if (window.DAW.selectedInstrument === 'guitar') {
      window.DAW.activeMelodySynth.triggerRelease([note], Tone.now());
    }
  };

  window.DAW.playPad = function (soundName) {
    Tone.start();
    const p = window.DAW.padSynths;
    const d = window.DAW.drumSynths;
    const m = window.DAW.melodySynths;
    const now = Tone.now();

    switch (soundName) {
      case 'cowbell':
        d.cowbell.triggerAttackRelease('8n', now);
        break;
      case 'airhorn':
        p.airhorn.frequency.cancelScheduledValues(now);
        p.airhorn.frequency.setValueAtTime(160, now);
        p.airhorn.frequency.exponentialRampToValueAtTime(520, now + 0.55);
        p.airhorn.triggerAttackRelease('2n', now);
        break;
      case 'boing':
        p.boing.frequency.cancelScheduledValues(now);
        p.boing.frequency.setValueAtTime(860, now);
        p.boing.frequency.exponentialRampToValueAtTime(80, now + 0.52);
        p.boing.triggerAttackRelease('4n', now);
        break;
      case 'whistle':
        p.whistle.frequency.cancelScheduledValues(now);
        p.whistle.frequency.setValueAtTime(1800, now);
        p.whistle.frequency.setValueAtTime(2200, now + 0.08);
        p.whistle.triggerAttackRelease('4n', now);
        break;
      case 'zap':
        p.zap.frequency.cancelScheduledValues(now);
        p.zap.frequency.setValueAtTime(2400, now);
        p.zap.frequency.exponentialRampToValueAtTime(40, now + 0.28);
        p.zap.triggerAttackRelease('16n', now);
        break;
      case 'clappad':
        d.clap.triggerAttackRelease('8n', now);
        d.clap.triggerAttackRelease('8n', now + 0.012);
        d.clap.triggerAttackRelease('8n', now + 0.022);
        break;
      case 'woosh':
        wooshFilter.frequency.cancelScheduledValues(now);
        wooshFilter.frequency.setValueAtTime(150, now);
        wooshFilter.frequency.exponentialRampToValueAtTime(5000, now + 0.5);
        p.woosh.triggerAttackRelease('4n', now);
        break;
      case 'bellpad':
        m.bell.triggerAttackRelease('C5', '4n', now);
        break;
    }
  };

  window.DAW.setVolume = function (db) {
    masterVol.volume.value = db;
  };

  window.DAW.setBpm = function (bpm) {
    Tone.getTransport().bpm.value = bpm;
    window.DAW.bpm = bpm;
  };

  /* Init transport BPM */
  Tone.getTransport().bpm.value = 120;
})();
