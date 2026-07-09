// dockerExecutor.js
// Drop-in replacement for pistonExecutor.js. Same signature, same return
// shape — executor.js only needs its import changed to point here.
//
// Flow per submission (per docs/DOCKER_SETUP.md):
//   create temp dir -> write source file -> [compile] -> run -> capture
//   stdout/stderr -> map to verdict -> destroy container -> delete temp dir

import dockerConfig from "./dockerConfig.js";
import languageConfig, { isSupportedLanguage } from "./languageConfig.js";
import { createRunDir, writeSourceFile, cleanupRunDir, runDirPath } from "./fileManager.js";
import { runInContainer } from "./containerManager.js";
import { buildCompileErrorVerdict, buildRunVerdict } from "./verdictHelper.js";

/**
 * Executes `code` for the given `language` inside a sandboxed Docker
 * container, feeding it `input` on stdin.
 *
 * @param {string} language  one of the keys in languageConfig.js
 * @param {string} code      full source code to execute (already wrapped
 *                           by wrapperGenerator.js upstream)
 * @param {string} input     data to pipe to stdin
 * @returns {Promise<{output: string, error: string|null}>}
 */
const runCodeDocker = async (language, code, input) => {
    console.log("DEBUG dockerConfig.bin:", dockerConfig.bin); // TEMP — remove later
    console.log("DEBUG dockerConfig.enabled:", dockerConfig.enabled); // TEMP — remove later
    if (!dockerConfig.enabled) {
        return {
            output: "",
            error: "Docker execution engine is disabled (DOCKER_ENABLED=false)",
        };
    }

    if (!isSupportedLanguage(language)) {
        return {
            output: "",
            error: "Unsupported language",
        };
    }

    const config = languageConfig[language];
    let runId;

    try {
        runId = await createRunDir();
        await writeSourceFile(runId, config.sourceFile, code);
        const hostDir = runDirPath(runId);

        // Compile step (skipped for interpreted languages like Python/JS)
        if (config.compile) {
            const compileResult = await runInContainer({
                image: config.image,
                command: config.compile,
                hostDir,
                stdin: "",
                timeoutMs: dockerConfig.compileTimeoutMs,
            });

            if (compileResult.timedOut || compileResult.exitCode !== 0) {
                return buildCompileErrorVerdict(compileResult);
            }
        }

        // Run step
        const runResult = await runInContainer({
            image: config.image,
            command: config.run,
            hostDir,
            stdin: input || "",
            timeoutMs: dockerConfig.executionTimeoutMs,
        });

        return buildRunVerdict(runResult);
    } catch (error) {
        console.error("Docker execution error:", error.message || error);
        return {
            output: "",
            error: error.message || "Docker execution failed",
        };
    } finally {
        if (runId) {
            await cleanupRunDir(runId);
        }
    }
};

export default runCodeDocker;
