# Drum Samples

Place short royalty-free WAV files here to replace the synthesized drum sounds.

Expected filenames:
- `kick.wav`
- `snare.wav`
- `hihat.wav`
- `clap.wav`
- `cowbell.wav`
- `tom.wav`

The app currently uses Tone.js synthesized sounds (MembraneSynth, NoiseSynth, MetalSynth)
which work great out of the box with no files needed.

To switch to sample-based playback, replace the drum synths in `js/audio.js` with
a `Tone.Sampler` pointing to this folder:

```js
const drumSampler = new Tone.Sampler({
  urls: {
    C2: 'kick.wav', D2: 'snare.wav', E2: 'hihat.wav',
    F2: 'clap.wav', G2: 'cowbell.wav', A2: 'tom.wav',
  },
  baseUrl: 'sounds/',
}).connect(masterVol);
```

Free sample packs: freesound.org, sampleswap.org, looperman.com
