// Verifies that all client build files use generic names (entry, chunk, asset).
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const assetsDir = new URL("../dist/_astro/", import.meta.url);
const allowed = /^(entry|chunk|asset)\.[\w-]+\.\w+(\.map)?$/;

let files;
try {
	files = await readdir(assetsDir, { recursive: true, withFileTypes: true });
} catch {
	console.error(
		`No build output found in ${assetsDir.pathname}. Run "astro build" first.`,
	);
	process.exit(1);
}

const names = files
	.filter((file) => file.isFile())
	.map((file) =>
		join(file.parentPath, file.name).slice(assetsDir.pathname.length),
	);
const invalid = names.filter((name) => !allowed.test(name));
const kinds = new Set(names.map((name) => name.split(".")[0]));

if (names.length === 0) {
	console.error("No files found in dist/_astro.");
	process.exit(1);
}

for (const kind of ["entry", "chunk", "asset"]) {
	if (!kinds.has(kind)) {
		invalid.push(`(no "${kind}" file found)`);
	}
}

if (invalid.length > 0) {
	console.error("Unexpected file names in dist/_astro:");
	for (const name of invalid) console.error(`  ${name}`);
	console.error("All files:");
	for (const name of names) console.error(`  ${name}`);
	process.exit(1);
}

console.log(`✓ ${names.length} files in dist/_astro use generic names:`);
for (const name of names) console.log(`  ${name}`);
