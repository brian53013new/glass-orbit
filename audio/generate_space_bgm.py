import math
import struct
import wave


def midi_to_hz(midi_note: int) -> float:
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))


def generate_space_bgm(
    output_path: str = "Glass_Orbit_Space_BGM.wav",
    duration: float = 29.0,
    sr: int = 48000,
) -> None:
    """Synthesize a soft, lush ambient space soundtrack (Cm9 - Abmaj7 - Eb6 - Bb6, 96 BPM).

    100% deterministic mathematical waveform synthesis using Python standard library only.
    """
    bpm = 96.0
    step_sec = 60.0 / bpm / 2.0  # gentle 8th-note grid
    total_samples = int(duration * sr)

    # Lush 4-bar space progression: (Bass MIDI, Pad chord MIDI list, Bell arpeggio MIDI list)
    chords = [
        (48, [60, 63, 67, 74], [72, 74, 75, 79, 75, 74, 72, 67]),  # Cm9
        (44, [56, 60, 63, 67], [68, 72, 75, 79, 75, 72, 68, 63]),  # Abmaj7
        (51, [58, 63, 67, 72], [70, 72, 75, 79, 75, 72, 70, 67]),  # Eb6
        (46, [58, 62, 65, 70], [70, 74, 77, 82, 77, 74, 70, 65]),  # Bb6
    ]

    # Pre-allocate dry stereo float buffers for clean stereo delay/reverb tail
    dry_l = [0.0] * total_samples
    dry_r = [0.0] * total_samples

    for i in range(total_samples):
        t = i / sr
        step_idx = int(t / step_sec)
        step_t = t % step_sec
        step_pos = step_t / step_sec

        bar_idx = (step_idx // 8) % len(chords)
        bar_pos = ((t % (step_sec * 8)) / (step_sec * 8))
        note_idx = step_idx % 8

        bass_midi, pad_notes, arp = chords[bar_idx]
        lead_midi = arp[note_idx]

        # 1. Warm sub-bass (pure sine + gentle 2nd harmonic, smooth bar envelope)
        bass_hz = midi_to_hz(bass_midi)
        bass_env = min(1.0, bar_pos / 0.06) * (0.85 + 0.15 * math.cos(math.pi * bar_pos))
        bass = (
            math.sin(2.0 * math.pi * bass_hz * t)
            + 0.18 * math.sin(2.0 * math.pi * (bass_hz * 2.0) * t)
        ) * 0.20 * bass_env

        # 2. Lush detuned ambient pad (3-voice chord with slow LFO breathing)
        lfo = 0.78 + 0.22 * math.sin(2.0 * math.pi * 0.18 * t)
        pad_env = min(1.0, bar_pos / 0.12) * min(1.0, (1.0 - bar_pos) / 0.08 + 0.25)
        pad_l = 0.0
        pad_r = 0.0
        for idx_n, m in enumerate(pad_notes):
            hz = midi_to_hz(m)
            # Slight stereo detune (+/- 0.35 Hz) for rich warm chorus
            detune = 0.35 if idx_n % 2 == 0 else -0.35
            pad_l += math.sin(2.0 * math.pi * (hz - detune) * t)
            pad_r += math.sin(2.0 * math.pi * (hz + detune) * t)
        pad_l = (pad_l / len(pad_notes)) * 0.22 * lfo * pad_env
        pad_r = (pad_r / len(pad_notes)) * 0.22 * lfo * pad_env

        # 3. Soft bell / celesta arpeggio (smooth attack + warm exponential decay)
        lead_hz = midi_to_hz(lead_midi)
        attack = min(1.0, step_t / 0.018)
        decay = math.exp(-4.2 * step_pos)
        bell = (
            math.sin(2.0 * math.pi * lead_hz * t)
            + 0.22 * math.sin(2.0 * math.pi * (lead_hz * 2.0) * t) * math.exp(-7.0 * step_pos)
            + 0.06 * math.sin(2.0 * math.pi * (lead_hz * 3.0) * t) * math.exp(-10.0 * step_pos)
        ) * attack * decay * 0.15

        # Gentle stereo pan alternation on bell notes
        pan = 0.38 if note_idx % 2 == 0 else 0.62
        dry_l[i] = bass + pad_l + bell * (1.0 - pan * 0.4)
        dry_r[i] = bass + pad_r + bell * (0.6 + pan * 0.4)

    # 4. Deterministic ping-pong stereo delay (290 ms & 435 ms) for orbital space depth
    d1 = int(0.290 * sr)
    d2 = int(0.435 * sr)
    wet_l = [0.0] * total_samples
    wet_r = [0.0] * total_samples
    for i in range(total_samples):
        l_acc = dry_l[i]
        r_acc = dry_r[i]
        if i >= d1:
            l_acc += dry_r[i - d1] * 0.24
            r_acc += dry_l[i - d1] * 0.24
        if i >= d2:
            l_acc += wet_l[i - d2] * 0.22
            r_acc += wet_r[i - d2] * 0.22
        wet_l[i] = l_acc
        wet_r[i] = r_acc

    # 5. Write 16-bit stereo WAV with 0.8s fade-in and 2.0s fade-out
    with wave.open(output_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)

        buf = bytearray()
        for i in range(total_samples):
            t = i / sr
            fade = 1.0
            if t < 0.8:
                fade = t / 0.8
            elif t > duration - 2.0:
                fade = max(0.0, (duration - t) / 2.0)

            l_pcm = max(-32767, min(32767, int(wet_l[i] * fade * 15500)))
            r_pcm = max(-32767, min(32767, int(wet_r[i] * fade * 15500)))
            buf.extend(struct.pack("<hh", l_pcm, r_pcm))

        wf.writeframes(bytes(buf))


if __name__ == "__main__":
    generate_space_bgm()
    print("Generated soft ambient Glass_Orbit_Space_BGM.wav")
