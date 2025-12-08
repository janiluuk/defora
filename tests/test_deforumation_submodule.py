from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def test_deforumation_submodule_is_present() -> None:
    repo_root = _repo_root()
    mediator_path = repo_root / "deforumation" / "mediator.py"
    assert mediator_path.exists(), (
        "deforumation submodule is missing; run "
        "`git submodule update --init --recursive` to populate it."
    )


def test_deforumation_submodule_url_is_pinned() -> None:
    repo_root = _repo_root()
    gitmodules = repo_root / ".gitmodules"
    assert gitmodules.exists(), ".gitmodules missing; expected deforumation submodule entry."
    contents = gitmodules.read_text(encoding="utf-8")
    assert "https://github.com/Rakile/DeforumationQT.git" in contents, (
        "deforumation submodule URL is not pointing at Rakile/DeforumationQT.git"
    )
