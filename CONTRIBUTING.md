# Contributing Guidelines

Thank you for considering contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/collaborative-ai-chat.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow setup instructions in [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md)

## Development Workflow

1. Make your changes
2. Test thoroughly locally
3. Commit with clear messages: `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Commit Message Format

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Code Standards

- Use meaningful variable names
- Add comments for complex logic
- Follow existing code style
- Validate and sanitize all user inputs
- Handle errors properly
- Add error messages for user feedback

## Security

- Never commit `.env` files or credentials
- Always sanitize user inputs
- Use environment variables for sensitive data
- Report security issues privately

## Testing

- Test all changes locally before submitting
- Ensure existing functionality still works
- Test error cases and edge cases

## Pull Request Process

1. Update documentation if needed
2. Add/update tests if applicable
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Request review from maintainers

## Questions?

Open an issue for discussion before starting major changes.
