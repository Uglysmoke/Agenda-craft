
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MeetingAgenda } from "../types";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async generateAgenda(fileContent: string, fileName: string, fileType: string): Promise<MeetingAgenda> {
    const prompt = `
      Extract key information from the provided document and create a professional meeting agenda.
      Document Name: ${fileName}
      File Content: ${fileContent}

      The agenda should include:
      1. A clear title for the meeting.
      2. Identified stakeholders and their likely roles.
      3. A list of specific topics to cover.
      4. Realistic time allocations for each topic (duration in minutes).
      5. A brief summary/objective of the meeting.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            startTime: { type: Type.STRING, description: "Format HH:MM" },
            summary: { type: Type.STRING },
            stakeholders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING }
                },
                required: ["name", "role"]
              }
            },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  presenter: { type: Type.STRING }
                },
                required: ["title", "description", "durationMinutes", "presenter"]
              }
            }
          },
          required: ["title", "summary", "stakeholders", "topics", "startTime"]
        }
      }
    });

    return JSON.parse(response.text) as MeetingAgenda;
  }

  async chatWithDoc(query: string, context: string, history: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    const chat = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are an expert meeting assistant. Use the following meeting context to answer questions: ${context}. Be concise, professional, and helpful.`,
      },
    });

    // In a real scenario, we might want to pass the history here.
    // For this simple implementation, we'll just send the immediate message with context.
    const response = await chat.sendMessage({ message: query });
    return response.text;
  }
}

export const geminiService = new GeminiService();
