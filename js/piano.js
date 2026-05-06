/* piano.js — Generates the on-screen keyboard and handles playback */
(function () {
  const WHITE_KEY_W = 42; // px — must match piano.css .white-key width
  const BLACK_KEY_W = 28; // px — must match piano.css .black-key width

  const NOTE_NAMES  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const BLACK_NOTES = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);
  const OCTAVES     = [3, 4];

  /* How many white-key widths from the left of the octave each black key sits */
  const BLACK_OFFSET_IN_OCTAVE = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 };

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('piano-keys');
    buildKeys(container);
    attachEvents(container);
  });

  function buildKeys(container) {
    const totalWhiteKeys = OCTAVES.length * 7; // 7 white notes per octave
    container.style.width  = (totalWhiteKeys * WHITE_KEY_W) + 'px';
    container.style.height = ''; // controlled by CSS

    let whiteIdx = 0; // running count of white keys placed

    OCTAVES.forEach(function (octave) {
      const octaveWhiteBase = whiteIdx;

      NOTE_NAMES.forEach(function (note) {
        const isBlack = BLACK_NOTES.has(note);
        const fullNote = note + octave;
        const btn = document.createElement('button');
        btn.dataset.note = fullNote;
        btn.setAttribute('aria-label', fullNote);

        if (isBlack) {
          btn.className = 'piano-key black-key';
          const leftPos =
            (octaveWhiteBase + BLACK_OFFSET_IN_OCTAVE[note]) * WHITE_KEY_W +
            WHITE_KEY_W - BLACK_KEY_W / 2;
          btn.style.left = leftPos + 'px';
        } else {
          btn.className = 'piano-key white-key';
          btn.style.left = (whiteIdx * WHITE_KEY_W) + 'px';
          /* Show note name on C keys only */
          if (note === 'C') btn.textContent = fullNote;
          whiteIdx++;
        }

        container.appendChild(btn);
      });
    });
  }

  /* Track which notes are currently pressed (prevents stuck notes) */
  const pressed = new Set();

  function pressKey(key) {
    if (pressed.has(key.dataset.note)) return;
    pressed.add(key.dataset.note);
    key.classList.add('pressed');

    Tone.start().then(function () {
      const note = key.dataset.note;
      window.DAW.playNote(note);
      if (window.DAW.recorderActive) window.DAW.recordNote(note);
    });
  }

  function releaseKey(key) {
    if (!key || !pressed.has(key.dataset.note)) return;
    pressed.delete(key.dataset.note);
    key.classList.remove('pressed');
    window.DAW.releaseNote(key.dataset.note);
  }

  function attachEvents(container) {
    /* Pointer events handle both mouse and touch uniformly */
    container.addEventListener('pointerdown', function (e) {
      const key = e.target.closest('.piano-key');
      if (!key) return;
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      pressKey(key);
    });

    container.addEventListener('pointermove', function (e) {
      if (e.buttons === 0) return; // not dragging
      const key = document.elementFromPoint(e.clientX, e.clientY);
      const pianoKey = key && key.closest('.piano-key');

      /* Release keys we've moved away from */
      pressed.forEach(function (note) {
        const el = container.querySelector('[data-note="' + note + '"]');
        if (el && el !== pianoKey) releaseKey(el);
      });

      if (pianoKey && !pressed.has(pianoKey.dataset.note)) pressKey(pianoKey);
    });

    container.addEventListener('pointerup', function (e) {
      pressed.forEach(function (note) {
        const el = container.querySelector('[data-note="' + note + '"]');
        if (el) releaseKey(el);
      });
    });

    container.addEventListener('pointercancel', function () {
      pressed.forEach(function (note) {
        const el = container.querySelector('[data-note="' + note + '"]');
        if (el) { el.classList.remove('pressed'); }
      });
      pressed.clear();
    });
  }
})();
