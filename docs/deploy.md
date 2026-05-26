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

Override with env vars: `SSH_PROXY_JUMP`, `DEPLOY_HOST`, `DEPLOY_PATH`, `WEB_PORT`, `COMPOSE_SERVICES`.

## Local deploy

```bash
# Same key must work for jumphost and production (ProxyJump)
export SSH_PROXY_JUMP=pi@sparkki.dudeisland.eu:4322   # optional if this is your default

./scripts/production-deploy.sh
./scripts/production-deploy.sh --no-cache

# Legacy entrypoint
./deploy.sh
```

Services started by default: `mq mediator web control-bridge sd-forge` (no `dev-frame-seeder`).

Optional `.env` at repo root is synced to the remote host when present.

## GitHub Actions

Workflow: [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml)

**Triggers:**

- Manual: **Actions → Deploy production → Run workflow**
- Automatic: after **CI** succeeds on a **push to `main`**

**Required secret:** `DEPLOY_SSH_PRIVATE_KEY` (same key as Sparkki if both deploy to `192.168.2.100`).

**Optional repository variables:** `DEPLOY_JUMP_HOST`, `DEPLOY_JUMP_PORT`, `DEPLOY_HOST`, `DEPLOY_PATH`, `DEPLOY_APP_PORT`.

## Submodule

Deploy expects `deforumation/` to already be present in the checked-out repo. CI and local clones should use recursive submodule checkout so rsync includes vendored `deforumation/` (`actions/checkout` with `submodules: recursive`, or `git submodule update --init --recursive` locally).
