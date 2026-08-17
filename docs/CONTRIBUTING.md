# Contributing Guide

This guide covers the branching strategy, commit conventions, PR process,
and code style expectations for the Real Estate Due Diligence project.

---

## Branching Strategy

We use a simplified **Gitflow** model:

```
main          ← production releases only (protected)
develop       ← integration branch — all feature PRs merge here
feature/*     ← individual features / fixes
hotfix/*      ← urgent production fixes that bypass develop
```

### Branch naming

| Prefix | Use for | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/risk-assessment` |
| `fix/` | Bug fixes | `fix/auth-403-regression` |
| `docs/` | Documentation only | `docs/setup-guide` |
| `refactor/` | Code cleanup, no behaviour change | `refactor/property-service-split` |
| `hotfix/` | Urgent production fix | `hotfix/pdf-eof-exception` |
| `member<N>/` | Team-member scoped work | `member5/api-docs` |

### Rules

- **Never push directly to `main` or `develop`** — always open a PR.
- Branch from `develop`, not `main`.
- Keep branches short-lived (< 3 days ideally; rebase on `develop` if you fall behind).

---

## Commit Conventions

We follow **Conventional Commits** (<https://www.conventionalcommits.org>):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE, Closes #issue]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `refactor` | Refactoring without behaviour change |
| `test` | Adding or fixing tests |
| `chore` | Build, deps, tooling changes |
| `style` | Formatting, whitespace — no logic change |
| `perf` | Performance improvement |

### Examples

```
feat(risk): add flood zone scoring provider
fix(auth): resolve ADMIN role regression after merge
docs(api): add @Operation annotations to all controllers
chore(deps): upgrade springdoc-openapi to 2.8.0
```

### Rules

- Subject line ≤ 72 characters.
- Use **present tense** ("add feature", not "added feature").
- Reference issues with `Closes #42` in the footer when applicable.
- Do not mix `feat` and `fix` in the same commit.

---

## Pull Request Process

1. **Open the PR against `develop`** (never `main`).
2. PR title must follow the same Conventional Commits format as commit messages.
3. Fill in the PR description template:
   - **What changed** — bullet list of changes
   - **How to test** — steps to verify manually or via tests
   - **Screenshots** — required for any UI change
   - **Checklist** — build passes, tests pass, no `.env` committed
4. Request at least **one reviewer** from the team.
5. Do not merge your own PR — wait for approval.
6. Squash-merge to `develop` to keep history clean.

### Checklist before opening a PR

- [ ] `./mvnw clean compile` passes with no new errors
- [ ] `npm run build` passes with no new errors
- [ ] `./mvnw test` passes (or failures are pre-existing and documented)
- [ ] `npm run test:run` passes
- [ ] No secrets, `.env`, or generated files added to git
- [ ] i18n: any new user-visible strings added to all 11 locale files

---

## Code Style

### Java (backend)

- **Formatter**: Google Java Style (4-space indent, 100-char line length).
- Use **Lombok** for boilerplate (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`).
  Avoid `@Data` on JPA entities (causes problems with `equals`/`hashCode`).
- Every controller method needs `@Operation(summary, description)` and `@ApiResponses`.
- Service layer: interfaces + `Impl` classes. Keep controllers thin — no business logic.
- DTOs live in `dto/`, entities in `entity/`. Never expose entities directly from controllers.
- Prefer `Optional.orElseThrow()` over null checks in service methods.
- Log at `WARN` for recoverable issues, `ERROR` for failures with stack traces.

### JavaScript / React (frontend)

- **Formatter**: Prettier defaults (2-space indent, single quotes, trailing commas).
- Use `"use client"` only when genuinely needed (state, browser APIs); keep server components where possible.
- All user-visible strings must use `t("...")` from `react-i18next` — no hard-coded English.
- Name components with PascalCase, hooks with `use` prefix, services as camelCase files.
- Keep components focused — if a file exceeds ~200 lines, consider splitting.
- Prefer named exports for components; default export only for pages.

### General

- Do not commit commented-out code.
- Write a JSDoc/Javadoc comment on any non-obvious public method.
- Keep PR diffs focused — avoid unrelated refactors in feature PRs.
