import { generateObject } from "ai";
import { providerRegistry } from "./providers.js";
import { z } from "zod";
import { getInput } from "@actions/core";

const modelName: string = getInput("model", { required: true });

export async function getAIResponse(systemPrompt: string, userPrompt: string) {
    const model = providerRegistry.languageModel(modelName);
    const response = await generateObject({
        model,
        output: "array",
        schema: z.object({
            lineNumber: z.number().describe("The line number of the code to review"),
            reviewComment: z.string().describe("The review comment for the code"),
        }),
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
    });
    return response.object;
}