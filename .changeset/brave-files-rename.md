---
"astro-generic-build-filenames": minor
---

Complete rewrite to support Astro 6 and 7. Previously, the integration had no effect on these versions.

- Rewrite the integration and remove the deprecated `astro-integration-kit` dependency. It now wraps Astro's own file name functions instead of replacing `[name]` placeholders, which Astro 6 and 7 no longer use
- Add support for Astro 6 (Vite Environment API) and Astro 7 (Rolldown)
- Drop support for Astro 4. The minimum supported version is now Astro 5
- Only rename client-side files. Server-side entries and chunks keep their original names
