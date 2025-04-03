// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000; // Use environment port or default to 3000

// --- Middleware ---
app.use(cors()); // Allow requests from frontend (essential for development)
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files (HTML, CSS, JS) from the 'public' directory

// --- AI Setup ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1); // Exit if API key is missing
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or another suitable model

// --- API Endpoints ---

// Endpoint to generate learning content for 4 cycles
app.post('/api/generate-content', async (req, res) => {
    const { topic } = req.body;
    // ... (input validation) ...
    console.log(`Generating content for topic: ${topic}`);
    const cyclesContent = [];
    const totalCycles = 4;

    try {
        for (let i = 1; i <= totalCycles; i++) {
            const prompt = `
            You are an AI assistant creating learning material for a Pomodoro-based learning app called Pomolearn.
            The user wants to learn about: "${topic}".
            This is Cycle ${i} of ${totalCycles}.
            Generate a descriptive, pointer-based explanation suitable for a 25-minute study session (approx. 1000-1500 words).
            Focus on relevant sub-topics for this specific cycle, progressing logically from previous cycles (if any).
            Use clear Markdown formatting:
            - Use '##' for main sub-topic headings within this cycle.
            - Use bullet points (* or -) for lists.
            - Use **bold text** for important terms or emphasis.
            Ensure the content is informative and easy to digest within the time frame.
            Do NOT include introductory or concluding phrases like "In this cycle..." or "Next cycle we will...". Just provide the core content for Cycle ${i}.

            **Content for Cycle ${i}:**
            `; // End of prompt

            // ... (AI call, response handling, add to cyclesContent array) ...
            console.log(`Requesting content for Cycle ${i}...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            // Add basic safety check info if available
            const safetyRatings = response.promptFeedback?.safetyRatings;
            if (safetyRatings && safetyRatings.some(r => r.blocked)) {
                console.warn(`Safety block detected for Cycle ${i}. Ratings:`, safetyRatings);
                throw new Error(`Content generation for Cycle ${i} was blocked due to safety settings. Try rephrasing the topic.`);
            }

            const text = await response.text();
            console.log(`Received content for Cycle ${i}. Length: ${text.length}`);
            cyclesContent.push(text.trim());
        }
        // ... (send response) ...
        console.log("Content generation complete.");
        res.json({ cycles: cyclesContent });

    } catch (error) {
        // ... (error handling - keep as before, checking specific errors) ...
        console.error("Error generating content:", error);
        // Check for specific safety-related errors
        if (error.message.includes('SAFETY') || error.message.includes('safety settings')) {
            res.status(400).json({ error: error.message }); // Pass specific safety message
        } else {
            res.status(500).json({ error: 'Failed to generate learning content from AI' });
        }
    }
});

// Endpoint to generate MCQs based on provided content
app.post('/api/generate-quiz', async (req, res) => {
    const { content } = req.body; // Expecting an array of strings (one per cycle)

    if (!content || !Array.isArray(content) || content.length === 0) {
        return res.status(400).json({ error: 'Content (as an array) is required to generate quiz' });
    }

    const combinedContent = content.join("\n\n---\n\n"); // Combine content from all cycles
    const numberOfQuestions = 25;

    console.log(`Generating ${numberOfQuestions} MCQs based on provided content (length: ${combinedContent.length})...`);

    const prompt = `
    Based *only* on the following learning material provided below, generate exactly ${numberOfQuestions} multiple-choice questions (MCQs) to test understanding.

    For each question:
    1.  Create a clear question assessing knowledge from the text.
    2.  Provide 4 distinct options (A, B, C, D).
    3.  Clearly indicate the single correct answer.

    Format the output *only* as a valid JSON array of objects. Each object in the array must have the following keys:
    - "question": (string) The question text.
    - "options": (array of 4 strings) The answer choices [A, B, C, D].
    - "correctAnswer": (string) The exact text of the correct option.

    Do not include any text before or after the JSON array. Ensure the JSON is perfectly formatted.

    --- LEARNING MATERIAL START ---
    ${combinedContent}
    --- LEARNING MATERIAL END ---

    JSON Output:
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();

        // Clean the response to get only the JSON part
        text = text.trim();
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("AI response did not contain a valid JSON array structure.");
        }
        const jsonString = text.substring(jsonStart, jsonEnd + 1);


        // Validate and parse the JSON
        let mcqs;
        try {
            mcqs = JSON.parse(jsonString);
            // Basic validation
            if (!Array.isArray(mcqs) || mcqs.length === 0 || !mcqs[0].question || !mcqs[0].options || !mcqs[0].correctAnswer) {
                throw new Error("Parsed JSON is not in the expected format.");
            }
            // Add unique IDs to each question for easier handling on the frontend
            mcqs = mcqs.map((q, index) => ({ ...q, id: `q-${index}` }));

        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", parseError);
            console.error("Raw AI response causing parse error:\n", text); // Log the problematic response
            throw new Error("AI response was not valid JSON.");
        }


        console.log(`Successfully generated and parsed ${mcqs.length} MCQs.`);
        res.json({ mcqs });

    } catch (error) {
        console.error("Error generating quiz:", error);
        // Check for specific safety-related errors
        if (error.message.includes('SAFETY')) {
            res.status(400).json({ error: 'Quiz generation failed due to safety settings based on the content.' });
        } else {
            res.status(500).json({ error: 'Failed to generate quiz from AI: ' + error.message });
        }
    }
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Pomolearn server listening at http://localhost:${port}`);
    console.log("Serving frontend from the 'public' directory.");
});