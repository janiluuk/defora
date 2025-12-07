# Contributing to defora

Thank you for your interest in contributing to defora! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in the GitHub Issues
2. If not, create a new issue with:
   - Clear, descriptive title
   - Detailed description of the issue or feature request
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (Python version, OS, Forge version)

### Submitting Changes

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/defora.git
   cd defora
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Test basic functionality
   ./forge_cli.py models
   ./forge_cli.py img "test prompt"
   
   # Test your specific changes
   # ...
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a PR on GitHub with a clear description.

## Code Style Guidelines

- Follow PEP 8 style guide for Python code
- Use type hints where possible (as shown in existing code)
- Keep functions focused and single-purpose
- Add docstrings for new functions
- Use meaningful variable names

## Development Setup

```bash
# Clone the repository
git clone https://github.com/janiluuk/defora.git
cd defora

# Install dependencies
pip install -r requirements.txt

# Make the script executable
chmod +x forge_cli.py

# Test it works
./forge_cli.py --help
```

## Testing

Before submitting a PR, please test:

1. **All subcommands work**:
   ```bash
   ./forge_cli.py models
   ./forge_cli.py img "test"
   ./forge_cli.py deforum "test"  # If Forge has --deforum-api
   ```

2. **Error handling**:
   - Test with Forge not running
   - Test with invalid arguments
   - Test with non-existent models

3. **Edge cases**:
   - Different image dimensions
   - Different model types
   - Custom settings

## Areas for Contribution

Here are some areas where contributions would be particularly valuable:

### Documentation
- Improve README examples
- Add more troubleshooting tips
- Create video tutorials or blog posts
- Translate documentation

### Features
- Support for img2img
- ControlNet integration
- Batch processing from CSV
- Configuration file support
- Progress bars for generation
- Support for Windows/macOS

### Testing
- Add unit tests
- Add integration tests
- Improve error messages
- Better validation

### Code Quality
- Refactor large functions
- Improve type hints
- Add logging framework
- Better error handling

## Pull Request Process

1. Update README.md with details of changes if applicable
2. Update the documentation with new features or changed behavior
3. The PR will be reviewed by maintainers
4. Address any feedback from code review
5. Once approved, it will be merged

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unethical or unprofessional conduct

## Questions?

Feel free to:
- Open an issue with the "question" label
- Start a discussion in GitHub Discussions
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to defora! 🎉
