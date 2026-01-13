# Release Process

This document describes the automated release process for Defora.

## Automatic Releases

Releases are automatically created when changes are merged to the `main` branch.

### How It Works

1. **Trigger**: Any push to the `main` branch triggers the release workflow
2. **Version Bump**: The version is automatically bumped based on commit messages
3. **Changelog**: A changelog is generated from commit messages
4. **Git Tag**: A new git tag is created (e.g., `v0.2.0`)
5. **GitHub Release**: A GitHub release is published with the changelog

### Version Bump Strategy

The workflow automatically determines the version bump type based on commit messages:

- **Major version** (x.0.0): Commits with `BREAKING CHANGE` or `major:` prefix
- **Minor version** (0.x.0): Commits with `feat:`, `feature:`, or `minor:` prefix  
- **Patch version** (0.0.x): All other commits (default)

### Commit Message Format

To control version bumping, use these prefixes in commit messages:

```bash
# Patch version bump (0.0.x) - Bug fixes, documentation
git commit -m "fix: resolve issue with audio upload"
git commit -m "docs: update installation guide"
git commit -m "chore: update dependencies"

# Minor version bump (0.x.0) - New features
git commit -m "feat: add new LFO waveform shapes"
git commit -m "feature: implement preset import/export"
git commit -m "minor: add MIDI CC mapping"

# Major version bump (x.0.0) - Breaking changes
git commit -m "BREAKING CHANGE: redesign API endpoints"
git commit -m "major: remove deprecated features"
```

### Conventional Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

## Release Artifacts

Each release includes:

1. **Git Tag**: `vX.Y.Z` format (e.g., `v0.2.0`)
2. **GitHub Release**: Published on the releases page
3. **Changelog**: Generated from commit messages
4. **CHANGELOG.md**: Updated in the repository

## Changelog Format

The changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [0.2.0] - 2026-01-13

### Added
- New feature descriptions

### Changed
- Modified feature descriptions

### Fixed
- Bug fix descriptions

### Removed
- Removed feature descriptions
```

## Manual Release (Optional)

To manually trigger a release:

1. Ensure you're on the `main` branch
2. Push to `main` - the workflow will automatically run
3. The release will be created within a few minutes

## Skipping Release

To push to `main` without creating a release, include `[skip ci]` in your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Viewing Releases

All releases are available at:
```
https://github.com/janiluuk/defora/releases
```

## Version History

Current version: `0.1.0`

See [CHANGELOG.md](../CHANGELOG.md) for full version history.

## Troubleshooting

### Release Failed

If the release workflow fails:

1. Check the GitHub Actions logs
2. Verify the commit messages follow the format
3. Ensure GitHub Actions has write permissions
4. Check that secrets are properly configured

### Version Not Bumped

The workflow defaults to a patch bump. To force a minor or major bump, use the appropriate prefix in commit messages.

### Changelog Issues

The changelog is generated from commit messages. Ensure commits are descriptive and follow conventional commit format for best results.

## Future Improvements

Planned enhancements to the release process:

- [ ] Docker image publishing to registry
- [ ] Release notes with issue/PR links
- [ ] Automatic semantic version detection from PR labels
- [ ] Release asset uploads (built artifacts)
- [ ] Slack/Discord notifications for releases
