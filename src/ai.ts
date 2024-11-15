import { generateObject, generateText } from "ai";
import { getModel } from "./providers.js";
import { z } from "zod";
import { getInput } from "@actions/core";

const modelName: string = getInput("model", { required: true });

const aiReviewSchema = z.object({
    summary: z.string().describe("A summary of the code review"),
    comments: z.array(
        z.object({
            file: z.string().describe("The file path of the code to review"),
            lineNumber: z.number().describe("The line number of the code to review"),
            reviewComment: z.string().describe("The review comment for the code"),
            severity: z.enum(["minor", "major", "critical"]).describe("Severity level of the problem"),
        }),
    ),
});

export async function createAIReview(systemPrompt: string, userPrompt: string) {
    const model = getModel(modelName);
    console.log("userPrompt", userPrompt);
    const response = await generateObject({
        model,
        schema: aiReviewSchema,
        system: systemPrompt,
        prompt: userPrompt,
    });
    console.log("response", response);
    return response.object;
}

export const createPRDescription = async (systemPrompt: string, userPrompt: string) => {
    const model = getModel(modelName);
    const response = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
    });
    return response.text;
};

export type AIReviewResponse = z.infer<typeof aiReviewSchema>;
