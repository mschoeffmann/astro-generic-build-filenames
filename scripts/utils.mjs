import { spawn } from "node:child_process";
import { resolve } from "node:path";

/**
 * Runs a shell command.
 *
 * @param {string} command
 * @param {{captureOutput?: boolean, silent?: boolean, cwd?: string, input?: string}} [options]
 *   - `captureOutput`: return stdout instead of printing it.
 *   - `silent`: capture stdout and stderr, only include them in the error message on failure.
 *   - `input`: text to write to stdin.
 *
 * @returns {Promise<string>} the captured stdout (empty unless `captureOutput` or `silent` is set)
 */
export const run = async (command, options = {}) => {
	const {
		captureOutput = false,
		silent = false,
		cwd = resolve(),
		input,
	} = options;
	return new Promise((resolve, reject) => {
		const stdin =
			input === undefined ? (silent ? "ignore" : "inherit") : "pipe";
		const cmd = spawn(command, {
			// Keep commands fully interactive unless output must be captured.
			stdio: [
				stdin,
				silent || captureOutput ? "pipe" : "inherit",
				silent ? "pipe" : "inherit",
			],
			shell: true,
			cwd,
		});

		if (input !== undefined) {
			cmd.stdin?.end(input);
		}

		let output = "";
		let errorOutput = "";
		cmd.stdout?.on("data", (data) => {
			output += data.toString();
		});
		cmd.stderr?.on("data", (data) => {
			errorOutput += data.toString();
		});

		cmd.on("error", (error) => {
			reject(error);
		});

		cmd.on("close", (code) => {
			if (code === 0) {
				resolve(output);
				return;
			}
			const details = silent ? `\n${(errorOutput || output).trim()}` : "";
			reject(new Error(`Command failed (${code}): ${command}${details}`));
		});
	});
};

/**
 * Runs a command and returns whether it succeeded, without printing anything.
 *
 * @param {string} command
 * @param {{cwd?: string}} [options]
 *
 * @returns {Promise<{ok: boolean, output: string}>}
 */
export const check = async (command, options = {}) => {
	try {
		return {
			ok: true,
			output: (await run(command, { ...options, silent: true })).trim(),
		};
	} catch (error) {
		return { ok: false, output: error.message };
	}
};
