
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedProfile, MatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseResume = async (resumeText: string): Promise<ParsedProfile> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following resume text and extract skills, experience, education, and a brief professional summary. Output strictly in JSON format.\n\nResume Text: ${resumeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                institution: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "skills", "experience", "education"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const matchJobAndResume = async (jobDescription: string, resumeText: string): Promise<MatchResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the match between this Job Description and this Resume. Provide a match score (0-100), a detailed analysis of why they match or don't, and a list of key missing skills. Output strictly in JSON format.\n\nJob Description: ${jobDescription}\n\nResume: ${resumeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "analysis", "missingSkills"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
