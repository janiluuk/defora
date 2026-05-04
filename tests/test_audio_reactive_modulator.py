import math
import unittest

try:
    import numpy as np
except ImportError:  # pragma: no cover - skip if numpy unavailable
    np = None

from defora_cli.audio_reactive_modulator import (
    BandMapping,
    apply_output_processing,
    compute_modulations,
    envelope_follow_series,
    parse_mappings,
    run_post_plugin,
    smooth_series,
)


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

    def test_parse_mappings_bass_mid_high(self):
        maps = parse_mappings(None, "bass_mid_high")
        self.assertEqual(len(maps), 3)
        self.assertEqual(maps[0].param, "translation_x")
        self.assertLess(maps[0].freq_max, 400)

    def test_smooth_series_stable_for_flat_input(self):
        flat = [2.5] * 15
        sm = smooth_series(flat, 0.6)
        self.assertEqual(len(sm), len(flat))
        for x in sm:
            self.assertAlmostEqual(x, 2.5, places=5)

    def test_envelope_follow(self):
        vals = [0.0, 1.0, 1.0, 0.2]
        out = envelope_follow_series(vals, fps=10.0, attack_sec=0.05, release_sec=0.2)
        self.assertEqual(len(out), len(vals))

    def test_apply_output_processing_pipeline(self):
        sched = {"cfg": [0.0, 2.0, 0.5]}
        out = apply_output_processing(sched, fps=24.0, smooth=0.3, attack_sec=0.02, release_sec=0.1)
        self.assertIn("cfg", out)
        self.assertEqual(len(out["cfg"]), 3)

    def test_run_post_plugin_builtin(self):
        sched = {"cfg": [0.0, 1.0]}
        out = run_post_plugin("defora_cli.plugins.audio_post:process", sched)
        self.assertEqual(list(out.keys()), ["cfg"])
        self.assertEqual(len(out["cfg"]), 2)


if __name__ == "__main__":
    unittest.main()
