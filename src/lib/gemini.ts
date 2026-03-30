import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const defaultApiKey = process.env.GEMINI_API_KEY;

if (!defaultApiKey) {
  console.warn(
    "GEMINI_API_KEY is not set in .env.local. Users will need to provide their own key."
  );
}

// Cache for default client
let defaultModel: GenerativeModel | null = null;

export function getModel(customApiKey?: string, customModel?: string): GenerativeModel {
  const apiKey = customApiKey || defaultApiKey;

  if (!apiKey) {
    throw new Error("No API key available. Please provide your own Gemini API key in Settings.");
  }

  const modelName = customModel || "gemini-2.5-flash";

  // Use cached default model if no custom key/model
  if (!customApiKey && !customModel && defaultModel) {
    return defaultModel;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Cache default
  if (!customApiKey && !customModel) {
    defaultModel = model;
  }

  return model;
}

// Keep backward compat export
export const model = defaultApiKey
  ? new GoogleGenerativeAI(defaultApiKey).getGenerativeModel({ model: "gemini-2.5-flash" })
  : (null as unknown as GenerativeModel);
