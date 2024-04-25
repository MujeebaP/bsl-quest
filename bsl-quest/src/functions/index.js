const functions = require("firebase-functions");
const axios = require("axios");

// Initialize the logger
const logger = require("firebase-functions/logger");

// OpenAI API key from Firebase config
const OPENAI_API_KEY = functions.config().openai.key;

exports.provideBSLInfo = functions.https.onCall(async (data, context) => {
  const prompt = `Using only British Sign Language and standard teaching ` +
  `methods, explain in simple and fun terms ` +
  `suitable for young children: ${data.query}`;
  try {
    const response = await axios.post(
        "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions",
        {
          prompt: prompt,
          max_tokens: 100,
          temperature: 0.2,
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
    );

    // Log and return the response from OpenAI
    logger.info("OpenAI response received", {structuredData: true});
    return {answer: response.data.choices[0].text.trim()};
  } catch (error) {
    logger.error("OpenAI API request error:", error);
    throw new functions.https.HttpsError("internal", "Failed response OpenAI");
  }
});
