import os
import wave
from piper.voice import PiperVoice

# Load the model once when the module is imported
VOICE = PiperVoice.load("en_US-amy-low.onnx")  # expects en_US-amy-low.onnx.json alongside it


def tts(text: str, path: str) -> str:
    # Ensure the output always has a .wav extension
    if not path.lower().endswith(".wav"):
        path += ".wav"

    # Only create a directory if one is actually specified
    dirname = os.path.dirname(path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)

    # Write the audio
    with wave.open(path, "wb") as wav_file:
        VOICE.synthesize(text, wav_file)

    return path