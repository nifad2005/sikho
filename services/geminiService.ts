
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added RoadmapTopic to the import to resolve the 'Cannot find name' error.
import { LearningMaterial, RoadmapModule, LearningContent, MCQ, ChatMessage, RoadmapTopic } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatMaterialsForPrompt(materials: LearningMaterial[]): string {
  return materials.map(m => {
    switch(m.type) {
      case 'topic':
        return `The user wants to learn about: "${m.content}".`;
      case 'text':
        return `The user provided the following text:\n---\n${m.content}\n---`;
      case 'file':
        return `The user uploaded a file named "${m.content}". Its content is provided as inline data.`;
      default:
        return '';
    }
  }).join('\n\n');
}

export const generateRoadmap = async (materials: LearningMaterial[], knowledgeLevel: string): Promise<RoadmapModule[]> => {
  const prompt = `You are an expert curriculum designer. Based on the provided learning materials and the user's self-assessed knowledge level, create a comprehensive, step-by-step learning roadmap. The roadmap should be broken down into logical modules, and each module should contain several focused topics. For each topic, provide a brief, one-sentence description.

User's Knowledge Level: "${knowledgeLevel}". Please tailor the depth and complexity of the roadmap accordingly. For a "Beginner", start with fundamental concepts. For an "Intermediate" user, assume some prior knowledge. For an "Advanced" user, focus on more complex, nuanced topics.

Learning Materials:
${formatMaterialsForPrompt(materials)}

Respond ONLY with a valid JSON array that adheres to the provided schema. Do not include any introductory text or markdown formatting.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The title of the module." },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "The title of the topic." },
                    description: { type: Type.STRING, description: "A short, one-sentence description of the topic." }
                  },
                  required: ["title", "description"]
                }
              }
            },
            required: ["title", "topics"]
          }
        },
      }
    });

    const jsonText = response.text.trim();
    // FIX: Corrected the type for the API response. The original type `Omit<RoadmapTopic, 'completed'>[][]` 
    // did not match the structure of an array of roadmap modules.
    const roadmapData: (Omit<RoadmapModule, 'topics'> & { topics: Omit<RoadmapTopic, 'completed'>[] })[] = JSON.parse(jsonText);
    
    // Add the 'completed' property to each topic
    return roadmapData.map((module: any) => ({
        ...module,
        topics: module.topics.map((topic: any) => ({
            ...topic,
            completed: false
        }))
    }));

  } catch (error) {
    console.error("Gemini API Error (generateRoadmap):", error);
    throw new Error("Failed to generate a learning roadmap from the AI. Please check the provided materials and try again.");
  }
};


export const generateLearningContent = async (topicTitle: string, materials: LearningMaterial[]): Promise<LearningContent> => {
    const prompt = `You are an expert educator. Your task is to generate detailed learning content for a specific topic, using the provided context materials.

Context Materials:
${formatMaterialsForPrompt(materials)}

Current Topic to Explain: "${topicTitle}"

Please provide a clear, in-depth explanation of the topic. Also, provide at least two distinct and helpful examples to illustrate the concept. Format your response as a JSON object with 'explanation' and 'examples' keys.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanation: { type: Type.STRING, description: "A detailed explanation of the topic." },
                        examples: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of strings, each containing a relevant example."
                        }
                    },
                    required: ["explanation", "examples"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error (generateLearningContent):", error);
        throw new Error(`Failed to generate content for "${topicTitle}".`);
    }
};

export const generateMCQs = async (topicTitle: string, materials: LearningMaterial[]): Promise<MCQ[]> => {
    const prompt = `You are a quiz generation expert. Based on the provided context materials and the specific topic, create a set of 5 multiple-choice questions to test understanding.

Context Materials:
${formatMaterialsForPrompt(materials)}

Topic for Quiz: "${topicTitle}"

For each question, provide one correct answer and three plausible but incorrect distractors. The options should be shuffled. Respond with a JSON array of question objects.
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER }
                        },
                        required: ["question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error (generateMCQs):", error);
        throw new Error(`Failed to generate a quiz for "${topicTitle}".`);
    }
};

export const answerDoubt = async (doubt: string, history: ChatMessage[], materials: LearningMaterial[], topicTitle: string): Promise<string> => {
    const chatHistory = history.map(msg => `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.text}`).join('\n');
    
    const prompt = `You are a friendly and knowledgeable teaching assistant. A student has a question related to their learning materials. Help them by providing a clear and concise answer.

Learning Materials Context:
${formatMaterialsForPrompt(materials)}

Current Topic Context: The student is currently studying "${topicTitle}".

Conversation History:
${chatHistory}

Student's new question: "${doubt}"

Your task is to answer the student's new question based on all the context provided. Be helpful and encouraging.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API Error (answerDoubt):", error);
        throw new Error("Failed to get an answer from the AI assistant.");
    }
};