import wave
import os
import sys
import traceback
from pathlib import Path

try:
    from piper import PiperVoice
except ImportError as e:
    print(f"ERROR: piper-tts package not installed or import failed: {e}")
    sys.exit(1)

model_path = "/Users/danieltega/Desktop/work codes/learn_lika_pro/utils/en_US-amy-low.onnx"
config_path = model_path + ".json"  # piper needs this sitting next to the .onnx
output_wav = "output.wav"
text = "Hello! Piper text to speech is now running successfully with Python."

# --- 1. Check the model files actually exist ---
if not os.path.isfile(model_path):
    print(f"ERROR: Model file not found at: {model_path}")
    sys.exit(1)

if not os.path.isfile(config_path):
    print(f"ERROR: Config file not found at: {config_path}")
    print("Piper needs a matching '<model>.onnx.json' file next to the .onnx model.")
    sys.exit(1)

print(f"Model file size: {os.path.getsize(model_path)} bytes")
print(f"Config file size: {os.path.getsize(config_path)} bytes")

# --- 2. Load the voice, catching load errors ---
try:
    voice = PiperVoice.load(model_path)
    print("Voice loaded successfully.")
    print(f"Sample rate: {voice.config.sample_rate}")
except Exception as e:
    print("ERROR while loading voice:")
    traceback.print_exc()
    sys.exit(1)

# --- 3. Try synthesizing to raw audio first (bypassing the WAV writer) ---
# This isolates whether the problem is synthesis or file writing.
try:
    audio_chunks = list(voice.synthesize(text))
    total_bytes = sum(len(chunk.audio_int16_bytes) for chunk in audio_chunks) if audio_chunks else 0
    print(f"Synthesis produced {len(audio_chunks)} chunk(s), {total_bytes} audio bytes total.")
    if total_bytes == 0:
        print("WARNING: Synthesis returned zero audio data. "
              "This usually means the text was empty after normalization, "
              "or the model/config mismatch is silently failing.")
except AttributeError:
    # Older/newer piper-tts versions may not expose synthesize() the same way
    print("NOTE: voice.synthesize() raw-chunk check not available in this piper-tts version, skipping.")
    audio_chunks = None
except Exception as e:
    print("ERROR during synthesis (before writing WAV):")
    traceback.print_exc()
    sys.exit(1)

# --- 4. Write the actual WAV file, with explicit params set as a safety net ---
try:
    with wave.open(output_wav, "wb") as wav_file:
        # Some piper-tts versions expect these set manually before synthesize_wav;
        # setting them explicitly avoids silent no-op writes.
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)  # 16-bit PCM
        wav_file.setframerate(voice.config.sample_rate)

        voice.synthesize_wav(text, wav_file)

    print("synthesize_wav() call completed without raising an exception.")
except Exception as e:
    print("ERROR during synthesize_wav():")
    traceback.print_exc()
    sys.exit(1)

# --- 5. Verify the output file actually has audio in it ---
file_size = os.path.getsize(output_wav)
print(f"Output file size: {file_size} bytes")

if file_size <= 44:  # 44 bytes = just the WAV header, no audio data
    print("PROBLEM CONFIRMED: The WAV file only contains a header, no audio data was written.")
    print("Next steps to try:")
    print("  1. Update piper-tts: pip install --upgrade piper-tts")
    print("  2. Check that en_US-amy-low.onnx.json is valid JSON and matches the model")
    print("  3. Try voice.synthesize() (chunk-based) and manually write chunk.audio_int16_bytes")
    print("     to the wav file instead of relying on synthesize_wav()")
else:
    with wave.open(output_wav, "rb") as check:
        print(f"Frames written: {check.getnframes()}")
        print(f"Duration: {check.getnframes() / check.getframerate():.2f} seconds")
    print(f"Audio file saved successfully to {output_wav}")