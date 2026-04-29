import { useRef, useCallback, useState } from "react"

// ── Three-section jazz form ──────────────────────────────────────────────────
//
//  A  ii-V-I-vi  (the standard turnaround)
//  B  iii-VI7alt-IVmaj9-bVII13  (modal colour, borrowed chords)
//  BR bII7-Imaj9-V7/ii-ii9  (chromatic bridge back to top)
//
// Voicings: root + 3/5/7 + one extension, lower register.
// Frequencies in Hz, sorted ascending per chord.

const CHORDS: number[][] = [
  // ── A SECTION ──────────────────────────────────────────────────────────────
  // 1. Dm9   D2 F2 A2 C3 E3   (root 3 5 b7 9)
  [73.42, 87.31, 110.00, 130.81, 164.81],
  // 2. G13   G2 B2 E3 F3 A3   (root 3 13 b7 9 — B/F tritone = dominant tension)
  [98.00, 123.47, 164.81, 174.61, 220.00],
  // 3. Cmaj9 C2 G2 B2 D3 E3   (root 5 maj7 9 3)
  [65.41, 98.00, 123.47, 146.83, 164.81],
  // 4. Am11  A1 E2 G2 C3 D3   (root 5 b7 b3 11)
  [55.00, 82.41, 98.00, 130.81, 146.83],

  // ── B SECTION ──────────────────────────────────────────────────────────────
  // 5. Em7   E2 G2 B2 D3       (iii7 — brighter tonic colour)
  [82.41, 98.00, 123.47, 146.83],
  // 6. A7b9  A2 C#3 E3 G3 Bb3  (VI7alt — altered dominant, maximum colour)
  [110.00, 138.59, 164.81, 196.00, 233.08],
  // 7. Fmaj9 F2 A2 C3 E3 G3   (IVmaj9 — warm, gospel-adjacent)
  [87.31, 110.00, 130.81, 164.81, 196.00],
  // 8. Bb13  Bb1 D2 F2 Ab2 G3  (bVII13 — Mixolydian blue note)
  [58.27, 73.42, 87.31, 103.83, 196.00],

  // ── BRIDGE ─────────────────────────────────────────────────────────────────
  // 9.  Db7   Db2 F2 Ab2 B2    (bII7 tritone-sub of G7 — peak tension)
  [69.30, 87.31, 103.83, 123.47],
  // 10. Cmaj9 C2 G2 B2 D3 E3   (resolution — same as bar 3, newly earned)
  [65.41, 98.00, 123.47, 146.83, 164.81],
  // 11. A7    A1 C#2 E2 G2     (V7/ii — secondary dominant, sets up the turn)
  [55.00, 69.30, 82.41, 98.00],
  // 12. Dm9   D2 F2 A2 C3 E3   (back to ii — seamlessly leads into bar 1)
  [73.42, 87.31, 110.00, 130.81, 164.81],
]

// Melody note per chord (Hz) or null for a rest.
// Plays as a quiet sine, an octave above the pad, 0.25s after chord onset.
const MELODY: (number | null)[] = [
  329.63,  //  1. Dm9:   E4 — 9th, floats above
  293.66,  //  2. G13:   D4 — suspension over the dominant
  261.63,  //  3. Cmaj9: C4 — root lands, satisfied
  null,    //  4. Am11:  rest — breathe
  246.94,  //  5. Em7:   B3 — 5th, quiet and bright
  220.00,  //  6. A7b9:  A3 — root, anchored over the tension
  220.00,  //  7. Fmaj9: A3 — maj3rd of F, warm
  null,    //  8. Bb13:  rest — chord is lush enough
  null,    //  9. Db7:   rest — let the tritone sub speak
  329.63,  // 10. Cmaj9: E4 — warmth of resolution, up an octave
  277.18,  // 11. A7:    C#4 — major 3rd, bittersweet leading tone
  293.66,  // 12. Dm9:   D4 — root, cycle closes
]

const CHORD_DUR  = 2.5   // seconds per chord (user-set)
const ATTACK     = 0.25  // pad attack — quick, pianistic
const RELEASE    = 1.0   // pad release length (starts at CHORD_DUR - RELEASE)
const CROSSFADE  = 1.3   // next chord starts this many seconds before current ends
const STRUM      = 0.06  // seconds between each note in the strum
const MASTER_VOL = 0.42

export function useAmbientMusic() {
  const [muted, setMuted] = useState(false)

  const ctxRef      = useRef<AudioContext | null>(null)
  const masterRef   = useRef<GainNode | null>(null)
  const reverbInRef = useRef<GainNode | null>(null)
  const chordIdxRef = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef   = useRef(false)
  const mutedRef    = useRef(false)

  const scheduleChord = useCallback(() => {
    if (!activeRef.current || !ctxRef.current || !reverbInRef.current) return
    const ctx      = ctxRef.current
    const reverbIn = reverbInRef.current
    const t        = ctx.currentTime

    // Capture index before incrementing so MELODY aligns with CHORDS
    const idx    = chordIdxRef.current
    chordIdxRef.current++
    const freqs    = CHORDS[idx % CHORDS.length]
    const melFreq  = MELODY[idx % MELODY.length]

    // ── Pad chord ────────────────────────────────────────────────────────────
    freqs.forEach((freq, noteIdx) => {
      const nt = t + noteIdx * STRUM  // strum: low→high

      const env = ctx.createGain()
      env.gain.setValueAtTime(0, nt)
      env.gain.linearRampToValueAtTime(0.058, nt + ATTACK)
      env.gain.setValueAtTime(0.058, nt + CHORD_DUR - RELEASE)
      env.gain.linearRampToValueAtTime(0, nt + CHORD_DUR)
      env.connect(reverbIn)

      // Filter: dark on onset, opens up on attack, settles dark again for release
      const filt = ctx.createBiquadFilter()
      filt.type = "lowpass"
      filt.frequency.setValueAtTime(300, nt)
      filt.frequency.linearRampToValueAtTime(2000, nt + ATTACK)
      filt.frequency.exponentialRampToValueAtTime(700, nt + CHORD_DUR - RELEASE * 0.5)
      filt.Q.value = 0.45
      filt.connect(env)

      // Primary: triangle (warm odd harmonics)
      const osc = ctx.createOscillator()
      osc.type = "triangle"
      osc.frequency.value = freq
      osc.connect(filt)
      osc.start(nt)
      osc.stop(nt + CHORD_DUR + 0.3)

      // Chorus: two detuned sines ±9 cents
      ;[-9, 9].forEach(cents => {
        const ch = ctx.createOscillator()
        const cg = ctx.createGain()
        ch.type = "sine"
        ch.frequency.value = freq
        ch.detune.value = cents
        cg.gain.value = 0.32
        ch.connect(cg)
        cg.connect(filt)
        ch.start(nt)
        ch.stop(nt + CHORD_DUR + 0.3)
      })

      // Shimmer: octave-up sine fades in briefly then out (string resonance)
      const sh = ctx.createOscillator()
      const sg = ctx.createGain()
      sh.type = "sine"
      sh.frequency.value = freq * 2
      sg.gain.setValueAtTime(0, nt)
      sg.gain.linearRampToValueAtTime(0.016, nt + ATTACK * 0.5)
      sg.gain.linearRampToValueAtTime(0, nt + ATTACK * 2.2)
      sh.connect(sg)
      sg.connect(reverbIn)
      sh.start(nt)
      sh.stop(nt + ATTACK * 2.5)
    })

    // ── Bass note ────────────────────────────────────────────────────────────
    // Root of each chord, punchy and dry (no reverb) for rhythmic definition
    const bassOsc  = ctx.createOscillator()
    const bassGain = ctx.createGain()
    bassOsc.type = "sine"
    bassOsc.frequency.value = freqs[0]  // lowest note = chord root
    bassGain.gain.setValueAtTime(0, t)
    bassGain.gain.linearRampToValueAtTime(0.22, t + 0.04)
    bassGain.gain.exponentialRampToValueAtTime(0.07, t + 0.55)
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + CHORD_DUR - 0.15)
    bassOsc.connect(bassGain)
    bassGain.connect(masterRef.current!)  // dry — no reverb on bass
    bassOsc.start(t)
    bassOsc.stop(t + CHORD_DUR)

    // ── Melody note ──────────────────────────────────────────────────────────
    if (melFreq !== null) {
      const mt     = t + 0.25   // slight delay after chord onset
      const melOsc  = ctx.createOscillator()
      const melGain = ctx.createGain()
      melOsc.type = "sine"
      melOsc.frequency.value = melFreq
      melGain.gain.setValueAtTime(0, mt)
      melGain.gain.linearRampToValueAtTime(0.048, mt + 0.1)   // soft attack
      melGain.gain.exponentialRampToValueAtTime(0.018, mt + 0.9)  // breath decay
      melGain.gain.exponentialRampToValueAtTime(0.001, mt + 1.7)
      melOsc.connect(melGain)
      melGain.connect(reverbIn)   // melody in reverb — airy
      melOsc.start(mt)
      melOsc.stop(mt + 1.8)
    }

    timerRef.current = setTimeout(scheduleChord, (CHORD_DUR - CROSSFADE) * 1000)
  }, [])

  const start = useCallback(() => {
    if (activeRef.current) return
    const ctx = new AudioContext()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(MASTER_VOL, ctx.currentTime + 4)
    master.connect(ctx.destination)
    masterRef.current = master

    // Three-tap Schroeder reverb
    const reverbIn = ctx.createGain()
    reverbIn.gain.value = 1;
    [[0.241, 0.32], [0.389, 0.27], [0.571, 0.21]].forEach(([time, fb]) => {
      const d = ctx.createDelay(4)
      const f = ctx.createGain()
      d.delayTime.value = time
      f.gain.value = fb
      reverbIn.connect(d)
      d.connect(f)
      f.connect(d)
      d.connect(master)
    })
    reverbIn.connect(master)
    reverbInRef.current = reverbIn

    activeRef.current = true
    chordIdxRef.current = 0
    scheduleChord()
  }, [scheduleChord])

  const stop = useCallback(() => {
    activeRef.current = false
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    const ctx    = ctxRef.current
    const master = masterRef.current
    ctxRef.current = null
    masterRef.current = null
    reverbInRef.current = null
    if (ctx && master) {
      try {
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
      } catch { /* context may have already closed */ }
      setTimeout(() => ctx.close().catch(() => {}), 2500)
    }
  }, [])

  const toggle = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (ctx && master) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(next ? 0 : MASTER_VOL, ctx.currentTime + 0.6)
    }
  }, [])

  return { start, stop, toggle, muted }
}
