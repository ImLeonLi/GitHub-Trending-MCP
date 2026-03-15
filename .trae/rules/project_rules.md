# Git Commit Message Guidelines

## Format
```
<type>: <subject>

<body>

<footer>
```

## Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting changes
- **refactor**: Code restructuring
- **perf**: Performance improvement
- **test**: Test changes
- **chore**: Build/tooling changes

## Rules
- Use imperative present tense: "change" not "changed"
- No capitalization in subject
- No period at end of subject
- Keep subject under 50 characters
- Body explains "why" and contrasts with previous behavior
- Wrap body at 72 characters

## Examples
```
feat: add user authentication

Implement JWT-based auth with login/logout endpoints and token refresh.

Closes #123
```

```
fix: resolve memory leak in parser

Fix memory leak from unclosed file handles. Now properly closes handles in finally block.

Fixes #456
```

## Language
All commit messages must be in **English**.
