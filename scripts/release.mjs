// Releases the package: checks prerequisites, versions, publishes to npm, pushes and creates a GitHub release.
// Usage: pnpm release [--dry-run] [--skip-compat] [--yes]
//   --dry-run      run all checks, lint and tests, then stop before changing anything
//   --skip-compat  skip building the playground against multiple Astro versions
//   --yes          do not ask for confirmation before publishing
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { check, run } from "./utils.mjs";

const root = resolve(import.meta.dirname, "..");
const packageDir = join(root, "package");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipCompat = args.has("--skip-compat");
const yes = args.has("--yes");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const step = (message) => console.log(`\n\x1b[1m▶ ${message}\x1b[0m`);

const confirm = async (question) => {
	if (yes) return true;
	if (!process.stdin.isTTY) {
		throw new Error(
			"Not running in an interactive terminal. Use --yes to skip confirmation.",
		);
	}
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	const answer = await rl.question(`${question} [y/N] `);
	rl.close();
	return answer.trim().toLowerCase() === "y";
};

/**
 * Checks everything that would otherwise make the release fail halfway.
 * Reports all problems at once instead of failing on the first one.
 */
const preflight = async () => {
	step("Checking prerequisites");
	const { baseBranch } = await readJson(join(root, ".changeset/config.json"));
	const problems = [];
	const ok = (message) => console.log(`  \x1b[32m✓\x1b[0m ${message}`);
	const fail = (message, hint) => {
		console.log(`  \x1b[31m✗\x1b[0m ${message}`);
		problems.push(hint ? `${message}\n    → ${hint}` : message);
	};

	const missing = [];
	for (const command of ["git", "pnpm", "npm", "gh"]) {
		if (!(await check(`command -v ${command}`)).ok) missing.push(command);
	}
	if (missing.length > 0) {
		fail(
			`Missing commands: ${missing.join(", ")}`,
			"Install them and make sure they are in your PATH.",
		);
	} else {
		ok("git, pnpm, npm and gh are installed");
	}

	if (!dryRun && !yes && !process.stdin.isTTY) {
		fail(
			"Not running in an interactive terminal",
			"Publishing may ask for a 2FA code. Run it in a terminal, or pass --yes if no prompt is needed.",
		);
	}

	if (!missing.includes("npm") && !missing.includes("pnpm")) {
		// pnpm does the actual publishing and has its own config, so check its login.
		const whoami = await check("pnpm whoami");
		if (whoami.ok) {
			ok(`Logged in to npm registry as ${whoami.output}`);
			const { name } = await readJson(join(packageDir, "package.json"));
			const access = await check(
				`npm access list collaborators ${name} ${whoami.output} --json`,
			);
			const permission = access.ok
				? JSON.parse(access.output || "{}")[whoami.output]
				: undefined;
			if (permission === "read-write") {
				ok(`npm user ${whoami.output} can publish ${name}`);
			} else {
				fail(
					`npm user ${whoami.output} has no publish rights for ${name}`,
					"Log in with the right account: pnpm login",
				);
			}
		} else {
			fail("Not logged in to npm registry", "Run: pnpm login");
		}
	}

	if (!missing.includes("gh")) {
		if ((await check("gh auth status")).ok) {
			ok("Logged in to GitHub CLI");
		} else {
			fail("Not logged in to GitHub CLI", "Run: gh auth login");
		}
	}

	if (!missing.includes("git")) {
		const branch = (await check("git branch --show-current")).output;
		if (branch === baseBranch) {
			ok(`On branch ${baseBranch}`);
		} else {
			fail(
				`On branch "${branch}", expected "${baseBranch}"`,
				`Run: git switch ${baseBranch}`,
			);
		}

		if ((await check("git status --porcelain")).output === "") {
			ok("Working tree is clean");
		} else {
			fail(
				"Working tree has uncommitted changes",
				"Commit or stash them first.",
			);
		}

		if ((await check("git fetch --quiet")).ok) {
			const counts = await check(
				"git rev-list --left-right --count HEAD...@{u}",
			);
			const [ahead, behind] = counts.output.split(/\s+/).map(Number);
			if (!counts.ok) {
				fail("Branch has no upstream", `Run: git push -u origin ${baseBranch}`);
			} else if (behind > 0) {
				fail(
					`Branch is ${behind} commit(s) behind its upstream`,
					"Run: git pull",
				);
			} else if (ahead > 0) {
				fail(
					`Branch is ${ahead} commit(s) ahead of its upstream`,
					"Run: git push",
				);
			} else {
				ok("Branch is up to date with its upstream");
			}
		} else {
			fail(
				"Could not fetch from remote",
				"Check your network and git credentials.",
			);
		}
	}

	const changesets = (await readdir(join(root, ".changeset"))).filter(
		(file) => file.endsWith(".md") && file !== "README.md",
	);
	if (changesets.length > 0) {
		ok(`${changesets.length} pending changeset(s)`);
	} else {
		fail("No pending changesets", "Run: pnpm changeset");
	}

	if (problems.length > 0) {
		throw new Error(
			`Release aborted. Fix the following and try again:\n\n  - ${problems.join("\n  - ")}`,
		);
	}
};

const getReleaseNotes = async (version) => {
	const changelog = await readFile(join(packageDir, "CHANGELOG.md"), "utf8");
	const section = changelog
		.split(/^## /m)
		.find((part) => part.startsWith(`${version}\n`));
	const notes = section?.slice(version.length).trim() ?? "";
	const link =
		"See [CHANGELOG.md](https://github.com/mschoeffmann/astro-generic-build-filenames/blob/main/package/CHANGELOG.md) for all changes.";
	return notes ? `${notes}\n\n${link}` : link;
};

const main = async () => {
	await preflight();

	step("Installing dependencies");
	await run("pnpm install --frozen-lockfile", { cwd: root });

	step("Linting");
	await run("pnpm lint", { cwd: root });

	step("Building and testing");
	await run("pnpm test", { cwd: root });

	if (!skipCompat) {
		step("Testing compatibility with multiple Astro versions");
		await run("pnpm test:compat", { cwd: root });
	}

	step("Pending changes");
	await run("pnpm changeset status --verbose", { cwd: root });

	if (dryRun) {
		console.log("\nDry run complete. Nothing was changed.");
		return;
	}

	const startCommit = (
		await run("git rev-parse HEAD", { captureOutput: true, cwd: root })
	).trim();

	step("Versioning");
	await run("pnpm changeset version", { cwd: root });
	const { name, version } = await readJson(join(packageDir, "package.json"));
	const tag = `${name}@${version}`;

	// The working tree was clean before, so this only discards changes made by this script.
	const rollback = async () => {
		console.log("\nRolling back local release changes...");
		await check(`git tag -d ${tag}`, { cwd: root });
		await run(`git reset --hard ${startCommit}`, { cwd: root });
		console.log("Rolled back. Nothing was pushed or published.");
	};

	if (!(await confirm(`\nPublish ${tag} to npm and GitHub?`))) {
		await rollback();
		return;
	}

	await run("git add -A", { cwd: root });
	await run(`git commit -m "chore: update version to ${version}"`, {
		cwd: root,
	});

	step(`Publishing ${tag}`);
	try {
		await run("pnpm --filter astro-generic-build-filenames build", {
			cwd: root,
		});
		await run("pnpm changeset publish", { cwd: root });
	} catch (error) {
		// Only roll back if the version did not reach npm.
		if ((await check(`npm view ${tag} version`)).output !== version) {
			await rollback();
			throw error;
		}
		console.error(error.message);
		console.log(`${tag} is on npm, continuing.`);
	}

	if (
		!(await check(`git rev-parse -q --verify refs/tags/${tag}`, { cwd: root }))
			.ok
	) {
		await run(`git tag -a ${tag} -m ${tag}`, { cwd: root });
	}

	step("Pushing to GitHub");
	try {
		await run("git push --follow-tags", { cwd: root });
		await run(
			`gh release create ${tag} --verify-tag --title ${version} --notes-file -`,
			{ cwd: root, input: await getReleaseNotes(version) },
		);
	} catch (error) {
		throw new Error(
			`${error.message}\n\n${tag} is published to npm, but pushing to GitHub failed. Finish manually:\n  git push --follow-tags\n  gh release create ${tag} --verify-tag --title ${version} --notes-file <notes>`,
		);
	}

	console.log(`\n\x1b[32m✓ Released ${tag}\x1b[0m`);
};

main().catch((error) => {
	console.error(`\n\x1b[31m${error.message}\x1b[0m`);
	process.exitCode = 1;
});
