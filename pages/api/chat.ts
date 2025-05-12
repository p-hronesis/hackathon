import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

// Initialize OpenAI client
const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(configuration);

interface ChatRequestBody {
  question: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { question } = req.body as ChatRequestBody;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required" });
  }

  if (question.length > 200) {
    return res.status(400).json({ error: "Question must be 200 characters or fewer" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    const answer = completion.choices[0]?.message?.content?.trim();
    return res.status(200).json({ answer: answer || "No answer" });
  } catch (error: any) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
}
