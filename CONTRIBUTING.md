# Contributing

Thanks for helping improve `@trebired/frontend`.

## Development Setup

```sh
bun install
```

The package is authored in TypeScript and published from `dist`. Generated outputs, package tarballs, temp folders, logs, and caches stay out of Git.

## Common Commands

```sh
bun install --frozen-lockfile
bunx @trebired/code-discipline check
bun run typecheck
bun run build
bun run verify:pack
bun run verify:frontend
```

Committed `*.spec.ts` and `*.spec.tsx` files are banned by Code Discipline. Verification scripts create their own temporary fixtures.

## Pull Request Checklist

- Keep public API changes intentional and documented in `README.md`.
- Run Code Discipline, typecheck, build, and package verification.
- Update `CHANGELOG.md` under the current version or a new version section.
- Do not commit `dist`, package tarballs, temp folders, logs, or caches.

## Code Discipline

- Keep the config at `.code-discipline/config.ts`.
- Use `syncImports.output.type: "alias-map"`.
- Keep `allowRelative: ["./"]`.
- Do not add rule-level excludes to bypass discipline.
- Keep `@trebired/code-discipline` in `devDependencies`.
- Keep hardcoded `trebired` strings out of source files unless the package config explicitly allows the file.

## Design Principles

- Bind normal HTML through data attributes and explicit functions.
- Keep product routing, copy, storage keys, domains, and reload policy in adapters.
- Keep overlay and input behavior browser-generic.
- Keep React helpers limited to rendering real elements.
