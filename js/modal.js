/* modal.js — Info button modal system with kid-friendly explanations */
(function () {
  const CONTENT = {
    transport: {
      icon: '🎛️',
      title: 'Play Your Beat',
      text: 'PLAY starts your drum beat — the lights will dance across the grid! STOP pauses the music. CLEAR erases everything so you can start fresh. Always press PLAY after you set up your beat!'
    },
    bpm: {
      icon: '🐢🐇',
      title: 'Speed (BPM)',
      text: 'BPM means Beats Per Minute — it controls how FAST or SLOW the music plays! Slide left for slow like a turtle 🐢, slide right for super fast like a rabbit 🐇. Try 120 for a normal pop song speed!'
    },
    volume: {
      icon: '🔊',
      title: 'Volume',
      text: 'This makes the music louder or quieter! Slide it up to turn up the music, or down to make it softer. Always be careful not to have it too loud — protect those ears! 👂'
    },
    presets: {
      icon: '🎵',
      title: 'Beat Presets',
      text: 'Presets are ready-made beats for you to try! Pick one from the list and press Load Preset. You can then change it to make it your own! Use Save My Beat to keep your creation, and Load My Beat to get it back later.'
    },
    beat: {
      icon: '🥁',
      title: 'Beat Machine',
      text: 'The Beat Machine is where you make your drum beat! Each row is a different drum. Click the squares to turn them ON — lit-up squares will play when the music runs. The machine loops around the 16 steps over and over. Try turning some on and pressing PLAY!'
    },
    kick: {
      icon: '💥',
      title: 'Kick Drum',
      text: 'The kick drum makes a deep BOOM sound — it\'s the heartbeat of the music! Most beats put the kick on beat 1 and beat 3 (squares 1 and 9). Try it and feel the thump!'
    },
    snare: {
      icon: '🥁',
      title: 'Snare Drum',
      text: 'The snare makes a sharp CRACK sound! It usually goes on beat 2 and beat 4 (squares 5 and 13). The kick and snare together make the basic pattern you hear in almost every song!'
    },
    hihat: {
      icon: '✨',
      title: 'Hi-Hat',
      text: 'The hi-hat makes a quick TSSS sound, like a tiny cymbal! Try turning on every single square in this row — it makes the beat feel really fast and exciting. You can try every other one too for a chilled groove.'
    },
    clap: {
      icon: '👏',
      title: 'Clap',
      text: 'The clap sounds just like hands clapping! It adds extra energy to your beat. Try putting it on the same squares as the snare (5 and 13) — that\'s a classic combination!'
    },
    cowbell: {
      icon: '🔔',
      title: 'Cowbell',
      text: 'The cowbell makes a fun CLANG sound! It was used in lots of old rock songs. Try adding it every 4 squares (1, 5, 9, 13) for a groovy Latin feel. As they say — more cowbell!'
    },
    tom: {
      icon: '🎵',
      title: 'Tom Drum',
      text: 'The tom makes a round THUD sound, like a small drum roll! Toms are great for fills — exciting bits that happen right before a new part of the song. Try a few toms at the end of the pattern (squares 14, 15, 16)!'
    },
    piano: {
      icon: '🎹',
      title: 'Piano',
      text: 'These are piano keys! Click or tap them to play notes. The LOW notes are on the LEFT and the HIGH notes are on the RIGHT. Try playing a few in a row — that\'s called a melody! You can scroll the keyboard if you run out of keys.'
    },
    instrument: {
      icon: '🎵',
      title: 'Instrument Picker',
      text: 'Change what your piano sounds like! Piano sounds classic, Bell sparkles and rings, Guitar twangs like a string, and Synth sounds like a spaceship! Pick one and try playing some notes.'
    },
    recorder: {
      icon: '🎤',
      title: 'Melody Recorder',
      text: 'Record a melody you play on the piano and loop it! Press RECORD, then play some notes on the piano keyboard. Press STOP when you\'re done. Then press LOOP to hear it play over and over. You can even have the beat and your melody playing at the same time!'
    },
    pads: {
      icon: '🎉',
      title: 'Fun Pads',
      text: 'These are fun sound effects you can tap any time! Tap COWBELL for a classic clang, AIRHORN for a rising blast, BOING for a bouncy spring, WHISTLE for a sharp tweet, ZAP for a laser, CLAP for a triple clap, WOOSH for a wind sweep, and BELL for a pretty chime!'
    },
  };

  /* ── Open / close helpers ──────────────────────────────── */
  const overlay = document.getElementById('info-modal');
  const icon    = document.getElementById('modal-icon');
  const title   = document.getElementById('modal-title');
  const text    = document.getElementById('modal-text');
  const closeBtn = overlay.querySelector('.modal-close');
  let lastFocus = null;

  function openModal(key) {
    const data = CONTENT[key];
    if (!data) return;
    icon.textContent  = data.icon;
    title.textContent = data.title;
    text.textContent  = data.text;
    lastFocus = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('visible');
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }

  /* ── Event delegation for all info buttons ─────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.info-btn');
    if (btn && btn.dataset.modal) {
      openModal(btn.dataset.modal);
      return;
    }
    /* Close when clicking the backdrop (not the card) */
    if (e.target === overlay) closeModal();
  });

  closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeModal();
  });
})();
