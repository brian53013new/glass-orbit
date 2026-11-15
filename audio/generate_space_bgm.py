import math
import struct
import wave


def midi_to_hz(midi_note: int) -> float:
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))


def generate_space_bgm(output_path: str = "Glass_Orbit_Space_BGM.wav", duration: float = 29.0, sr: int = 48000) -> None:
    """Synthesize a clean 8-bit space synth track (Cm - Ab - Eb - Bb, 112 BPM)."""
    bpm = 112.0
    step_sec = 60.0 / bpm / 2.0  # 8th-note grid
    total_samples = int(duration * sr)

    # Chord progression: (Bass MIDI, [8-step Arpeggio MIDI notes])
    chords = [
        (48, [60, 63, 67, 72, 67, 63, 70, 67]),  # Cm
        (44, [56, 60, 63, 68, 63, 60, 67, 63]),  # Ab
        (51, [63, 67, 70, 75, 70, 67, 72, 70]),  # Eb
        (46, [58, 62, 65, 70, 65, 62, 69, 65]),  # Bb
    ]

    with wave.open(output_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)

        buf = bytearray()
        for i in range(total_samples):
            t = i / sr
            step_idx = int(t / step_sec)
            step_pos = (t % step_sec) / step_sec
            bar_idx = (step_idx // 8) % len(chords)
            note_idx = step_idx % 8
            bass_midi, arp = chords[bar_idx]
            lead_midi = arp[note_idx]

            # 1. Triangle wave bass
            bass_phase = (t * midi_to_hz(bass_midi)) % 1.0
            bass = (4.0 * abs(bass_phase - 0.5) - 1.0) * 0.24

            # 2. 28% duty-cycle pulse wave arpeggio with exponential decay
            lead_phase = (t * midi_to_hz(lead_midi)) % 1.0
            pulse = 1.0 if lead_phase < 0.28 else -1.0
            lead = pulse * math.exp(-3.6 * step_pos) * 0.13

            # 3. Warm sine-wave pad (octave + fifth)
            pad1 = math.sin(2.0 * math.pi * midi_to_hz(bass_midi + 12) * t)
            pad2 = math.sin(2.0 * math.pi * midi_to_hz(bass_midi + 19) * t)
            pad = (pad1 + 0.6 * pad2) * 0.09

            # Subtle stereo width on the arpeggio
            left = bass + pad + lead * 0.85
            right = bass + pad + lead * 1.05

            # 0.5s fade-in, 1.6s fade-out
            fade = 1.0
            if t < 0.5:
                fade = t / 0.5
            elif t > duration - 1.6:
                fade = max(0.0, (duration - t) / 1.6)

            l_pcm = max(-32767, min(32767, int(left * fade * 16000)))
            r_pcm = max(-32767, min(32767, int(right * fade * 16000)))
            buf.extend(struct.pack("<hh", l_pcm, r_pcm))

        wf.writeframes(bytes(buf))


if __name__ == "__main__":
    generate_space_bgm()
    print("Generated Glass_Orbit_Space_BGM.wav")
