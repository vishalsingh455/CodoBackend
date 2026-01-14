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

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeCode = async (req, res) => {
    try {
        const { code, language } = req.body;

        // Use Gemini 1.5 Flash for speed and free tier access
        //const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: "You are a code analyzer. Always return valid JSON only."
        });

        const prompt = `
            You are an expert computer science instructor.
            Analyze this ${language} code and return a JSON object only.
            JSON keys: "time_complexity", "space_complexity", "explanation".
            Code:
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
            message: `AI analysis failed: ${error.message}kkkk`
        });
    }
};

export { analyzeCode };
