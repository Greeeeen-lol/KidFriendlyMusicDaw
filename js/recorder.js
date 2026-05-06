/* recorder.js — Record notes played on the piano, loop them back */
(function () {
  let events       = [];   // [{ note, time }] times in seconds from recordingStart
  let recordStart  = 0;
  let totalDur     = 0;
  let loopPart     = null;
  let isLooping    = false;

  /* Status display helper */
  function setStatus(text, cls) {
    const el = document.getElementById('recorder-status');
    el.textContent = text;
    el.className = 'recorder-status ' + (cls || '');
  }

  /* Button enable/disable helper */
  function setBtns(rec, stop, loop, stopLoop, clear) {
    document.getElementById('record-btn').disabled      = !rec;
    document.getElementById('stop-record-btn').disabled = !stop;
    document.getElementById('play-loop-btn').disabled   = !loop;
    document.getElementById('stop-loop-btn').disabled   = !stopLoop;
    document.getElementById('clear-record-btn').disabled = !clear;
  }

  /* ── Public API (called by piano.js and ui.js) ───────────── */
  window.DAW.recordNote = function (note) {
    if (!window.DAW.recorderActive) return;
    const t = (Date.now() - recordStart) / 1000;
    events.push([t, note]);
  };

  window.DAW.startRecording = function () {
    stopLoop();
    events     = [];
    recordStart = Date.now();
    window.DAW.recorderActive = true;
    setStatus('🔴 Recording… play the piano!', 'recording');
    setBtns(false, true, false, false, false);
  };

  window.DAW.stopRecording = function () {
    window.DAW.recorderActive = false;
    totalDur = (Date.now() - recordStart) / 1000;
    const hasNotes = events.length > 0;
    setStatus(hasNotes ? 'Recorded! Press Loop to play.' : 'Nothing recorded yet.', '');
    setBtns(true, false, hasNotes, false, hasNotes);
  };

  window.DAW.playLoop = function () {
    if (events.length === 0) return;
    stopLoop();

    Tone.start().then(function () {
      loopPart = new Tone.Part(function (audioTime, note) {
        window.DAW.activeMelodySynth.triggerAttackRelease(note, '8n', audioTime);
      }, events);

      loopPart.loop    = true;
      loopPart.loopEnd = Math.max(totalDur, 0.25);

      /* Start relative to transport; don't restart transport if beat is running */
      if (Tone.getTransport().state === 'started') {
        loopPart.start('+0');
      } else {
        loopPart.start(0);
        Tone.getTransport().start();
      }

      isLooping = true;
      setStatus('▶ Looping your melody!', 'playing');
      setBtns(true, false, false, true, false);
    });
  };

  function stopLoop() {
    if (loopPart) {
      loopPart.stop();
      loopPart.dispose();
      loopPart = null;
    }
    isLooping = false;
    /* Stop transport only if sequencer is also idle */
    if (!window.DAW.isPlaying && Tone.getTransport().state === 'started') {
      Tone.getTransport().stop();
    }
  }

  window.DAW.stopLoop = function () {
    stopLoop();
    const hasNotes = events.length > 0;
    setStatus(hasNotes ? 'Stopped. Press Loop to replay.' : 'Ready to record 🎤', '');
    setBtns(true, false, hasNotes, false, hasNotes);
  };

  window.DAW.clearRecording = function () {
    stopLoop();
    events   = [];
    totalDur = 0;
    setStatus('Ready to record 🎤', '');
    setBtns(true, false, false, false, false);
  };

  /* Wire up buttons once DOM is ready */
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('record-btn').addEventListener('click', function () {
      window.DAW.startRecording();
    });
    document.getElementById('stop-record-btn').addEventListener('click', function () {
      window.DAW.stopRecording();
    });
    document.getElementById('play-loop-btn').addEventListener('click', function () {
      window.DAW.playLoop();
    });
    document.getElementById('stop-loop-btn').addEventListener('click', function () {
      window.DAW.stopLoop();
    });
    document.getElementById('clear-record-btn').addEventListener('click', function () {
      window.DAW.clearRecording();
    });
  });
})();
