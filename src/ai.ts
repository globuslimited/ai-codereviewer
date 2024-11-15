import { generateObject } from "ai";
import { getModel } from "./providers.js";
import { z } from "zod";
import { getInput } from "@actions/core";

const modelName: string = getInput("model", { required: true });

const schema = z.object({
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

export async function getAIResponse(systemPrompt: string, userPrompt: string) {
    const model = getModel(modelName);
    console.log("userPrompt", userPrompt);
    const response = await generateObject({
        model,
        schema,
        system: systemPrompt,
        prompt: userPrompt,
    });
    console.log("response", response);
    return response.object;
}

export type AIResponse = z.infer<typeof schema>;
