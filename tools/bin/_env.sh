# Shared environment for Defora CLI wrappers (source from bash scripts).
_tools_bin_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_tools_root="$(cd "${_tools_bin_dir}/.." && pwd)"
_defora_repo_root="$(cd "${_tools_root}/.." && pwd)"
export PYTHONPATH="${_tools_root}${PYTHONPATH:+:${PYTHONPATH}}"
export DEFORA_REPO_ROOT="${_defora_repo_root}"
