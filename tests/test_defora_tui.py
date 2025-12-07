import curses
import pytest

from defora_cli.defora_tui import DeforaTUI, Param, center_text


class FakeWin:
    def __init__(self, h=40, w=120, inputs=None):
        self.h = h
        self.w = w
        self.calls = []
        self.inputs = list(inputs or [])
        self.nodelay_flag = None

    def getmaxyx(self):
        return (self.h, self.w)

    def addnstr(self, y, x, s, n, attr=0):
        self.calls.append((y, x, s[:n], attr))

    def erase(self):
        self.calls.clear()

    def refresh(self):
        pass

    def nodelay(self, flag):
        self.nodelay_flag = flag

    def getch(self):
        if self.inputs:
            return self.inputs.pop(0)
        return ord("q")


def test_center_text_respects_bounds_and_alignment():
    short = FakeWin(w=20)
    center_text(short, 2, "hello")
    assert short.calls[-1][1] == (20 - len("hello")) // 2
    assert short.calls[-1][2] == "hello"

    long = FakeWin(w=15)
    center_text(long, 1, "x" * 50)
    assert long.calls[-1][2] == "x" * 14  # truncated to width - 1


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


def test_draw_slider_renders_fill_and_attr():
    fake = FakeWin()
    ui = DeforaTUI(fake)
    param = Param("Test", 1.0, min_value=0.0, max_value=2.0)
    ui.draw_slider(5, "Test", param, active=True)

    line = fake.calls[-1][2]
    bar = line.split("[", 1)[1].split("]", 1)[0]
    assert len(bar) == 20
    assert bar.count("█") == 10  # half-filled for midpoint value
    assert fake.calls[-1][3] == curses.A_REVERSE


def test_param_navigation_wraps_and_clamps_status():
    fake = FakeWin()
    ui = DeforaTUI(fake)

    ui.prev_param()
    assert ui.selected_param == list(ui.params.keys())[-1]
    ui.next_param()
    assert ui.selected_param == list(ui.params.keys())[0]

    ui.adjust_selected(10)
    assert ui.params["cfg"].value == ui.params["cfg"].max_value
    assert "-> 1.50" in ui.status

    ui.adjust_selected(-10)
    assert ui.params["cfg"].value == ui.params["cfg"].min_value
    assert "-> 0.00" in ui.status


def test_draw_live_highlights_selected_param():
    fake = FakeWin()
    ui = DeforaTUI(fake)
    ui.selected_param = "strength"
    ui.draw_live()

    strength_line = next(call for call in fake.calls if call[2].startswith("Strength"))
    cfg_line = next(call for call in fake.calls if call[2].startswith("Vibe (CFG)"))

    assert strength_line[3] == curses.A_REVERSE
    assert cfg_line[3] == curses.A_NORMAL


def test_draw_preview_block_renders_box():
    fake = FakeWin()
    ui = DeforaTUI(fake)
    ui.draw_preview_block(5, 2, 10, 4)

    top = fake.calls[0]
    bottom = next(call for call in fake.calls if call[0] == 5 + 3 and call[1] == 2)
    assert top[2] == "+--------+"
    assert bottom[2] == "+--------+"


def test_run_handles_navigation_and_sources(monkeypatch):
    inputs = [
        curses.KEY_RIGHT,  # bump cfg up
        ord(" "),  # toggle source to Beat
        curses.KEY_F2,  # switch tab
        curses.KEY_LEFT,  # bump cfg back down
        ord("q"),  # exit
    ]
    fake = FakeWin(inputs=inputs)
    ui = DeforaTUI(fake)
    monkeypatch.setattr(curses, "curs_set", lambda *_: None)

    ui.run()

    assert fake.nodelay_flag is False
    assert ui.tab == 1
    assert ui.params["cfg"].value == pytest.approx(0.63)
    assert ui.params["cfg"].source == "Beat"
