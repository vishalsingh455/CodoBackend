import { exec } from "child_process";

const runJava = (code, input) => {
    return new Promise((resolve, reject) => {

        const command = `
docker run --rm \
--cpus="1" \
--memory="256m" \
--pids-limit=64 \
openjdk:17 \
bash -c "
echo '${code.replace(/'/g, `'\\''`)}' > Main.java &&
javac Main.java &&
echo '${input}' | java Main
"
`;

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr || error.message);
            }
            resolve(stdout.trim());
        });
    });
};

export default runJava;
