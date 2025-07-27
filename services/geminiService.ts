
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateBlogPostContent = async (topic: string): Promise<string> => {
    if (!API_KEY) return "Gemini API key not configured. Please add it to your environment variables.";
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a comprehensive, engaging, and well-structured blog post about "${topic}". The post should be in markdown format. It should include headings, paragraphs, and lists where appropriate. Do not include a main title heading as that will be a separate field.`,
            config: {
                temperature: 0.7,
                topP: 0.95,
            }
        });
        return response.text || "Failed to generate content.";
    } catch (error) {
        console.error("Error generating blog post content:", error);
        return "Failed to generate blog content. Please check the console for details.";
    }
};

// AI image generation removed - now using Supabase Storage for image management

export const generateSEOMetadata = async (content: string): Promise<{ seoTitle: string; seoDescription: string }> => {
    if (!API_KEY) return { seoTitle: "", seoDescription: "" };
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following blog post content, generate an SEO-optimized title (max 60 characters) and a meta description (max 160 characters). Return the result as a JSON object with keys "seoTitle" and "seoDescription".\n\nContent:\n${content}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        seoTitle: { type: Type.STRING },
                        seoDescription: { type: Type.STRING },
                    }
                }
            },
        });

        const jsonString = response.text?.trim() || "";
        const metadata = JSON.parse(jsonString);
        return metadata;

    } catch (error) {
        console.error("Error generating SEO metadata:", error);
        return { seoTitle: "", seoDescription: "Failed to generate SEO description." };
    }
};
