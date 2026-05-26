# Defora mediator (self-contained)

Defora ships a lightweight mediator implementation at `defora_cli/mediator_server.py`.
No Deforumation submodule is required.

## Run the mediator locally
- Install deps: `python -m pip install -r requirements.txt`
- Start the mediator (websocket mode):  
  `python -m defora_cli.mediator_server --mediator_deforum_address 0.0.0.0 --mediator_deforum_port 8765 --mediator_deforumation_address 0.0.0.0 --mediator_deforumation_port 8766`
  - Defaults: Deforum listens on 8765, Deforumation on 8766.
  - `--use_named_pipes` is accepted for compatibility but currently ignored (websocket only).

## Install the Deforum bridge into an SD-Forge install
1) Stop SD-Forge.  
2) Install Tok's Deforum extension:
   `git clone https://github.com/Tok/sd-forge-deforum.git extensions/sd-forge-deforum`  
3) Set `extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg` to point at your mediator (e.g., `ws://127.0.0.1:8765`).  
4) Restart SD-Forge, then start the mediator (`python -m defora_cli.mediator_server ...`). CLI tools in this repo use the same mediator host/port via `--host/--port` or `DEFORUMATION_MEDIATOR_HOST/DEFORUMATION_MEDIATOR_PORT`.

## SD-Forge Docker with mediator
- The `sd-forge` service in `docker-compose.yml` pre-installs Tok’s `sd-forge-deforum` extension and writes `deforum_mediator.cfg` to point at the mediator.
- The `mediator` service runs `defora_cli/mediator_server.py` and listens on 8765 (Deforum) and 8766 (Deforumation). Compose wires the bridge service to talk to it by default.
- Quick build (needs network for the base Forge image):  
  `DEFORUM_MEDIATOR_URL=ws://host.docker.internal:8765 docker-compose build sd-forge`
- Quick run once built (Forge UI exposed on 7860):  
  `docker-compose up mediator sd-forge`
- Override `DEFORUM_MEDIATOR_URL` if your mediator listens elsewhere (e.g., `ws://mediator:8765` inside the Compose network).
