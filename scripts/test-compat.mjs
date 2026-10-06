// Builds the playground against multiple Astro versions using the packed package tarball.
// Usage: node scripts/test-compat.mjs [versions]   e.g. node scripts/test-compat.mjs 5,6,latest
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { run } from "./utils.mjs";

const root = resolve(import.meta.dirname, "..");
const versions = (process.argv[2] ?? "5,6,latest").split(",").filter(Boolean);
const playgroundFiles = [
	"astro.config.mts",
	"tsconfig.json",
	"public",
	"scripts",
	"src",
];

const main = async () => {
	const workDir = await mkdtemp(
		join(tmpdir(), "astro-generic-build-filenames-"),
	);
	const failed = [];

	try {
		await run("pnpm --filter astro-generic-build-filenames build", {
			cwd: root,
		});
		await run(`pnpm pack --pack-destination ${workDir}`, {
			cwd: join(root, "package"),
		});
		const tarball = (await readdir(workDir)).find((file) =>
			file.endsWith(".tgz"),
		);
		if (!tarball) throw new Error("Could not find packed tarball.");

		for (const version of versions) {
			console.log(`\n▶ astro@${version}\n`);
			const projectDir = join(workDir, `astro-${version}`);
			await mkdir(projectDir);
			for (const file of playgroundFiles) {
				await cp(join(root, "playground", file), join(projectDir, file), {
					recursive: true,
				});
			}
			await writeFile(
				join(projectDir, "package.json"),
				JSON.stringify(
					{
						name: `compat-astro-${version}`,
						private: true,
						type: "module",
						dependencies: {
							astro: version,
							"astro-generic-build-filenames": `file:${join(workDir, tarball)}`,
						},
					},
					null,
					"\t",
				),
			);
			// Makes the project its own pnpm root, so build scripts can be allowed.
			await writeFile(
				join(projectDir, "pnpm-workspace.yaml"),
				"allowBuilds:\n  esbuild: true\n  sharp: true\n",
			);

			try {
				await run("pnpm install --silent", { cwd: projectDir });
				await run("pnpm exec astro --version", { cwd: projectDir });
				await run("pnpm exec astro build", { cwd: projectDir });
				await run("node scripts/verify-output.mjs", { cwd: projectDir });
			} catch (error) {
				console.error(error.message);
				failed.push(version);
			}
		}
	} finally {
		await rm(workDir, { recursive: true, force: true });
	}

	console.log();
	for (const version of versions) {
		console.log(`${failed.includes(version) ? "✗" : "✓"} astro@${version}`);
	}
	if (failed.length > 0) {
		process.exitCode = 1;
	}
};

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
