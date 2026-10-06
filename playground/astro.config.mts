import { defineConfig } from "astro/config";
import genericBuildFilenames from "astro-generic-build-filenames";

// https://astro.build/config
export default defineConfig({
	integrations: [genericBuildFilenames()],
	build: {
		// Always emit stylesheets as files, so their names can be verified.
		inlineStylesheets: "never",
	},
});
