import axios from "axios";
import { OpenAI } from   "openai";
//const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


export const retrieveComments = async (_, context) => {
  const fbResponse = await axios.get("https://graph.facebook.com/me/comments", {
    headers: { Authorization: `Bearer ${process.env.FACEBOOK_API_KEY}` },
  });

  const igResponse = await axios.get("https://graph.instagram.com/me/comments", {
    headers: { Authorization: `Bearer ${process.env.INSTAGRAM_API_KEY}` },
  });

  return [...fbResponse.data.comments, ...igResponse.data.comments];
};

export const generateSalesMessage = async ({ commentText }, context) => {
  try {
    const prompt = `You are a marketing assistant. Create a professional and engaging sales response to this user comment: "${commentText}". Focus on addressing the sentiment and encouraging a purchase.`;
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating sales message:", error);
    throw new Error("Failed to generate a sales message.");
  }
};

export const postSalesMessage = async ({ commentId, message }, context) => {
  await axios.post(`https://graph.facebook.com/${commentId}/comments`, {
    message,
    headers: { Authorization: `Bearer ${process.env.FACEBOOK_API_KEY}` },
  });
};

