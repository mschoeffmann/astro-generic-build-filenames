# `astro-generic-build-filenames`

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that modifies the filenames of build assets to more generic names.  
This package is designed to eliminate confusion caused by the default naming convention, which names files after their entry points.

After `astro build`, asset files have a name based on the entry point, which result in main stylesheet names like `404.[hash].css` or `about-us.[hash].js`. The same happens to assets and chunks.

Provided workarounds like directly setting `vite.build.rollupOptions.output.entryFileNames` do not work reliably with adapters like `@astrojs/vercel` or `@astrojs/cloudflare`.

This integration wraps Astro's own `entryFileNames`, `chunkFileNames` and `assetFileNames` output options and replaces the name with `entry`, `chunk` or `asset`. All files in `_astro` end up named like `entry.[hash].js`, `chunk.[hash].js` or `asset.[hash].css`. Server-side files are not renamed.

Supports Astro 5, 6 and 7 (Rollup and Rolldown).


## Usage

### Prerequisites

An Astro project using Astro 5, 6 or 7.

### Installation

Install the integration **automatically** using the Astro CLI:

```bash
pnpm astro add astro-generic-build-filenames
```

```bash
npx astro add astro-generic-build-filenames
```

```bash
yarn astro add astro-generic-build-filenames
```

Or install it **manually**:

1. Install the required dependencies

```bash
pnpm add astro-generic-build-filenames
```

```bash
npm install astro-generic-build-filenames
```

```bash
yarn add astro-generic-build-filenames
```

2. Add the integration to your astro config

```diff
+import genericBuildFilenames from "astro-generic-build-filenames";

export default defineConfig({
  integrations: [
+    genericBuildFilenames(),
  ],
});
```

### Configuration

No configuration needed ... So far.

## To-Do
- [ ] Add configuration for filenames

## Contributing

See the [development workflow](https://github.com/mschoeffmann/astro-generic-build-filenames#development) in the repository README.

## Licensing

[MIT Licensed](https://github.com/mschoeffmann/astro-generic-build-filenames/blob/main/LICENSE). Made with ❤️ by [Matthias Schöffmann](https://github.com/mschoeffmann).

## Acknowledgements

Based on [astro-integration-template](https://github.com/florian-lefebvre/astro-integration-template/tree/main)
