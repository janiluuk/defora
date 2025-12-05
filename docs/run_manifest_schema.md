## Run manifest schema (Deforumation)

Each run writes a manifest JSON, e.g. `runs/<run_id>/run.json`, that captures what was rendered and the last frame location so you can inspect, re-run, or continue later.

Fields:
- `status` (string): `completed` | `aborted` | `running` | `unknown`
- `started_at` (string): timestamp for when the run began.
- `model` (string): model/checkpoint used.
- `frame_count` (int): number of frames rendered.
- `last_frame` (string, optional): path to the latest frame file.
- `prompt_positive` (string, optional)
- `prompt_negative` (string, optional)
- `seed` (int, optional)
- `steps` (int, optional)
- `strength` (float, optional)
- `cfg` (float, optional)
- `tag` (string, optional): free-form tag/label.

Example: see `docs/run_manifest_example.json`.

Validation: `sd_cli/run_manifest_schema.py` provides a minimal validator used by `sd_cli/deforumation_runs_cli.py` and tests in `tests/test_runs_schema.py`.
