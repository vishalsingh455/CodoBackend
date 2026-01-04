import { exec } from "child_process";

const runPython = (code, input) => {
    return new Promise((resolve, reject) => {
        const command = `
docker run --rm \
--cpus="1" \
--memory="128m" \
--pids-limit=64 \
python:3.10 \
bash -c "echo '${code.replace(/'/g, `'\\''`)}' > main.py && echo '${input}' | python3 main.py"
`;

        exec(command, { timeout: 3000 }, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr || error.message);
            }
            resolve(stdout.trim());
        });
    });
};

export default runPython;
