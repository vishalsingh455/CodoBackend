import runCodePiston from "./pistonExecutor.js";
import generateWrapperCode from "./wrapperGenerator.js";

const executeFunctionCode = async (language, userCode, functionName, parameters, testCaseInput) => {
    try {
        // Generate wrapper code that includes user function + test execution
        const wrapperCode = generateWrapperCode(language, userCode, functionName, parameters, testCaseInput);

        // Execute the wrapper code (no stdin input needed)
        const result = await runCodePiston(language, wrapperCode, "");

        return result;
    } catch (error) {
        return {
            output: "",
            error: error.message || "Execution failed"
        };
    }
};

// Keep legacy function for backward compatibility (if needed)
const executeCode = async (language, code, input) => {
    try {
        const result = await runCodePiston(language, code, input);
        return result;
    } catch (error) {
        return {
            output: "",
            error: error.message || "Execution failed"
        };
    }
};

export default executeFunctionCode;
export { executeCode };
