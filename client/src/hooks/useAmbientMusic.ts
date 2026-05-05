import { useRef, useCallback, useState } from "react"

// ── Three-section parlour form in C major ────────────────────────────────────
//
//  A  I-V-vi-IV   (the bright classic turnaround)
//  B  IV-I-ii-V9  (warm walk with an open dominant)
//  BR iii-IV-I-V7sus4  (sunny stroll home, suspension before bar 1)
//
// Voicings: root + 3/5/7 in the mid register — no ominous bass rumble.
// Frequencies in Hz, sorted ascending per chord.

const CHORDS: number[][] = [
  // ── A SECTION ──────────────────────────────────────────────────────────────
  // 1. Cmaj9   C2 G2 B2 D3 E3   (home — open, bright)
  [65.41, 98.00, 123.47, 146.83, 164.81],
  // 2. G7      G2 B2 D3 F3      (dominant — classic bright tension)
  [98.00, 123.47, 146.83, 174.61],
  // 3. Am7     A2 C3 E3 G3      (relative minor — gentle, not dark)
  [110.00, 130.81, 164.81, 196.00],
  // 4. Fmaj7   F2 A2 C3 E3      (subdominant — warm lift)
  [87.31, 110.00, 130.81, 164.81],

  // ── B SECTION ──────────────────────────────────────────────────────────────
  // 5. Fmaj9   F2 A2 C3 E3 G3   (subdominant with colour, brighter)
  [87.31, 110.00, 130.81, 164.81, 196.00],
  // 6. Cmaj7   C2 E2 G2 B2      (lower tonic voicing — settled warmth)
  [65.41, 82.41, 98.00, 123.47],
  // 7. Dm7     D2 F2 A2 C3      (supertonic — light, not dark)
  [73.42, 87.31, 110.00, 130.81],
  // 8. G9      G2 B2 D3 A3      (dominant 9 — more open than plain G7)
  [98.00, 123.47, 146.83, 220.00],

  // ── BRIDGE ─────────────────────────────────────────────────────────────────
  // 9.  Em7     E2 G2 B2 D3     (mediant — a brighter colour before IV)
  [82.41, 98.00, 123.47, 146.83],
  // 10. Fmaj7   F2 A2 C3 E3     (subdominant lift before home)
  [87.31, 110.00, 130.81, 164.81],
  // 11. Cmaj9   C2 G2 B2 D3 E3  (home again, earned)
  [65.41, 98.00, 123.47, 146.83, 164.81],
  // 12. G7sus4  G2 C3 D3 F3     (suspended dominant — breathe before bar 1)
  [98.00, 130.81, 146.83, 174.61],
]

// Melody note per chord (Hz) or null for a rest.
// Plays as a quiet sine 0.2s after chord onset — bright, singable, major key.
const MELODY: (number | null)[] = [
  329.63,  //  1. Cmaj9:   E4 — bright 3rd, home
  293.66,  //  2. G7:      D4 — 5th of G, step down
  261.63,  //  3. Am7:     C4 — settle, smooth step
  440.00,  //  4. Fmaj7:   A4 — sunny leap to 3rd of F
  392.00,  //  5. Fmaj9:   G4 — 9th, floaty step down
  329.63,  //  6. Cmaj7:   E4 — home again, step down
  null,    //  7. Dm7:     rest — breathe
  392.00,  //  8. G9:      G4 — root of G, restart after rest
  329.63,  //  9. Em7:     E4 — root of Em (=3rd of C), gentle step
  440.00,  // 10. Fmaj7:   A4 — sunny 3rd of F, leap up again
  329.63,  // 11. Cmaj9:   E4 — resolve home
  261.63,  // 12. G7sus4:  C4 — the sus4 note itself, sweet step down
]

const CHORD_DUR  = 2.5   // seconds per chord (user-set)
const ATTACK     = 0.18  // snappier attack — more lively than the old 0.25
const RELEASE    = 0.85  // shorter sustain — airier feel
const CROSSFADE  = 1.2   // next chord starts this many seconds before current ends
const STRUM      = 0.055 // slightly tighter strum
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
