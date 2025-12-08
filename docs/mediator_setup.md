# Deforumation mediator (DeforumationQT port)

This repo ships the upstream Deforumation checkout under `deforumation/` as a git submodule (pinned to `Rakile/DeforumationQT`). That folder contains the mediator (`mediator.py`), the Deforumation UI, and the Forge Deforum bridge zips under `deforumation/Deforum_Version/sd-forge/`. After cloning, run `git submodule update --init --recursive` (or `./scripts/clone_deforumation.sh`) to populate it.

## Run the mediator locally
- Install deps (Linux example): `cd deforumation && python -m venv .venv && source .venv/bin/activate && pip install -r requirements_linux.txt`. On Windows use `requirements_win.txt` and activate `venv\Scripts\activate`.
- Start the mediator (websocket mode):  
  `cd deforumation`  
  `python mediator.py --mediator_deforum_address 0.0.0.0 --mediator_deforum_port 8765 --mediator_deforumation_address 0.0.0.0 --mediator_deforumation_port 8766 --deforumation_address 127.0.0.1 --deforumation_port 8767`
  - Defaults: Deforum listens on 8765, Deforumation on 8766, the live preview server on 8767.
  - Use `--use_named_pipes` instead of the websocket flags if you need Windows named pipes.
- Launch the Deforumation UI against that mediator (optional but useful for live control):  
  `cd deforumation`  
  `python deforumation.py --mediator_address 127.0.0.1 --mediator_port 8766`

## Install the Deforum bridge into an SD-Forge install
1) Stop SD-Forge. Install `p7zip-full` (Linux) or 7-Zip (Windows) if you cannot open `.7z` files.  
2) Pick a communication style from `deforumation/Deforum_Version/sd-forge/` (recommended: `sd-forge-deforum-websocket`).  
3) Extract the chosen `sd-forge-deforum.7z` into your SD-Forge extensions directory (e.g., `~/stable-diffusion-webui-forge/extensions/`). You should end up with an `sd-forge-deforum` folder there.  
4) In the extracted extension, set `scripts/deforum_helpers/deforum_mediator.cfg` to point at your mediator (e.g., `ws://127.0.0.1:8765`).  
5) Restart SD-Forge, then start the mediator (`python deforumation/mediator.py ...`) and, if desired, the Deforumation UI. CLI tools in this repo use the same mediator host/port via `--host/--port` or `DEFORUMATION_MEDIATOR_HOST/DEFORUMATION_MEDIATOR_PORT`.

## SD-Forge Docker with Deforum + mediator patch
- The `sd-forge` service in `docker-compose.yml` builds a Forge image that pre-installs Tok’s `sd-forge-deforum` extension, overlays the Deforumation build from `deforumation/Deforum_Version/sd-forge/`, and writes `deforum_mediator.cfg` to point at the mediator.
- A new `mediator` service runs `deforumation/mediator.py` and listens on 8765 (Deforum) and 8766 (Deforumation). Compose wires the bridge service to talk to it by default.
- Quick build (needs network for the base Forge image):  
  `DEFORUM_MEDIATOR_URL=ws://host.docker.internal:8765 docker-compose build sd-forge`
- Quick run once built (Forge UI exposed on 7860):  
  `docker-compose up mediator sd-forge`
- Override `DEFORUM_MEDIATOR_URL` if your mediator listens elsewhere (e.g., `ws://mediator:8765` inside the Compose network).
