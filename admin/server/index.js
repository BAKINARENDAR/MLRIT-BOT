const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// This loads your API key from the .env file
require('dotenv').config();

const app = express();
app.use(cors());

// Check for API Key on startup
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
    process.exit(1); // Exit the process if the key is missing
}

const API_BASE = "https://mlrit.ac.in/wp-json/wp/v2";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to fetch data from a specific WordPress endpoint
const fetchType = async (endpoint, query) => {
  try {
    const res = await axios.get(`${API_BASE}/${endpoint}?search=${encodeURIComponent(query)}&per_page=5`);
    return res.data || [];
  } catch (error) {
    // This will now gracefully handle if an endpoint doesn't exist
    console.warn(`Warning: Could not fetch from endpoint '/${endpoint}'. It might not exist. Status: ${error.response?.status}`);
    return []; // Return empty array on error to not break the flow
  }
};

app.get("/search", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    return res.status(400).json({ answer: "Please ask a question." });
  }

  const lowerQ = q.toLowerCase();
  const ignore = ["hi", "hello", "ok", "okay", "thanks", "thank you", "why"];
  if (ignore.includes(lowerQ)) {
    return res.json({ answer: "Hi there! How can I assist you with information about MLRIT?" });
  }

  try {
    // 1. RETRIEVE: Fetch context from all relevant website sections
    console.log(`Searching for: "${q}"`);
    // FIXED: Removed the endpoints that were causing 404 errors. 
    // WordPress custom post types often need special API registration to work.
    // 'pages' and 'posts' are standard and reliable.
    const sources = ["pages", "posts"];
    const searchPromises = sources.map(type => fetchType(type, q));
    const allResults = await Promise.all(searchPromises);

    const foundItems = allResults.flat();

    if (foundItems.length === 0) {
      console.log("No items found on the website for this query.");
      return res.json({ answer: "Sorry, I couldn't find any information about that on the MLRIT website. Please try asking in a different way." });
    }

    // 2. AUGMENT: Prepare the fetched data as context for the AI
    console.log(`Found ${foundItems.length} items. Preparing context for AI...`);
    const context = foundItems.map(item => {
        const title = item.title?.rendered || '';
        const content = (item.content?.rendered || item.excerpt?.rendered || "")
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return `Source Title: ${title}\nContent: ${content.substring(0, 1500)}\n---\n`;
      }).join('\n');

    // 3. GENERATE: Build a detailed prompt and call the Gemini AI
    // FIXED: Changed "gemini-pro" to a current, working model name.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are "Ask MLR", a helpful AI assistant for the MLR Institute of Technology (MLRIT).
        - Your answers must be based *only* on the context provided below.
        - If the user asks about placements and the context contains relevant data, format the response clearly. If possible, use an HTML \`<table>\`.
        - For other queries, use simple HTML for formatting like \`<b>\`, \`<ul>\`, \`<li>\`, and \`<a>\`.
        - If the context doesn't contain a specific answer, state that clearly.
        - Do not mention the "context" or "Source Title" in your final answer. Answer the user's question directly.

        CONTEXT:
        ${context}

        USER'S QUESTION: "${q}"

        YOUR HTML RESPONSE:`;

    console.log("Sending prompt to Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Received AI response.");
    res.json({ answer: text });

  } catch (error) {
    console.error("ERROR during AI Generation:", error);
    res.status(500).json({ answer: "Sorry, I encountered an issue while processing your request. The technical team has been notified." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
