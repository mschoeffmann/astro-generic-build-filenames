import { spawn } from "node:child_process";
import { resolve } from "node:path";

/**
 *
 * @param {string} command
 * @param {{captureOutput?: boolean}} [options]
 *
 * @returns {Promise<string>}
 */
const run = async (command, options = {}) => {
	const { captureOutput = false } = options;
	const cwd = resolve();
	return new Promise((resolve, reject) => {
		const cmd = spawn(command, {
			// Keep commands fully interactive unless output must be captured.
			stdio: captureOutput ? ["inherit", "pipe", "inherit"] : "inherit",
			shell: true,
			cwd,
		});

		let output = "";

		if (captureOutput && cmd.stdout) {
			cmd.stdout.on("data", (data) => {
				output += data.toString();
			});
		}

		cmd.on("error", (error) => {
			reject(error);
		});

		cmd.on("close", (code) => {
			if (code === 0) {
				resolve(output);
				return;
			}

			reject(new Error(`Command failed (${code}): ${command}`));
		});
	});
};

const main = async () => {
	await run("pnpm changeset version");
	await run("git add .");
	await run('git commit -m "chore: update version"');
	await run("git push");
	await run("pnpm --filter astro-generic-build-filenames build");
	await run("pnpm changeset publish");
	await run("git push --follow-tags");
	const tag = (await run("git describe --abbrev=0", { captureOutput: true })).trim();
	const name = tag.split("@").pop();
	await run(
		`gh release create ${tag} --title ${name} --notes "Please refer to [CHANGELOG.md](https://github.com/mschoeffmann/astro-generic-build-filenames/blob/main/package/CHANGELOG.md) for details."`,
	);
};

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
