# astro-generic-build-filenames

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that modifies the filenames of build assets to more generic names.  
This package is designed to eliminate confusion caused by the default naming convention, which names files after their entry points.

After `astro build`, asset files have a name based on the entry point, which result in main stylesheet names like `404.[hash].css` or `about-us.[hash].js`. The same happens to assets and chunks.

Provided workarounds like directly setting `vite.build.rollupOptions.output.entryFileNames` do not work reliably with adapters like `@astrojs/vercel` or `@astrojs/cloudflare`.

This integration wraps Astro's own `entryFileNames`, `chunkFileNames` and `assetFileNames` output options and replaces the name with `entry`, `chunk` or `asset`. All files in `_astro` end up named like `entry.[hash].js`, `chunk.[hash].js` or `asset.[hash].css`. Server-side files are not renamed.

Supports Astro 5, 6 and 7 (Rollup and Rolldown).

To see how to get started, check out the [package README](./package/README.md)

To see latest changes, check out the [package CHANGELOG](./package/CHANGELOG.md)

## Development

This repository is a pnpm monorepo:

- `package` contains the integration that is published to npm
- `playground` contains an Astro project for testing it

Requirements: Node 24 (see `.nvmrc`) and pnpm (the version in `package.json` is picked up by Corepack).

### Setup

```bash
pnpm install
```

### Dev server

```bash
pnpm dev
```

This runs the package build in watch mode and the playground dev server in parallel. The integration only hooks into `astro build`, so its effect is not visible in the dev server. Use `pnpm test` to see the generated file names.

### Test

```bash
pnpm lint             # lint and format check (pnpm lint:fix to fix)
pnpm test             # build the package and playground, verify file names in dist/_astro
pnpm test:compat      # same, against astro@5, astro@6 and astro@latest
pnpm test:compat 5,7  # only specific Astro versions
```

`pnpm test:compat` packs the package like it is published and installs it into temporary projects, so it also catches packaging problems.

### Commit a change

Every change that should end up in a release needs a changeset. Add it before committing, and commit it together with the change:

```bash
pnpm changeset   # select the bump type (patch/minor/major) and write a summary
git add -A
git commit -m "fix: describe the change"
git push
```

The changeset is a Markdown file in `.changeset/`. The changelog entry links to the commit that added it, so it belongs in the same commit as the change. Changes that should not be released (CI, README, playground) do not need a changeset.

Changesets add up until the next release. Each release bumps the version once, using the highest bump type among them.

### Release a version

```bash
pnpm release --dry-run   # run all checks, lint and tests without changing anything
pnpm release
```

The release script:

1. Checks that `git`, `pnpm`, `npm` and `gh` are installed, that you are logged in to npm (`pnpm login`) and GitHub (`gh auth login`), that you are on a clean `main` that is in sync with `origin`, and that there are pending changesets. It lists all problems at once and stops before changing anything.
2. Lints, builds and tests, including `pnpm test:compat`.
3. Runs `changeset version`, shows the new version and asks for confirmation.
4. Commits the version bump locally and publishes to npm. npm may ask for a 2FA code.
5. Only after publishing succeeded: pushes the commit and tag, and creates a GitHub release with the changelog section.

If publishing fails, the local version commit and tag are rolled back, so nothing needs to be reverted. Options: `--skip-compat` skips the multi-version test, `--yes` skips the confirmation.

## Licensing

[MIT Licensed](./LICENSE). Made with ❤️ by [Matthias Schöffmann](https://github.com/mschoeffmann).
