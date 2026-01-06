import axios from "axios";
import { pistonLanguageMap } from "../utils/pistonLanguages.js";

const runCodePiston = async (language, code, input) => {
    try {
        const pistonLang = pistonLanguageMap[language];

        if (!pistonLang) {
            throw new Error("Unsupported language");
        }

        const fileName = language === "python" ? "main.py" :
                        language === "cpp" ? "main.cpp" :
                        language === "java" ? "Main.java" :
                        "main.js";

        const response = await axios.post(
            "https://emkc.org/api/v2/piston/execute",
            {
                language: pistonLang,
                version: "*",
                files: [
                    {
                        name: fileName,
                        content: code
                    }
                ],
                stdin: input+"\n"
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const stdout = response.data.run?.stdout?.trim() || "";
        const stderr = response.data.run?.stderr?.trim() || "";

        return {
            output: stdout,
            error: stderr || null
        };

    } catch (error) {
        console.error("Piston error:", error.message || error);
        return ""; // treat as failed
    }
};

export default runCodePiston;
