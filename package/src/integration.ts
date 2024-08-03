import { defineIntegration } from "astro-integration-kit";
import type { OutputOptions, PreRenderedAsset, PreRenderedChunk } from "rollup";

export const integration = defineIntegration({
	name: "generic-client-filenames",
	setup() {
		return {
			hooks: {
				"astro:build:setup": ({ vite }) => {
					if (!vite?.build?.rollupOptions?.output) {
						console.warn(
							"astro-generic-client-filenames: No output options found. Skipping hook.",
						);
						return;
					}
					const usedOutputOptions = vite.build.rollupOptions
						.output as OutputOptions;
					const originalOutputOptions = Object.assign(
						{},
						vite.build.rollupOptions.output,
					) as OutputOptions;
					usedOutputOptions.entryFileNames = (chunkInfo: PreRenderedChunk) => {
						const originalNames =
							typeof originalOutputOptions.entryFileNames === "function"
								? originalOutputOptions.entryFileNames(chunkInfo)
								: originalOutputOptions.entryFileNames;
						return originalNames?.replace("[name]", "entry") as string;
					};
					usedOutputOptions.chunkFileNames = (chunkInfo: PreRenderedChunk) => {
						const originalNames =
							typeof originalOutputOptions.chunkFileNames === "function"
								? originalOutputOptions.chunkFileNames(chunkInfo)
								: originalOutputOptions.chunkFileNames;
						return originalNames?.replace("[name]", "chunk") as string;
					};
					usedOutputOptions.assetFileNames = (assetInfo: PreRenderedAsset) => {
						const originalNames =
							typeof originalOutputOptions.assetFileNames === "function"
								? originalOutputOptions.assetFileNames(assetInfo)
								: originalOutputOptions.assetFileNames;
						return originalNames?.replace("[name]", "asset") as string;
					};
				},
			},
		};
	},
});
