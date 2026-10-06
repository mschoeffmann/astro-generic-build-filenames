import type { AstroIntegration, AstroIntegrationLogger } from "astro";

const INTEGRATION_NAME = "astro-generic-build-filenames";

type FileNameKey = "entryFileNames" | "chunkFileNames" | "assetFileNames";

// Minimal structural types, so we work with Rollup (Astro 5/6) and Rolldown (Astro 7+) alike.
type FileNameOption = string | ((info: never) => string) | undefined;
type OutputOptions = Partial<Record<FileNameKey, FileNameOption>> &
	Record<string, unknown>;
type BundlerOptions = { output?: OutputOptions | OutputOptions[] };
type BuildOptions = {
	rollupOptions?: BundlerOptions;
	rolldownOptions?: BundlerOptions;
};
type ViteConfig = {
	build?: BuildOptions;
	environments?: Record<string, { build?: BuildOptions } | undefined>;
};

const GENERIC_NAMES: Record<FileNameKey, string> = {
	entryFileNames: "entry",
	chunkFileNames: "chunk",
	assetFileNames: "asset",
};

const ALL_KEYS: FileNameKey[] = [
	"entryFileNames",
	"chunkFileNames",
	"assetFileNames",
];

/**
 * Wraps the info object passed to a `*FileNames` function, so Astro's own naming
 * logic sees the generic name instead of the entry point name.
 */
const withGenericName = <T extends object>(info: T, name: string): T =>
	new Proxy(info, {
		get(target, property, receiver) {
			if (property === "name") return name;
			if (property === "names") return [name];
			return Reflect.get(target, property, receiver);
		},
	});

const wrapFileNames = (output: OutputOptions, key: FileNameKey) => {
	const original = output[key];
	if (original === undefined) return false;
	const name = GENERIC_NAMES[key];
	output[key] = (info: object) => {
		const fileName =
			typeof original === "function"
				? (original as (info: object) => string)(withGenericName(info, name))
				: original;
		return fileName.replace("[name]", name);
	};
	return true;
};

const collectOutputs = (build: BuildOptions | undefined): OutputOptions[] =>
	[build?.rollupOptions?.output, build?.rolldownOptions?.output]
		.flat()
		.filter((output): output is OutputOptions => !!output);

const patchOutputs = (
	outputs: OutputOptions[],
	keys: FileNameKey[],
): boolean => {
	let patched = false;
	for (const output of outputs) {
		for (const key of keys) {
			patched = wrapFileNames(output, key) || patched;
		}
	}
	return patched;
};

const patchViteConfig = (
	vite: ViteConfig,
	target: "client" | "server",
	logger: AstroIntegrationLogger,
) => {
	let patched = false;

	if (vite.environments?.client) {
		// Astro 6+: one build call using the Vite Environment API.
		// Client entries, chunks and assets are public. Everything else only emits assets into `_astro`.
		for (const [name, environment] of Object.entries(vite.environments)) {
			const keys: FileNameKey[] =
				name === "client" ? ALL_KEYS : ["assetFileNames"];
			patched =
				patchOutputs(collectOutputs(environment?.build), keys) || patched;
		}
		patched =
			patchOutputs(collectOutputs(vite.build), ["assetFileNames"]) || patched;
	} else {
		// Astro 5: separate builds for server and client.
		// Server entries and chunks are not public, but CSS assets are emitted into `_astro`.
		const keys: FileNameKey[] =
			target === "client" ? ALL_KEYS : ["assetFileNames"];
		patched = patchOutputs(collectOutputs(vite.build), keys);
	}

	if (!patched) {
		logger.warn(`No output options found for ${target} build. Skipping.`);
	}
};

export const integration = (): AstroIntegration => ({
	name: INTEGRATION_NAME,
	hooks: {
		"astro:build:setup": ({ vite, target, logger }) => {
			patchViteConfig(vite as ViteConfig, target, logger);
		},
	},
});
