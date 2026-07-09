// languageConfig.js
// Declarative per-language definitions used by dockerExecutor.js.
// Adding a new language later = adding one more entry here
// (see docs/DOCKER_SETUP.md -> "Adding a new language").

import dockerConfig from "./dockerConfig.js";

// NOTE: `compile` / `run` are argv arrays (NOT shell strings). They are
// passed straight to the container's entrypoint via spawn(), so there is
// no shell interpolation of user code anywhere in this pipeline — user
// code only ever exists inside the mounted source file, never on a
// command line.
const languageConfig = {
    python: {
        image: dockerConfig.images.python,
        sourceFile: "main.py",
        compile: null, // interpreted language, nothing to compile
        run: ["python3", "main.py"],
    },

    javascript: {
        image: dockerConfig.images.javascript,
        sourceFile: "main.js",
        compile: null,
        run: ["node", "main.js"],
    },

    java: {
        image: dockerConfig.images.java,
        sourceFile: "Main.java",
        compile: ["javac", "Main.java"],
        run: ["java", "Main"],
    },

    cpp: {
        image: dockerConfig.images.cpp,
        sourceFile: "main.cpp",
        compile: ["g++", "-O2", "-o", "main", "main.cpp"],
        run: ["./main"],
    },

    // Ready for future use (per project spec: "architecture should allow
    // adding more languages later"). Wire this up once wrapperGenerator.js
    // gains a C wrapper — it currently only generates JS/Python/Java/C++.
    c: {
        image: dockerConfig.images.c,
        sourceFile: "main.c",
        compile: ["gcc", "-O2", "-o", "main", "main.c"],
        run: ["./main"],
    },
};

export const isSupportedLanguage = (language) =>
    Object.prototype.hasOwnProperty.call(languageConfig, language);

export default languageConfig;
