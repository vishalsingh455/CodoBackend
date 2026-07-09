// fileManager.js
// Creates an isolated temp working directory per submission run, writes the
// generated source file into it, and guarantees cleanup afterwards.

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dockerConfig from "./dockerConfig.js";

// Ensures the configured base temp directory exists.
const ensureBaseDir = async () => {
    await fs.mkdir(dockerConfig.tempDirectory, { recursive: true });
};

// Creates a unique per-run folder, e.g. ./temp/run-<uuid>/
const createRunDir = async () => {
    await ensureBaseDir();
    const runId = crypto.randomUUID();
    const runDir = path.resolve(dockerConfig.tempDirectory, `run-${runId}`);
    await fs.mkdir(runDir, { recursive: true });

    // The container runs as a non-root user (see dockerConfig.runAsUser)
    // but the bind-mounted folder is owned by whatever uid runs this
    // Node process. Relaxing permissions here lets the container's
    // non-root user read/write/compile inside it.
    await fs.chmod(runDir, 0o777);

    return runId;
};

const runDirPath = (runId) =>
    path.resolve(dockerConfig.tempDirectory, `run-${runId}`);

// Writes the generated wrapper/source code into the run directory.
const writeSourceFile = async (runId, fileName, content) => {
    const dir = runDirPath(runId);
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, content, { mode: 0o666 });
    return filePath;
};

// Deletes the entire run directory. Always call this in a `finally` block.
const cleanupRunDir = async (runId) => {
    const dir = runDirPath(runId);
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch (err) {
        console.error(`Failed to clean up temp dir for run ${runId}:`, err.message || err);
    }
};

export { createRunDir, writeSourceFile, cleanupRunDir, runDirPath };
