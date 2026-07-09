// dockerConfig.js
// Centralized configuration for the Docker-based execution engine.
// Every tunable value comes from environment variables (see .env.sample).
// Nothing here should ever be hardcoded to a developer's machine.

const toInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const dockerConfig = {
    // Whether the Docker execution engine is enabled at all.
    enabled: (process.env.DOCKER_ENABLED || "true").toLowerCase() === "true",

    // TODO:
    // If Docker is not on PATH, set DOCKER_BIN to the full executable path
    // e.g. "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"
    bin: process.env.DOCKER_BIN || "docker",

    // TODO:
    // Only needed if you're talking to a remote Docker daemon
    // (e.g. tcp://remote-host:2375). Leave empty for local Docker.
    host: process.env.DOCKER_HOST || "",

    // Network mode inside the sandbox. "none" fully disables networking.
    network: process.env.DOCKER_NETWORK || "none",

    // Resource limits — TODO: tune these for your host machine.
    executionTimeoutMs: toInt(process.env.EXECUTION_TIMEOUT, 5000),
    compileTimeoutMs: toInt(process.env.COMPILE_TIMEOUT, 10000),
    memoryLimit: process.env.MEMORY_LIMIT || "256m",
    cpuLimit: process.env.CPU_LIMIT || "1",
    pidsLimit: toInt(process.env.PIDS_LIMIT, 64),

    // Where temporary submission folders are created before being mounted
    // into the container. Auto-created if missing.
    tempDirectory: process.env.TEMP_DIRECTORY || "./temp",

    // Prefix used when naming containers, so they're identifiable and
    // guaranteed unique (a uuid is appended at runtime).
    containerNamePrefix: process.env.CONTAINER_NAME_PREFIX || "judge-exec",

    // TODO:
    // Replace these Docker images if your infra needs a different
    // base/version. Any image that ships the relevant compiler/runtime works.
    images: {
        python: process.env.PYTHON_IMAGE || "python:3.12",
        java: process.env.JAVA_IMAGE || "eclipse-temurin:21",
        cpp: process.env.CPP_IMAGE || "gcc:14",
        c: process.env.C_IMAGE || process.env.CPP_IMAGE || "gcc:14",
        javascript: process.env.NODE_IMAGE || "node:22",
    },

    // Non-root user the code runs as inside the container.
    // "1000:1000" works for most official images out of the box.
    runAsUser: process.env.DOCKER_RUN_AS_USER || "1000:1000",
};

export default dockerConfig;
