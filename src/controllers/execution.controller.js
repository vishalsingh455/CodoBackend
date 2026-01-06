import executeFunctionCode from "../execution/executor.js";

// Deep comparison utility for JSON objects
const deepEqual = (a, b) => {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!deepEqual(a[key], b[key])) return false;
        }
        return true;
    }

    return false;
};

const executeSubmission = async (submission, testCases, problem) => {
    let passed = 0;
    let firstError = "";

    for (let testCase of testCases) {
        try {
            const result = await executeFunctionCode(
                submission.language,
                submission.code,
                problem.functionName,
                problem.parameters,
                testCase.input
            );

            console.log("INPUT:", testCase.input);
            console.log("EXPECTED:", testCase.expectedOutput);
            console.log("OUTPUT:", result.output);

            if (result.error) {
                // If there's an execution error, store it
                if (!firstError) {
                    firstError = result.error;
                }
                continue; // Don't count as passed
            }

            // Parse output as JSON and compare deeply
            try {
                const trimmedOutput = result.output.trim();
                console.log("TRIMMED OUTPUT:", JSON.stringify(trimmedOutput));
                const parsedOutput = JSON.parse(trimmedOutput);
                console.log("PARSED OUTPUT:", parsedOutput);
                if (deepEqual(parsedOutput, testCase.expectedOutput)) {
                    passed++;
                } else {
                    console.log("OUTPUT MISMATCH - Expected:", testCase.expectedOutput, "Got:", parsedOutput);
                }
            } catch (parseError) {
                // If output is not valid JSON, treat as error
                console.error("JSON parse error:", parseError, "Raw output:", JSON.stringify(result.output));
                if (!firstError) {
                    firstError = `Invalid output format - expected JSON. Error: ${parseError.message}`;
                }
            }
        } catch (error) {
            console.error("Execution error:", error);
            if (!firstError) {
                firstError = error.message || "Execution failed";
            }
        }
    }

    return { passed, error: firstError };
};

export { executeSubmission };
