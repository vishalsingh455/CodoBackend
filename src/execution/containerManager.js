// containerManager.js
// Low-level Docker container runner. Every submission-related process
// (compile step, run step) goes through this module.
//
// Security notes:
// - We use spawn()/execFile() exclusively — never exec() — so user input
//   (source code, stdin) is never interpolated into a shell string.
// - User code always reaches the container as a file on a bind mount,
//   never as a CLI argument, so there is no command-injection surface.

import { spawn, execFile } from "child_process";
import crypto from "crypto";
import dockerConfig from "./dockerConfig.js";

const buildDockerEnv = () => {
    const env = { ...process.env };
    // TODO: only needed when targeting a non-local Docker daemon.
    if (dockerConfig.host) {
        env.DOCKER_HOST = dockerConfig.host;
    }
    return env;
};

// Force-stops a container. Safe to call even if it already exited.
const killContainer = (containerName) => {
    return new Promise((resolve) => {
        execFile(
            dockerConfig.bin,
            ["kill", containerName],
            { env: buildDockerEnv() },
            () => resolve() // ignore errors — container may already be gone
        );
    });
};

/**
 * Runs `command` inside a fresh, sandboxed container.
 *
 * @param {object} opts
 * @param {string} opts.image        Docker image to use
 * @param {string[]} opts.command    Argv to run inside the container (no shell)
 * @param {string} opts.hostDir      Absolute path to the temp dir to mount at /box
 * @param {string} [opts.stdin]      Data to pipe to the process's stdin
 * @param {number} opts.timeoutMs    Hard wall-clock timeout for this step
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number|null, timedOut: boolean}>}
 */
const runInContainer = ({ image, command, hostDir, stdin = "", timeoutMs }) => {
    return new Promise((resolve) => {
        const containerName = `${dockerConfig.containerNamePrefix}-${crypto.randomUUID()}`;

        const args = [
            "run",
            "--rm",
            "--name", containerName,
            "--network", dockerConfig.network,
            "--memory", dockerConfig.memoryLimit,
            "--cpus", dockerConfig.cpuLimit,
            "--pids-limit", String(dockerConfig.pidsLimit),
            "--security-opt", "no-new-privileges",
            "--cap-drop", "ALL",
            "--read-only",
            "--tmpfs", "/tmp:rw,exec,size=64m",
            "-v", `${hostDir}:/box`,
            "--workdir", "/box",
            "--user", dockerConfig.runAsUser,
            "-i", // keep stdin open so we can pipe input
            image,
            ...command,
        ];

        const child = spawn(dockerConfig.bin, args, { env: buildDockerEnv()});

        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let settled = false;

        const timer = setTimeout(async () => {
            timedOut = true;
            await killContainer(containerName);
            child.kill("SIGKILL");
        }, timeoutMs);

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({
                stdout: "",
                stderr: `Docker execution failed: ${err.message}`,
                exitCode: null,
                timedOut: false,
            });
        });

        child.on("close", (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({
                stdout,
                stderr,
                exitCode: code,
                timedOut,
            });
        });

        // Feed stdin, then close it so the program sees EOF.
        try {
            child.stdin.write(stdin || "");
            child.stdin.end();
        } catch (err) {
            // Process may have already exited (e.g. immediate crash) —
            // the 'close' handler above still resolves the promise.
        }
    });
};

export { runInContainer, killContainer };
