// import OpenAI from "openai";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });
// // const openai = new OpenAI();

// const analyzeCode = async (req, res) => {
//     try {
//         const { code, language } = req.body
//         const completion = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             messages: [
//                 {
//                     role: "user",
//                     content: `
// You are an expert computer science instructor.

// Analyze the following code and return:
// 1. Time Complexity in Big-O notation
// 2. Space Complexity in Big-O notation
// 3. A short explanation

// Return JSON only.

// Language: ${language}

// Code:
// ${code}
//           `,
//                 },
//             ],
//             temperature: 0.2,
//         });

//         const result = JSON.parse(
//             completion.choices[0].message.content
//         );

//         return res
//         .status(200)
//         .json({
//             success: true,
//             result
//         })
//     } catch (error) {
//         return res
//         .status(500)
//         .json({
//             success: false,
//             message: `Server error while analyzing code ${error.message}}`
//         })
//     }
// }

// export {analyzeCode}
import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeCode = async (req, res) => {
    try {
        console.log("LOGGED KEY:", process.env.GEMINI_API_KEY ? "FOUND" : "NOT FOUND / UNDEFINED");
        const { code, language } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: "You are a code analyzer. Always return valid JSON only."
        });

        const prompt = `
You are a strict code complexity analyzer for programming competitions.

STRICT RULES:
1. Output ONLY a valid JSON object.
2. Do NOT use markdown, code blocks, or extra text.
3. Use ONLY these keys:
   - "time_complexity"
   - "space_complexity"
   - "explanation"
4. All values must be strings.
5. Do NOT explain code logic.
6. Do NOT suggest improvements or optimizations.
7. If complexity cannot be determined exactly, give the best possible Big-O estimate.

TASK:
Analyze the time and space complexity of the following ${language} code.

CODE:
${code}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Remove markdown formatting if the model adds it
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        const finalResult = JSON.parse(cleanedJson);

        return res.status(200).json({
            success: true,
            result: finalResult
        });
    } catch (error) {
        console.error("Gemini Error:", error.message);
        return res.status(500).json({
            success: false,
            message: `AI analysis failed: ${error.message}`
        });
    }
};

export { analyzeCode };
