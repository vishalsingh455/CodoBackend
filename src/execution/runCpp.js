import { exec } from "child_process";

const runCpp = (code, input) => {
    return new Promise((resolve, reject) => {

        const command = `
docker run --rm \
--cpus="1" \
--memory="128m" \
--pids-limit=64 \
gcc:latest \
bash -c "
echo '${code.replace(/'/g, `'\\''`)}' > main.cpp &&
g++ main.cpp -o main &&
echo '${input}' | ./main
"
`;

        exec(command, { timeout: 3000 }, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr || error.message);
            }
            resolve(stdout.trim());
        });
    });
};

export default runCpp;
