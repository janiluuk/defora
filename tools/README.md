# Defora tools

Operational scripts and CLI entrypoints live here instead of the repository root.

## Layout

| Path | Purpose |
|------|---------|
| [`bin/`](bin/) | Executable CLI wrappers (`forge_cli`, `deforumation_runs_cli`, …) |
| [`defora_cli/`](defora_cli/) | Python package for Forge, mediator, TUI, and automation CLIs |
| [`scripts/`](scripts/) | Shell ops scripts (deploy, tests, volume backup, stack checks) |

## Usage

From the repo root, root-level stubs still work:

```bash
./forge_cli models
./deforumation_cli_panel --host localhost --port 8766
./scripts/run_tests.sh   # now: ./tools/scripts/run_tests.sh
```

Or call tools directly:

```bash
./tools/bin/forge_cli img "a synthwave city at night"
python3 -m defora_cli.mediator_server --help   # with PYTHONPATH=tools
```

## Python imports

Tests and modules import `defora_cli` with `PYTHONPATH=tools` (see `pytest.ini`).

```bash
export PYTHONPATH="$(pwd)/tools${PYTHONPATH:+:$PYTHONPATH}"
python3 -m defora_cli.forge_cli --help
```

## Ops scripts

| Script | Description |
|--------|-------------|
| `run_tests.sh` | Run pytest from repo root |
| `production-deploy.sh` | Production deploy (also `./deploy.sh`) |
| `lab-stack-up.sh` | Lab stack rsync + compose up |
| `stack-e2e-check.sh` | Post-deploy smoke checks |
| `verify_setup.sh` | First-time setup verification |
| `setup_sd_forge.sh` | SD-Forge image build helper |
| `backup-volumes.sh` / `restore-volumes.sh` | Docker volume backup |
| `cleanup-frames.sh` | Frame directory cleanup |
| `ffmpeg-frame-worker.sh` | Mounted into compose for frame encoding |

Web UI build scripts stay in `docker/web/scripts/` (Vite/npm lifecycle).
