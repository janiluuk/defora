import types

import pytest

from sd_cli.defora_tui import DeforaTUI, Param


class FakeWin:
    def __init__(self, h=40, w=120):
        self.h = h
        self.w = w
        self.calls = []

    def getmaxyx(self):
        return (self.h, self.w)

    def addnstr(self, y, x, s, n, attr=0):
        self.calls.append((y, x, s[:n], attr))

    def erase(self):
        self.calls.clear()

    def refresh(self):
        pass


def test_param_adjust_and_source_cycle():
    p = Param("Test", 0.5, min_value=0, max_value=1, step=0.1)
    p.adjust(0.6)
    assert p.value == 1
    p.adjust(-2)
    assert p.value == 0
    orig = p.source
    p.next_source()
    assert p.source != orig


@pytest.mark.parametrize("tab_method", ["draw_live", "draw_prompts", "draw_motion", "draw_audio", "draw_controlnet", "draw_settings"])
def test_draw_sections(tab_method):
    fake = FakeWin()
    ui = DeforaTUI(fake)
    getattr(ui, tab_method)()
    # Should have written something to the fake window
    assert fake.calls, f"{tab_method} did not render"


def test_draw_switch_tabs():
    fake = FakeWin()
    ui = DeforaTUI(fake)
    for idx in range(6):
        ui.tab = idx
        ui.draw()
    assert fake.calls, "Draw should render across tabs"
