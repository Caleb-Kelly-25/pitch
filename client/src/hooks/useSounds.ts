import { useRef, useCallback } from "react"

function getCtx(ref: React.MutableRefObject<AudioContext | null>): AudioContext {
  if (!ref.current) ref.current = new AudioContext()
  if (ref.current.state === "suspended") ref.current.resume()
  return ref.current
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  // Short percussive noise burst — card slapped onto felt
  const playCard = useCallback(() => {
    const ctx = getCtx(ctxRef)
    const sampleRate = ctx.sampleRate
    const buf = ctx.createBuffer(1, Math.ceil(sampleRate * 0.07), sampleRate)
    const d = buf.getChannelData(0)
    const tau = sampleRate * 0.011
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / tau)
    }
    const src = ctx.createBufferSource()
    src.buffer = buf

    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 1300
    bp.Q.value = 1.2

    const gain = ctx.createGain()
    gain.gain.value = 0.55

    src.connect(bp)
    bp.connect(gain)
    gain.connect(ctx.destination)
    src.start()
  }, [])

  // Ascending C-E-G arpeggio — trick won
  const playTrickWin = useCallback(() => {
    const ctx = getCtx(ctxRef)
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.13
      const osc = ctx.createOscillator()
      osc.type = "triangle"
      osc.frequency.value = freq

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.55)
    })
  }, [])

  // Rapid series of card-snap bursts — shuffle / deal
  const playShuffle = useCallback(() => {
    const ctx = getCtx(ctxRef)
    const count = 10
    for (let i = 0; i < count; i++) {
      const startTime = ctx.currentTime + i * 0.055 + Math.random() * 0.012
      const sampleRate = ctx.sampleRate
      const buf = ctx.createBuffer(1, Math.ceil(sampleRate * 0.045), sampleRate)
      const d = buf.getChannelData(0)
      const tau = sampleRate * 0.008
      for (let j = 0; j < d.length; j++) {
        d[j] = (Math.random() * 2 - 1) * Math.exp(-j / tau)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf

      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.value = 850 + Math.random() * 700
      filter.Q.value = 1.5

      const gain = ctx.createGain()
      gain.gain.value = 0.18 + Math.random() * 0.1

      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start(startTime)
    }
  }, [])

  return { playCard, playTrickWin, playShuffle }
}
