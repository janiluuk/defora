import re
from pathlib import Path


def test_dockerfile_installs_deforum_and_sets_mediator_cfg() -> None:
    content = Path("docker/sd-forge/Dockerfile").read_text()
    assert "sd-forge-deforum" in content, "Deforum extension should be cloned"
    assert "deforum_mediator.cfg" in content, "Mediator config must be written"
    match = re.search(r"ARG\s+DEFORUM_MEDIATOR_URL=([^\s]+)", content)
    assert match, "DEFORUM_MEDIATOR_URL arg must be present"
    assert match.group(1) == "ws://host.docker.internal:8765", "Default mediator URL should be documented default"


def test_mediator_setup_docs_call_out_docker_sd_forge() -> None:
    text = Path("docs/mediator_setup.md").read_text()
    assert "docker-compose build sd-forge" in text, "Docs should describe the sd-forge docker build"
    assert "DEFORUM_MEDIATOR_URL" in text, "Docs should mention how to point the extension at the mediator"
