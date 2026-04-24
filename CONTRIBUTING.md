# Contributing to Claude Skills

Thanks for your interest. Here's how to add value.

## Adding Skills

1. Fork the repo
2. Create a numbered directory (`15-your-category/`) or add to an existing one
3. Follow the SKILL.md format: frontmatter (name, description, submodules) + dense content
4. Run `./scripts/generate-conventions.sh` to regenerate platform variants
5. Open a PR with a clear description of what the skill does

## Skill Quality Bar

- Dense, not verbose. Pipe-delimited one-liners over prose
- Actionable rules, not suggestions. "Always X" not "Consider X"
- Reference docs go in numbered subdirectories
- Match the compression density of existing skills

## Platform Variants

Convention files (`.cursorrules`, `CODEX.md`, etc.) are auto-generated. Don't edit them directly — modify the source skills and regenerate.

## Agent Definitions

Agent `.md` files in `agents/` use frontmatter: `model`, `permissionMode`, `maxTurns`, `effort`, `skills`, `disallowedTools`. See existing agents for the pattern.

## Bug Reports

Open a GitHub issue with: what you expected, what happened, which platform/tool you're using.

## Code Style

- Markdown: no trailing whitespace, single newline at EOF
- Shell scripts: ShellCheck + shfmt, camelCase functions, UPPER_CASE vars
- Commit messages: conventional commits (`feat:`, `fix:`, `docs:`)
