# Documentation index

## Design & UI

All UI/design docs live under **[design/](./design/)** — style guide, mockups, tab reference, navigation maps, and screenshots.

## Architecture & API

| Document | Topic |
|----------|-------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System overview |
| [API.md](./API.md) | HTTP / WebSocket API |
| [DISTRIBUTED_GENERATION.md](./DISTRIBUTED_GENERATION.md) | Multi-GPU generation |
| [DEFORUM_PARAMETERS.md](./DEFORUM_PARAMETERS.md) | Deforum settings reference |
| [run_manifest_schema.md](./run_manifest_schema.md) | Run manifest JSON schema |
| [IMAGE_PIPELINE_PERFORMANCE.md](./IMAGE_PIPELINE_PERFORMANCE.md) | Image pipeline tuning |
| [FRAME_SEEDER_PATTERNS.md](./FRAME_SEEDER_PATTERNS.md) | Frame seeding patterns |
| [ENCODER_QUALITY.md](./ENCODER_QUALITY.md) | Video encoder settings |

## Operations

| Document | Topic |
|----------|-------|
| [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) | Full stack setup |
| [deploy.md](./deploy.md) | Deployment |
| [TURBO_STACK.md](./TURBO_STACK.md) | Turbo compose stack |
| [VOLUME_MANAGEMENT.md](./VOLUME_MANAGEMENT.md) | Docker volumes |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues |
| [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) | Release checklist |
| [streaming_stack.md](./streaming_stack.md) | HLS / streaming |
| [mediator_setup.md](./mediator_setup.md) | Mediator websocket |
| [deforum_servers.md](./deforum_servers.md) | Forge server targeting |

## CLI

| Document | Topic |
|----------|-------|
| [deforumation_cli_panel.md](./deforumation_cli_panel.md) | Live control panel |
| [deforumation_cli_workflow.md](./deforumation_cli_workflow.md) | CLI workflow |

## Tools

Shell scripts and Python CLIs: [`../tools/`](../tools/README.md)

Web UI build scripts: `docker/web/scripts/`

## Legacy paths

| Old path | New path |
|----------|----------|
| `docs/ui-refactor/` | `docs/design/` |
| `docs/ui-migration/` | `docs/design/` |
| `docker/web/docs/` | `docs/design/web/` |
| `screenshots/` | `docs/design/screenshots/` |
| `UI_MIGRATION_NOTES.md` | `docs/design/migration-notes.md` |
| `defora_cli/` | `tools/defora_cli/` |
| `scripts/` (root) | `tools/scripts/` (symlink: `./scripts` → `tools/scripts`) |
