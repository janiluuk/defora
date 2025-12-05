import math
import unittest

try:
    import numpy as np
except ImportError:  # pragma: no cover - skip if numpy unavailable
    np = None

from sd_cli.audio_reactive_modulator import BandMapping, compute_modulations


class TestAudioReactiveModulator(unittest.TestCase):
    def test_band_mapping_hits_correct_band(self):
        if np is None:
            self.skipTest("numpy not installed")
        sr = 1000
        fps = 10
        t = np.linspace(0, 1, sr, endpoint=False)
        tone_100 = np.sin(2 * math.pi * 100 * t).astype(np.float32)
        tone_500 = np.sin(2 * math.pi * 500 * t).astype(np.float32)
        audio = tone_100 + tone_500
        mappings = [
            BandMapping("low", 80, 150, 0.0, 1.0),
            BandMapping("mid", 400, 600, 0.0, 1.0),
        ]
        sched = compute_modulations(audio, sr, fps, mappings)
        self.assertEqual(len(sched["low"]), math.ceil(len(audio) / (sr // fps)))
        self.assertAlmostEqual(max(sched["low"]), 1.0, places=3)
        self.assertAlmostEqual(max(sched["mid"]), 1.0, places=3)

    def test_fps_validation(self):
        if np is None:
            self.skipTest("numpy not installed")
        audio = np.zeros(10, dtype=np.float32)
        mappings = [BandMapping("x", 0, 1, 0.0, 1.0)]
        with self.assertRaises(ValueError):
            compute_modulations(audio, 100, 0, mappings)


if __name__ == "__main__":
    unittest.main()
