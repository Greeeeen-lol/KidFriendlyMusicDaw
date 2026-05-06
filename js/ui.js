/* ui.js — Transport, BPM, volume, instrument picker, sound pads, presets */
(function () {
  document.addEventListener('DOMContentLoaded', function () {

    /* ── Transport ─────────────────────────────────────────── */
    document.getElementById('play-btn').addEventListener('click', function () {
      window.DAW.startSequencer();
    });

    document.getElementById('stop-btn').addEventListener('click', function () {
      window.DAW.stopSequencer();
    });

    document.getElementById('clear-btn').addEventListener('click', function () {
      window.DAW.clearSequencer();
    });

    /* ── BPM slider ────────────────────────────────────────── */
    const bpmSlider  = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');

    bpmSlider.addEventListener('input', function () {
      const bpm = parseInt(this.value, 10);
      bpmDisplay.textContent = bpm;
      window.DAW.setBpm(bpm);
    });

    /* ── Volume slider ─────────────────────────────────────── */
    document.getElementById('volume-slider').addEventListener('input', function () {
      window.DAW.setVolume(parseInt(this.value, 10));
    });

    /* ── Instrument picker ─────────────────────────────────── */
    document.querySelectorAll('.instrument-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.instrument-btn').forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        const inst = btn.dataset.instrument;
        window.DAW.selectedInstrument = inst;
        window.DAW.activeMelodySynth  = window.DAW.melodySynths[inst];
      });
    });

    /* ── Sound pads ────────────────────────────────────────── */
    document.querySelectorAll('.sound-pad').forEach(function (pad) {
      pad.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        window.DAW.playPad(pad.dataset.sound);
      });
    });

    /* ── Preset loader ─────────────────────────────────────── */
    document.getElementById('load-preset-btn').addEventListener('click', function () {
      const preset = document.getElementById('preset-select').value;
      if (!preset) return;
      fetch('presets/' + preset + '.json')
        .then(function (r) {
          if (!r.ok) throw new Error('Not found');
          return r.json();
        })
        .then(function (data) {
          if (data.bpm) {
            bpmSlider.value        = data.bpm;
            bpmDisplay.textContent = data.bpm;
            window.DAW.setBpm(data.bpm);
          }
          window.DAW.loadGrid(data.grid);
        })
        .catch(function () {
          alert('Could not load preset. Make sure the presets/ folder is on a web server.');
        });
    });

    /* ── Save / Load beat (localStorage) ──────────────────── */
    document.getElementById('save-beat-btn').addEventListener('click', function () {
      const data = {
        bpm:  window.DAW.bpm,
        grid: window.DAW.sequencerGrid,
      };
      try {
        localStorage.setItem('musicmaker_beat', JSON.stringify(data));
        showToast('Beat saved! 💾');
      } catch (_) {
        alert('Could not save — storage may be full.');
      }
    });

    document.getElementById('load-beat-btn').addEventListener('click', function () {
      try {
        const raw = localStorage.getItem('musicmaker_beat');
        if (!raw) { showToast('No saved beat found.'); return; }
        const data = JSON.parse(raw);
        if (data.bpm) {
          bpmSlider.value        = data.bpm;
          bpmDisplay.textContent = data.bpm;
          window.DAW.setBpm(data.bpm);
        }
        window.DAW.loadGrid(data.grid);
        showToast('Beat loaded! 📂');
      } catch (_) {
        alert('Could not load saved beat.');
      }
    });

  });

  /* ── Toast notification ────────────────────────────────── */
  function showToast(msg) {
    let toast = document.getElementById('daw-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'daw-toast';
      Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '1.5rem',
        left:         '50%',
        transform:    'translateX(-50%)',
        background:   '#7c4dff',
        color:        '#fff',
        padding:      '0.6rem 1.4rem',
        borderRadius: '999px',
        fontFamily:   "'Nunito', sans-serif",
        fontWeight:   '700',
        fontSize:     '0.95rem',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.4)',
        zIndex:       '2000',
        transition:   'opacity 0.3s',
        pointerEvents:'none',
      });
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.style.opacity = '0'; }, 2200);
  }
})();
