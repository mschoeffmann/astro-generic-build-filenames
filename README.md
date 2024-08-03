# astro-generic-build-filenames

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that modifies the filenames of build assets to more generic names.  
This package is designed to eliminate confusion caused by the default naming convention, which names files after their entry points.

After `astro build`, asset files have a name based on the entry point, which result in main stylesheet names like `404.[hash].css` or `about-us.[hash].js`. The same happens to assets and chunks.

Provided workarounds like directly setting `vite.build.rollupOptions.output.entryFileNames` do not work reliably with adapters like `@astrojs/vercel` or `@astrojs/cloudflare`.

This integration provides a wrapper around the originally used `vite.build.rollupOptions.output.*FileNames` keys and just replaces `[name]` with `'entry'`, `'chunk'` or `'asset'`.

To see how to get started, check out the [package README](./package/README.md)

## Licensing

[MIT Licensed](./LICENSE). Made with ❤️ by [Matthias Schöffmann](https://github.com/mschoeffmann).
