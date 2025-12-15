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


class FakeMediator:
    def __init__(self, values=None):
        self.values = (
            values
            if values is not None
            else {
                "cfg": 7.0,
                "strength": 0.5,
                "noise_multiplier": 0.75,
                "cadence": 3.0,
                "translation_z": 1.25,
                "translation_x": -0.5,
                "translation_y": 0.25,
                "rotation_y": 10.0,
                "rotation_z": -5.0,
                "fov": 80.0,
                "total_generated_images": 5,
            }
        )
        self.writes = []

    def read(self, key):
        return self.values.get(key)

    def write(self, key, val):
        self.writes.append((key, val))
        self.values[key] = val


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

    ui.selected_param = "strength"
    ui.adjust_selected(10)
    assert ui.params["strength"].value == ui.params["strength"].max_value
    assert "-> 1.50" in ui.status

    ui.adjust_selected(-10)
    assert ui.params["strength"].value == ui.params["strength"].min_value
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


def test_draw_preview_block_renders_ascii_when_available(tmp_path):
    fake = FakeWin()
    ui = DeforaTUI(fake)
    frame = tmp_path / "0000.png"
    frame.write_text("x")
    ui.frames_dir = tmp_path
    ui.render_ascii_preview = lambda path, w, h: ["abcd", "efgh"]  # type: ignore[assignment]

    ui.draw_preview_block(0, 0, 10, 6)

    rendered = [call for call in fake.calls if "abcd" in call[2] or "efgh" in call[2]]
    assert rendered
    for _, x, _, _ in rendered:
        assert x > 0  # drawn inside the box, not overwriting the border


def test_run_handles_navigation_and_sources(monkeypatch):
    inputs = [
        curses.KEY_RIGHT,  # bump cfg up
        ord(" "),  # toggle source to Beat
        curses.KEY_F2,  # switch tab
        curses.KEY_LEFT,  # bump cfg back down
        ord("q"),  # exit
    ]
    fake = FakeWin(inputs=inputs)
    ui = DeforaTUI(fake, mediator=FakeMediator(values={}))
    monkeypatch.setattr(curses, "curs_set", lambda *_: None)

    ui.run()

    assert fake.nodelay_flag is False
    assert ui.tab == 1
    assert ui.params["cfg"].value == pytest.approx(6.0)
    assert ui.params["cfg"].source == "Beat"


def test_connect_syncs_params_and_frames():
    fake = FakeWin()
    mediator = FakeMediator()
    ui = DeforaTUI(fake, mediator=mediator, mediator_host="h", mediator_port="p")
    ui.connect_and_sync()

    assert ui.engine_status == "CONNECTED"
    assert ui.params["cfg"].value == pytest.approx(7.0)
    assert ui.params["zoom"].value == pytest.approx(1.25)
    assert ui.frames_total == 5
    assert ("should_use_deforumation_cfg", 1) in mediator.writes


def test_frame_timeline_and_generation():
    fake = FakeWin()
    mediator = FakeMediator()
    ui = DeforaTUI(fake, mediator=mediator)
    ui.connect_and_sync()
    ui.frames_total = 3
    ui.frame_cursor = 1
    ui.draw_live()

    frame_line = next(call[2] for call in fake.calls if "Frames" in call[2])
    assert "[thumb]" not in frame_line
    assert "0001" in frame_line

    mediator.writes.clear()
    ui.trigger_generation()
    assert ("start_frame", 1) in mediator.writes
    assert ("should_resume", 1) in mediator.writes


def test_move_frame_cursor_clamps():
    ui = DeforaTUI(FakeWin())
    ui.frames_total = 2
    ui.frame_cursor = 1
    ui.move_frame_cursor(5)
    assert ui.frame_cursor == 1
    ui.move_frame_cursor(-5)
    assert ui.frame_cursor == 0


def test_move_frame_cursor_requires_connection():
    ui = DeforaTUI(FakeWin())
    ui.bridge.connected = False
    ui.frames_total = 0
    ui.move_frame_cursor(1)
    assert "mediator disconnected" in ui.status.lower()


def test_frame_timeline_disconnected_message():
    ui = DeforaTUI(FakeWin())
    ui.bridge.connected = False
    text = ui.format_frame_timeline(80).lower()
    assert "disconnected" in text
    assert "press r" in text


def test_trigger_generation_disconnected_sets_status():
    ui = DeforaTUI(FakeWin())
    ui.trigger_generation()
    assert "mediator disconnected" in ui.status.lower()

def test_band_adjustments_and_lfo_tick():
    ui = DeforaTUI(FakeWin())
    band_before = dict(ui.bands[0])
    ui.selected_band = 0
    ui.adjust_band(10, 0.1)
    band_after = ui.bands[0]
    assert band_after["freq_min"] == pytest.approx(band_before["freq_min"] + 10)
    assert band_after["intensity"] == pytest.approx(band_before["intensity"] + 0.1)

    mediator = FakeMediator()
    ui.bridge.connected = True
    ui.bridge.client = mediator
    ui.lfos[0]["on"] = True
    ui.tick_lfos(force=True)
    assert mediator.writes, "LFO tick did not send any writes"


def test_adjust_selected_writes_to_mediator():
    fake = FakeWin()
    mediator = FakeMediator()
    ui = DeforaTUI(fake, mediator=mediator)
    ui.connect_and_sync()
    mediator.writes.clear()
    ui.selected_param = "zoom"
    ui.adjust_selected(ui.params["zoom"].step)
    write_keys = [w[0] for w in mediator.writes]
    assert "translation_z" in write_keys
    assert any(abs(val - ui.params["zoom"].value) < 1e-6 for key, val in mediator.writes if key == "translation_z")
