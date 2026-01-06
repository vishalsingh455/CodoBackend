import runCodePiston from "./pistonExecutor.js";

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

export default executeCode;
