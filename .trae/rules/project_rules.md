# Project Rules

## Git Commit Message Guidelines

When generating git commit messages, follow these conventions:

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Subject Rules

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Keep it concise (less than 50 characters if possible)

### Body Rules

- Use the imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Wrap at 72 characters

### Examples

```
feat: add user authentication

Implement JWT-based authentication system with login and logout
endpoints. Includes token refresh mechanism.

Closes #123
```

```
fix: resolve memory leak in data parser

Fix memory leak caused by unclosed file handles when parsing
large datasets. Now properly closes handles in finally block.

Fixes #456
```

```
docs: update API documentation

Add examples for new endpoints and clarify parameter descriptions.
```

### Language

All commit messages must be written in **English**.
