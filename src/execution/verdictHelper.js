// verdictHelper.js
// Converts raw stdout/stderr/exitCode/timedOut data from containerManager
// into the exact { output, error } shape that execution.controller.js /
// evaluation.controller.js already expect. Keeping this mapping in one
// place means the rest of the app never has to know Docker is involved.

const buildCompileErrorVerdict = (compileResult) => {
    if (compileResult.timedOut) {
        return {
            output: "",
            error: "Compilation Error: compilation timed out",
        };
    }
    const message = (compileResult.stderr || compileResult.stdout || "Unknown compilation error").trim();
    return {
        output: "",
        error: `Compilation Error: ${message}`,
    };
};

const buildRunVerdict = (runResult) => {
    if (runResult.timedOut) {
        return {
            output: "",
            error: "Time Limit Exceeded",
        };
    }

    const stdout = (runResult.stdout || "").trim();
    const stderr = (runResult.stderr || "").trim();

    if (runResult.exitCode !== 0) {
        return {
            output: stdout,
            error: stderr || `Runtime Error (exit code ${runResult.exitCode})`,
        };
    }

    // Some sandboxes write benign warnings to stderr even on success.
    // Only surface stderr as an error when the process actually failed;
    // otherwise prefer returning it as null to match Piston's behavior.
    return {
        output: stdout,
        error: stderr ? stderr : null,
    };
};

export { buildCompileErrorVerdict, buildRunVerdict };
