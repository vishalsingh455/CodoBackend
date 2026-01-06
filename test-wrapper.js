// Test script for function-based code execution
import generateWrapperCode from './src/execution/wrapperGenerator.js';

const testProblem = {
    functionName: 'twoSum',
    parameters: [
        { name: 'nums', type: 'int[]' },
        { name: 'target', type: 'int' }
    ]
};

const testInput = {
    nums: [2, 7, 11, 15],
    target: 9
};

const testCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`;

// Test JavaScript wrapper
console.log('=== JavaScript Wrapper ===');
const jsWrapper = generateWrapperCode('javascript', testCode, testProblem.functionName, testProblem.parameters, testInput);
console.log(jsWrapper);

// Test Python wrapper
const pythonCode = `
def twoSum(nums, target):
    map_dict = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in map_dict:
            return [map_dict[complement], i]
        map_dict[num] = i
    return []
`;

console.log('\n=== Python Wrapper ===');
const pyWrapper = generateWrapperCode('python', pythonCode, testProblem.functionName, testProblem.parameters, testInput);
console.log(pyWrapper);
