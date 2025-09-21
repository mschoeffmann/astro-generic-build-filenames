import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import genericBuildFilenames from "astro-generic-build-filenames";
import { createResolver } from "astro-integration-kit";
import { hmrIntegration } from "astro-integration-kit/dev";

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
