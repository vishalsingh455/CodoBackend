import executeCode from "../execution/executor.js";

const executeSubmission = async (submission, testCases) => {
    let passed = 0;
    let firstError = "";

    for (let testCase of testCases) {
        try {
            const result = await executeCode(
                submission.language,
                submission.code,
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

            if (
                result.output.trim() === testCase.expectedOutput.trim()
            ) {
                passed++;
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
