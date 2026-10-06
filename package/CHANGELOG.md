# astro-generic-build-filenames

## 0.7.0

### Minor Changes

- aca4d02: Complete rewrite to support Astro 6 and 7. Previously, the integration had no effect on these versions.
  
  - Rewrite the integration and remove the deprecated `astro-integration-kit` dependency. It now wraps Astro's own file name functions instead of replacing `[name]` placeholders, which Astro 6 and 7 no longer use
  - Add support for Astro 6 (Vite Environment API) and Astro 7 (Rolldown)
  - Drop support for Astro 4. The minimum supported version is now Astro 5
  - Only rename client-side files. Server-side entries and chunks keep their original names

## 0.6.2

### Patch Changes

- 53c8fd9: update dependencies
- f359621: migrate biome config

## 0.6.1

### Patch Changes

- 131b3d5: re-run publish script

## 0.6.0

### Minor Changes

- 0f9a7f2: update dependencies

### Patch Changes

- 651800f: make linter happy

## 0.5.6

### Patch Changes

- 54449fb: improve release script

## 0.5.5

### Patch Changes

- 4f6ace5: update dependencies

## 0.5.4

### Patch Changes

- a649408: update dependencies
- a56be1e: update package manager to pnpm v10.26.2

## 0.5.3

### Patch Changes

- 1c15805: update dependencies

## 0.5.2

### Patch Changes

- f536c38: update dependencies

## 0.5.1

### Patch Changes

- 8489cd5: update package manager to pnpm v10.17.1
- c9c7dd3: update dependencies
- bfe8437: update biome and make linter happy

## 0.5.0

### Minor Changes

- fc81648: update dependencies

### Patch Changes

- 5f6403a: make linter happy

## 0.4.0

### Minor Changes

- b6db1af: update dependencies

### Patch Changes

- cae62a6: make linter happy

## 0.3.0

### Minor Changes

- 071b52b: update dependencies
- 071b52b: update changelog with forgotten entry

### Patch Changes

- 071b52b: make linter happy

## 0.2.0

### Minor Changes

- update readme
- update dependencies

## 0.1.1

### Patch Changes

- improve readme

## 0.1.0

### Major Changes

- first version
