import tailwind from "@astrojs/tailwind";
import { createResolver } from "astro-integration-kit";
import { hmrIntegration } from "astro-integration-kit/dev";
import { defineConfig } from "astro/config";

import genericBuildFilenames from "astro-generic-build-filenames";

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind(),
		genericBuildFilenames(),
		hmrIntegration({
			directory: createResolver(import.meta.url).resolve("../package/dist"),
		}),
	],
});
