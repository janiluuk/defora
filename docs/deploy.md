# Deploy — production (Sparkki-style)

Defora uses the same deployment pattern as [Sparkki](https://github.com/janiluuk/sparkki): **rsync** the repo to a lab host via **SSH jumphost**, then **remote `docker compose build` + `up`**.

## Targets (defaults)

| Setting | Default |
|---------|---------|
| Jumphost | `pi@sparkki.dudeisland.eu:4322` |
| Production host | `root@192.168.2.100` |
| Remote path | `/srv/defora` |
| Web UI port | `8080` |
| Health | `http://192.168.2.100:8080/api/health` |

Override with env vars: `SSH_PROXY_JUMP`, `DEPLOY_HOST`, `DEPLOY_PATH`, `WEB_PORT`, `COMPOSE_FILE`, `COMPOSE_SERVICES`.

## Local deploy

```bash
# Same key must work for jumphost and production (ProxyJump)
export SSH_PROXY_JUMP=pi@sparkki.dudeisland.eu:4322   # optional if this is your default

./scripts/production-deploy.sh
./scripts/production-deploy.sh --no-cache

# Legacy entrypoint
./deploy.sh
```

Default production stack: `docker-compose.external-forge.yml`

Services started by default: `mq web control-bridge encoder` (no `dev-frame-seeder`, no local `sd-forge`, no local `mediator`).

Optional `.env` at repo root is synced to the remote host when present.

## External Forge pool

Production now defaults to the external-node stack, which deploys Defora without starting the local `sd-forge` container:

```bash
./scripts/production-deploy.sh
```

That stack defaults to:

- remote mediator on `ws://vimage2:8766`
- `http://vimage2:7860`
- `http://vimage5:7860`

and enables distributed balancing in the web service automatically.

To override the node list or strategy:

```bash
MEDIATOR_HOST=vimage2 \
DISTRIBUTED_NODES=http://vimage2:7860,http://vimage5:7860 \
DISTRIBUTED_STRATEGY=least_busy \
COMPOSE_FILE=docker-compose.external-forge.yml \
./scripts/production-deploy.sh
```

## GitHub Actions

Workflow: [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml)

**Triggers:**

- Manual: **Actions → Deploy production → Run workflow**
- Automatic: after **CI** succeeds on a **push to `main`**

**Required secret:** `DEPLOY_SSH_PRIVATE_KEY` (same key as Sparkki if both deploy to `192.168.2.100`).

**Optional repository variables:** `DEPLOY_JUMP_HOST`, `DEPLOY_JUMP_PORT`, `DEPLOY_HOST`, `DEPLOY_PATH`, `DEPLOY_APP_PORT`.

## Repo layout

The repository no longer uses the old `deforumation` submodule bootstrap flow, so CI and deploys do not need `submodules: recursive` or `./scripts/clone_deforumation.sh`.
