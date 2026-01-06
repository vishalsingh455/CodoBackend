// Wrapper Code Generator for LeetCode-style Function Evaluation
// Generates complete executable code that calls user functions with test inputs

const generateWrapperCode = (language, userCode, functionName, parameters, testCaseInput) => {
    switch (language) {
        case 'javascript':
            return generateJSWrapper(userCode, functionName, parameters, testCaseInput);
        case 'python':
            return generatePythonWrapper(userCode, functionName, parameters, testCaseInput);
        case 'java':
            return generateJavaWrapper(userCode, functionName, parameters, testCaseInput);
        case 'cpp':
            return generateCppWrapper(userCode, functionName, parameters, testCaseInput);
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
};

const generateJSWrapper = (userCode, functionName, parameters, testCaseInput) => {
    // Convert test case input to JavaScript variable declarations
    const inputDeclarations = Object.entries(testCaseInput)
        .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
        .join('\n');

    return `
// User function
${userCode}

// Test execution
${inputDeclarations}

// Call function and print result as JSON
const result = ${functionName}(${parameters.map(p => p.name).join(', ')});
console.log(JSON.stringify(result));
`;
};

const generatePythonWrapper = (userCode, functionName, parameters, testCaseInput) => {
    // Convert test case input to Python variable assignments
    const inputDeclarations = Object.entries(testCaseInput)
        .map(([key, value]) => `${key} = ${pythonValue(value)}`)
        .join('\n');

    return `
import json
import sys

# User function
${userCode}

# Test execution
${inputDeclarations}

# Call function and print result as JSON
result = ${functionName}(${parameters.map(p => p.name).join(', ')})
print(json.dumps(result, separators=(',', ':')))
`;
};

const generateJavaWrapper = (userCode, functionName, parameters, testCaseInput) => {
    // Convert test case input to Java variable declarations
    const inputDeclarations = Object.entries(testCaseInput)
        .map(([key, value]) => `        ${javaType(value)} ${key} = ${javaValue(value)};`)
        .join('\n');

    const paramList = parameters.map(p => p.name).join(', ');

    return `
import java.util.*;

public class Main {
    // Simple JSON output method
    public static String toJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        if (obj instanceof String) {
            return "\\"" + obj + "\\"";
        }
        if (obj instanceof Integer || obj instanceof Double || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof int[]) {
            int[] arr = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof String[]) {
            String[] arr = (String[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append("\\"").append(arr[i]).append("\\"");
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }

    // User function
${userCode.replace(/^/gm, '    ')}

    public static void main(String[] args) {
        try {
            // Test input setup
${inputDeclarations}

            // Call function
            Object result = ${functionName}(${paramList});

            // Print result as JSON
            System.out.println(toJson(result));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
`;
};


// const generateCppWrapper = (userCode, functionName, parameters, testCaseInput) => {
//     // Convert test case input to C++ variable declarations
//     const inputDeclarations = Object.entries(testCaseInput)
//         .map(([key, value]) => `    std::vector<int> ${key} = ${cppValue(value)};`)
//         .join('\n');

//     const paramList = parameters.map(p => p.name).join(', ');

//     return `
// #include <iostream>
// #include <vector>
// #include <string>

// int main() {
//     // Test execution
// ${inputDeclarations}

//     // Call function and print result directly (JSON format for int)
//     auto result = ${functionName}(${paramList});
//     std::cout << result << std::endl;

//     return 0;
// }

// // User function
// ${userCode}
// `;
// };

// Helper functions for type conversion
const generateCppWrapper = (userCode, functionName, parameters, testCaseInput) => {
    // Convert test case input to C++ variable declarations (vector<int> only)
    const inputDeclarations = Object.entries(testCaseInput)
        .map(([key, value]) => `    std::vector<int> ${key} = ${cppValue(value)};`)
        .join('\n');

    const paramList = parameters.map(p => p.name).join(', ');

    return `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// User function
${userCode}

int main() {
    // Test input setup
${inputDeclarations}

    // Call function and print result directly (valid JSON for int)
    auto result = ${functionName}(${paramList});
    cout << result << endl;

    return 0;
}
`;
};


const pythonValue = (value) => {
    if (Array.isArray(value)) {
        return '[' + value.map(pythonValue).join(', ') + ']';
    }
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }
    return JSON.stringify(value);
};

const javaType = (value) => {
    if (Array.isArray(value)) {
        if (value.length === 0) return 'int[]'; // Default to int[] for empty arrays
        const elementType = typeof value[0];
        if (elementType === 'number') return 'int[]';
        if (elementType === 'string') return 'String[]';
        return 'Object[]';
    }
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'string') return 'String';
    if (typeof value === 'boolean') return 'boolean';
    return 'Object';
};

const javaValue = (value) => {
    if (Array.isArray(value)) {
        if (value.length === 0) return 'new int[0]'; // Default empty int array
        const elementType = typeof value[0];
        if (elementType === 'number') {
            return `new int[]{${value.join(', ')}}`;
        }
        if (elementType === 'string') {
            return `new String[]{${value.map(v => `"${v}"`).join(', ')}}`;
        }
        return `new Object[]{${value.map(javaValue).join(', ')}}`;
    }
    if (typeof value === 'string') {
        return `"${value}"`;
    }
    return JSON.stringify(value);
};

// const cppValue = (value) => {
//     if (Array.isArray(value)) {
//         return `{${value.map(cppValue).join(', ')}}`;
//     }
//     if (typeof value === 'string') {
//         return `std::string("${value}")`;
//     }
//     return JSON.stringify(value);
// };

const escapeCppString = (str) =>
    str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');

const cppValue = (value) => {
    if (Array.isArray(value)) {
        return `{${value.map(cppValue).join(', ')}}`;
    }

    if (typeof value === 'string') {
        return `std::string("${escapeCppString(value)}")`;
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value.toString() : '0';
    }

    // fallback (should not happen in your platform)
    return '0';
};


export default generateWrapperCode;
