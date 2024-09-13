import { readFileSync } from "fs";
import { getInput } from "@actions/core";
import parseDiff, { Chunk, File } from "parse-diff";
import { minimatch } from "minimatch";
import { createReviewComment, getPRDetails, PRDetails } from "./pr.js";
import { getDiff } from "./diff.js";
import { createSystemPrompt, createUserPrompt } from "./promts.js";
import { octokit } from "./octokit.js";
import { AIResponse, getAIResponse } from "./ai.js";

const language = getInput("language", { required: false }) ?? "English";

const analyzeCode = async (
    parsedDiff: File[],
    prDetails: PRDetails,
): Promise<Array<{ body: string; path: string; line: number }>> => {
    const systemPrompt = createSystemPrompt(language);
    const userPrompt = createUserPrompt(parsedDiff, prDetails);
    const aiComments = await getAIResponse(systemPrompt, userPrompt);
    return aiComments.map(({ file, lineNumber, reviewComment }) => ({
        body: reviewComment,
        path: file,
        line: lineNumber,
    }));
};

async function main() {
    const prDetails = await getPRDetails();

    const diff = await getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number);

    console.log("diff", diff);

    const parsedDiff = parseDiff(diff);

    const excludePatterns = getInput("exclude")
        .split(",")
        .map((s) => s.trim());

    const filteredDiff = parsedDiff.filter((file) => {
        return !excludePatterns.some((pattern) => minimatch(file.to ?? "", pattern));
    });

    const comments = await analyzeCode(filteredDiff, prDetails);
    if (comments.length > 0) {
        await createReviewComment(prDetails.owner, prDetails.repo, prDetails.pull_number, comments);
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
