# `astro-generic-build-filenames`

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that modifies the filenames of build assets to more generic names.  
This package is designed to eliminate confusion caused by the default naming convention, which names files after their entry points.

After `astro build`, asset files have a name based on the entry point, which result in main stylesheet names like `404.[hash].css` or `about-us.[hash].js`. The same happens to assets and chunks.

Provided workarounds like directly setting `vite.build.rollupOptions.output.entryFileNames` do not work reliably with adapters like `@astrojs/vercel` or `@astrojs/cloudflare`.

This integration provides a wrapper around the originally used `vite.build.rollupOptions.output.*FileNames` keys and just replaces `[name]` with `'entry'`, `'chunk'` or `'asset'`.


## Usage

### Prerequisites

Your normal Astro project.

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

## Contributing

This package is structured as a monorepo:

- `playground` contains code for testing the package
- `package` contains the actual package

Install dependencies using pnpm: 

```bash
pnpm i --frozen-lockfile
```

Start the playground and package watcher:

```bash
pnpm dev
```

You can now edit files in `package`. Please note that making changes to those files may require restarting the playground dev server.

## Licensing

[MIT Licensed](https://github.com/mschoeffmann/astro-generic-build-filenames/blob/main/LICENSE). Made with ❤️ by [Matthias Schöffmann](https://github.com/mschoeffmann).

## Acknowledgements

Based on 
