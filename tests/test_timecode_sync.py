"""Unit tests for MTC timecode parsing (LTC demod remains experimental)."""
import pytest

from defora_cli.timecode_sync import MTCDemodulator, TimecodeState


def test_mtc_assembles_full_frame_24fps():
    mtc = MTCDemodulator(fps=24.0)
    for qt in range(8):
        mtc.process_quarter_frame(qt, qt + 1)

    assert mtc.state.is_running
    assert mtc.fps == 24.0
    assert mtc.state.last_update > 0


def test_timecode_state_defaults():
    st = TimecodeState()
    assert st.hours == 0
    assert st.frames == 0
    assert st.fps == 24.0
