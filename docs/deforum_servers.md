## Targeting multiple local Deforum/Forge servers

You mentioned two local servers and a third GPU:

- Server A: `http://192.168.2.101:7860`
- Server B: `http://192.168.2.104:7860`
- Server C: (third GPU) set its host/port as needed.

### Pointing the CLI/dispatcher at a server

- `sd_cli/forge_cli.py` respects the environment variable `FORGE_API_BASE`.
  - Example: `FORGE_API_BASE=http://192.168.2.101:7860 python -m sd_cli.forge_cli "a prompt"`
  - Switch to the other box: `FORGE_API_BASE=http://192.168.2.104:7860 python -m sd_cli.forge_cli deforum ...`
- The request dispatcher (`sd_cli/deforumation_request_dispatcher.py`) shells out to the CLI, so export `FORGE_API_BASE` before running it to pick a target.
- If you want per-request targeting, you can also wrap the dispatcher call:
  - `FORGE_API_BASE=http://192.168.2.104:7860 python -m sd_cli.deforumation_request_dispatcher --request runs/foo/rerun_request.json --execute`

### Notes
- Keep ports consistent (`7860` in your setup). If a server uses a different port, set `FORGE_API_BASE` accordingly (e.g., `http://192.168.2.101:8000`).
- If you routinely switch, consider shell aliases:
  - `alias forge101='FORGE_API_BASE=http://192.168.2.101:7860 python -m sd_cli.forge_cli'`
  - `alias forge104='FORGE_API_BASE=http://192.168.2.104:7860 python -m sd_cli.forge_cli'`
