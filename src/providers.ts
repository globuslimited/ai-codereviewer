import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export const providers = {
    openai,
    anthropic,
    google,
};

const modelRegex = new RegExp(`^(?<provider>${Object.keys(providers).join("|")}):(?<model>.+)$`);
export const getModel = (modelName: string) => {
    const match = modelName.match(modelRegex);
    if (!match) {
        throw new Error(`Invalid model name: ${modelName}`);
    }
    const { provider, model } = match.groups as {
        provider: keyof typeof providers;
        model: string;
    };
    return providers[provider].languageModel(model, {
        structuredOutputs: true,
    });
};
