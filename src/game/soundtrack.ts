/**
 * Original procedural ambient soundtrack for Glass Orbit ("Observatory Drift").
 * Composed & synthesized 100% via Web Audio API — zero external audio samples, zero copyright risk.
 */

const CHORD_PROGRESSION = [
  // Dm9 -> Bbmaj7 -> Fmaj7 -> C6/9 (Dorian/Lydian space-observatory mood)
  { bass: 73.42, pad: [146.83, 220.0, 261.63, 329.63], arp: [293.66, 349.23, 440.0, 523.25, 659.25] },
  { bass: 58.27, pad: [116.54, 174.61, 220.0, 293.66], arp: [233.08, 293.66, 349.23, 440.0, 587.33] },
  { bass: 87.31, pad: [174.61, 220.0, 261.63, 329.63], arp: [349.23, 440.0, 523.25, 659.25, 698.46] },
  { bass: 65.41, pad: [130.81, 196.0, 220.0, 293.66], arp: [261.63, 293.66, 392.0, 440.0, 587.33] },
]

class GlassOrbitSoundtrack {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private delaySend: GainNode | null = null
  private timer: number | null = null
  private running = false
  private step = 0

  private ensureContext() {
    if (this.ctx) return this.ctx
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    const ctx = new AudioCtx()

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -16
    compressor.ratio.value = 3

    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(compressor)
    compressor.connect(ctx.destination)

    // Lush space-glass echo bus
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = 0.42
    const feedback = ctx.createGain()
    feedback.gain.value = 0.34
    const delayFilter = ctx.createBiquadFilter()
    delayFilter.type = 'lowpass'
    delayFilter.frequency.value = 1800

    const delaySend = ctx.createGain()
    delaySend.gain.value = 0.38
    delaySend.connect(delay)
    delay.connect(delayFilter)
    delayFilter.connect(feedback)
    feedback.connect(delay)
    delayFilter.connect(master)

    this.ctx = ctx
    this.master = master
    this.delaySend = delaySend
    return ctx
  }

  public start() {
    if (this.running) return
    const ctx = this.ensureContext()
    if (!ctx || !this.master) return
    if (ctx.state === 'suspended') void ctx.resume()

    this.running = true
    const now = ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now)
    this.master.gain.exponentialRampToValueAtTime(0.32, now + 1.6)

    this.tick()
    this.timer = window.setInterval(() => this.tick(), 2000)
  }

  public stop() {
    if (!this.running || !this.ctx || !this.master) return
    this.running = false
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now)
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
  }

  public isRunning() {
    return this.running
  }

  public playCardChime() {
    if (!this.running || !this.ctx || !this.master || !this.delaySend) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const chord = CHORD_PROGRESSION[Math.floor(this.step / 4) % CHORD_PROGRESSION.length]
    const freq = chord.arp[(this.step + 2) % chord.arp.length]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)

    osc.connect(gain)
    gain.connect(this.master)
    gain.connect(this.delaySend)
    osc.start(now)
    osc.stop(now + 1.45)
  }

  private tick() {
    if (!this.running || !this.ctx || !this.master || !this.delaySend) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const chordIndex = Math.floor(this.step / 4) % CHORD_PROGRESSION.length
    const chord = CHORD_PROGRESSION[chordIndex]

    // Every 8 seconds (4 ticks), trigger a slow evolving pad + deep bass drone
    if (this.step % 4 === 0) {
      this.triggerBass(chord.bass, now, 7.8)
      chord.pad.forEach((freq, i) => {
        this.triggerPad(freq, now + i * 0.08, 7.6)
      })
    }

    // Every 2 seconds, play a delicate crystalline glass chime note
    const note = chord.arp[(this.step * 2 + chordIndex) % chord.arp.length]
    this.triggerChime(note, now + 0.15, 2.8)
    if (this.step % 2 === 1) {
      const harmony = chord.arp[(this.step + 3) % chord.arp.length]
      this.triggerChime(harmony, now + 1.05, 2.2)
    }

    this.step += 1
  }

  private triggerBass(freq: number, start: number, duration: number) {
    if (!this.ctx || !this.master) return
    const osc = this.ctx.createOscillator()
    const filter = this.ctx.createBiquadFilter()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(220, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 1.8)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  }

  private triggerPad(freq: number, start: number, duration: number) {
    if (!this.ctx || !this.master || !this.delaySend) return
    const oscA = this.ctx.createOscillator()
    const oscB = this.ctx.createOscillator()
    const filter = this.ctx.createBiquadFilter()
    const gain = this.ctx.createGain()

    oscA.type = 'sine'
    oscB.type = 'triangle'
    oscA.frequency.setValueAtTime(freq, start)
    oscB.frequency.setValueAtTime(freq * 1.0035, start) // subtle warm detune

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(640, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.045, start + 2.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscA.connect(filter)
    oscB.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    gain.connect(this.delaySend)

    oscA.start(start)
    oscB.start(start)
    oscA.stop(start + duration + 0.05)
    oscB.stop(start + duration + 0.05)
  }

  private triggerChime(freq: number, start: number, duration: number) {
    if (!this.ctx || !this.master || !this.delaySend) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gain)
    gain.connect(this.master)
    gain.connect(this.delaySend)

    osc.start(start)
    osc.stop(start + duration + 0.05)
  }
}

export const soundtrack = new GlassOrbitSoundtrack()
