import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful fashion assistant for EmbroCraftDZ, an Algerian marketplace connecting clients with couturières and embroidery artisans. Help users describe what they are looking for so you can match them with the right professional. Ask clarifying questions about style, fabric, occasion, city, and budget. Respond in the same language the user writes in (French or Arabic). Keep responses concise and helpful.`;

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as { message?: string };

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: message.trim(),
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return NextResponse.json({
      response: response.text || "Je peux vous aider à préciser votre demande de tenue, tissu, ville et budget.",
    });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json({
      response: "Je suis actuellement indisponible. Décrivez votre projet directement à une couturière via la messagerie.",
    });
  }
}
