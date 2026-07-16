import wave
import os
import sys
import traceback

try:
    from piper import PiperVoice
except ImportError as e:
    print(f"ERROR: piper-tts package not installed or import failed: {e}")
    sys.exit(1)
TTS_MODEL =os.getenv("TTS_MODEL_PATH")
AUDIO_PATH =os.getenv("AUDIO_PATH")
model_path = TTS_MODEL
config_path = model_path + ".json"  # piper needs this sitting next to the .onnx
output_dir = AUDIO_PATH

# --- Load the model once, at import time (like code1 does) ---
if not os.path.isfile(model_path):
    print(f"ERROR: Model file not found at: {model_path}")
    sys.exit(1)

if not os.path.isfile(config_path):
    print(f"ERROR: Config file not found at: {config_path}")
    print("Piper needs a matching '<model>.onnx.json' file next to the .onnx model.")
    sys.exit(1)

try:
    VOICE = PiperVoice.load(model_path)
    print("Voice loaded successfully.")
    print(f"Sample rate: {VOICE.config.sample_rate}")
except Exception:
    print("ERROR while loading voice:")
    traceback.print_exc()
    sys.exit(1)


def tts(text: str, filename: str, out_dir: str = output_dir) -> str:
    """
    Synthesize `text` to a .wav file named `filename`, saved inside `out_dir`.
    Returns the full path to the saved file.
    """
    if not text or not text.strip():
        raise ValueError("text must not be empty")

    # Ensure .wav extension
    if not filename.lower().endswith(".wav"):
        filename += ".wav"

    # Make sure output_dir exists
    os.makedirs(out_dir, exist_ok=True)

    path = os.path.join(out_dir, filename)

    # --- Synthesize to raw chunks first (sanity check) ---
    try:
        audio_chunks = list(VOICE.synthesize(text))
        total_bytes = sum(len(chunk.audio_int16_bytes) for chunk in audio_chunks) if audio_chunks else 0
        print(f"Synthesis produced {len(audio_chunks)} chunk(s), {total_bytes} audio bytes total.")
        if total_bytes == 0:
            print("WARNING: Synthesis returned zero audio data.")
    except AttributeError:
        print("NOTE: voice.synthesize() raw-chunk check not available in this piper-tts version, skipping.")
    except Exception:
        print("ERROR during synthesis (before writing WAV):")
        traceback.print_exc()
        raise

    # --- Write the actual WAV file ---
    try:
        with wave.open(path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)  # 16-bit PCM
            wav_file.setframerate(VOICE.config.sample_rate)
            VOICE.synthesize_wav(text, wav_file)
        print("synthesize_wav() call completed without raising an exception.")
    except Exception:
        print("ERROR during synthesize_wav():")
        traceback.print_exc()
        raise

    # --- Verify output ---
    file_size = os.path.getsize(path)
    print(f"Output file size: {file_size} bytes")

    if file_size <= 44:
        print("PROBLEM CONFIRMED: The WAV file only contains a header, no audio data was written.")
        raise RuntimeError(f"No audio data written to {path}")

    with wave.open(path, "rb") as check:
        print(f"Frames written: {check.getnframes()}")
        print(f"Duration: {check.getnframes() / check.getframerate():.2f} seconds")

    print(f"Audio file saved successfully to {path}")
    return path
