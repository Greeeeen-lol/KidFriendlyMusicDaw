/* sequencer.js — Beat grid DOM + Tone.Sequence engine */
(function () {
  const DRUM_NAMES = ['kick', 'snare', 'hihat', 'clap', 'cowbell', 'tom'];
  let sequence = null;

  /* ── Build the step buttons ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.steps').forEach(function (stepsDiv) {
      const row = parseInt(stepsDiv.dataset.row, 10);
      for (let col = 0; col < 16; col++) {
        const btn = document.createElement('button');
        btn.className = 'step';
        btn.dataset.row = row;
        btn.dataset.col = col;
        btn.setAttribute('aria-label', 'Step ' + (col + 1));
        stepsDiv.appendChild(btn);
      }
    });

    /* Toggle steps on click */
    document.getElementById('sequencer-grid').addEventListener('click', function (e) {
      const step = e.target.closest('.step');
      if (!step) return;
      const row = parseInt(step.dataset.row, 10);
      const col = parseInt(step.dataset.col, 10);
      window.DAW.sequencerGrid[row][col] = !window.DAW.sequencerGrid[row][col];
      step.classList.toggle('active', window.DAW.sequencerGrid[row][col]);
    });

    /* Pad labels: preview drum sound immediately */
    document.querySelectorAll('.pad-label').forEach(function (btn) {
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        Tone.start().then(function () {
          window.DAW.playDrum(btn.dataset.drum);
        });
      });
    });
  });

  /* ── Playhead visual ─────────────────────────────────────── */
  function updatePlayhead(step) {
    document.querySelectorAll('.step.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
    document.querySelectorAll('.step[data-col="' + step + '"]').forEach(function (el) {
      el.classList.add('playing');
    });
  }

  /* Tone.Draw.schedule wrapper with graceful fallback */
  function scheduleDraw(callback, time) {
    try {
      Tone.getDraw().schedule(callback, time);
    } catch (_) {
      const delay = Math.max(0, (time - Tone.now()) * 1000);
      setTimeout(callback, delay);
    }
  }

  /* ── Sequencer controls ──────────────────────────────────── */
  window.DAW.startSequencer = function () {
    Tone.start().then(function () {
      if (sequence) {
        sequence.stop();
        sequence.dispose();
      }

      const steps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      sequence = new Tone.Sequence(function (time, step) {
        scheduleDraw(function () { updatePlayhead(step); }, time);
        DRUM_NAMES.forEach(function (name, rowIdx) {
          if (window.DAW.sequencerGrid[rowIdx][step]) {
            window.DAW.playDrum(name, time);
          }
        });
      }, steps, '16n');

      sequence.start(0);
      Tone.getTransport().start();
      window.DAW.isPlaying = true;
    });
  };

  window.DAW.stopSequencer = function () {
    Tone.getTransport().stop();
    if (sequence) sequence.stop();
    window.DAW.isPlaying = false;
    document.querySelectorAll('.step.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
  };

  window.DAW.clearSequencer = function () {
    window.DAW.stopSequencer();
    window.DAW.sequencerGrid = Array(6).fill(null).map(function () {
      return Array(16).fill(false);
    });
    document.querySelectorAll('.step').forEach(function (el) {
      el.classList.remove('active', 'playing');
    });
  };

  /* Load a grid from a 2-D boolean array (used by preset loader) */
  window.DAW.loadGrid = function (grid) {
    window.DAW.stopSequencer();
    window.DAW.sequencerGrid = grid.map(function (row) { return row.slice(); });
    document.querySelectorAll('.step').forEach(function (el) {
      const row = parseInt(el.dataset.row, 10);
      const col = parseInt(el.dataset.col, 10);
      el.classList.toggle('active', !!window.DAW.sequencerGrid[row][col]);
      el.classList.remove('playing');
    });
  };
})();
