# tts.py
import os
import wave
import numpy as np
from piper.voice import PiperVoice


# Load the model once when the module is imported
try:
    VOICE = PiperVoice.load("/Users/danieltega/Desktop/work codes/learn_lika_pro/utils/en_US-amy-low.onnx")
    print("✅ PiperVoice loaded successfully")
except Exception as e:
    print(f"❌ Failed to load PiperVoice: {e}")
    VOICE = None

def tts(text: str, path: str) -> str:
    if VOICE is None:
        raise RuntimeError("PiperVoice not properly initialized")
    
    # Ensure the output always has a .wav extension
    if not path.lower().endswith(".wav"):
        path += ".wav"

    # Create directory if needed
    dirname = os.path.dirname(path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)

    try:
        # Write the audio with proper format
        with wave.open(path, "wb") as wav_file:
            # Set the correct parameters for the audio
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(22050)  # 22.05 kHz
            VOICE.synthesize(text, wav_file)
        
        return path
    except Exception as e:
        print(f"❌ Error synthesizing text: {e}")
        raise