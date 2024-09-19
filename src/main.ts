import { getInput } from "@actions/core";
import parseDiff, { type File } from "parse-diff";
import { minimatch } from "minimatch";
import { createReviewComment, getPRDetails, type PRDetails, updatePRDescription } from "./pr.js";
import { getDiff } from "./diff.js";
import { createSystemPrompt, createUserPrompt } from "./promts.js";
import { getAIResponse } from "./ai.js";

const language = getInput("language", { required: false }) ?? "English";
const excludePatterns = getInput("exclude")
    .split(",")
    .map((s) => s.trim());

const analyzeCode = (parsedDiff: File[], prDetails: PRDetails) => {
    const systemPrompt = createSystemPrompt(language);
    const userPrompt = createUserPrompt(parsedDiff, prDetails);
    return getAIResponse(systemPrompt, userPrompt);
};

async function main() {
    const details = await getPRDetails();
    const { description, owner, repo, pull_number } = details;

    const diff = await getDiff(owner, repo, pull_number);

    const parsedDiff = parseDiff(diff);

    const filteredDiff = parsedDiff.filter((file) => {
        return !excludePatterns.some((pattern) => minimatch(file.to ?? "", pattern));
    });

    const { summary, comments } = await analyzeCode(filteredDiff, details);

    if (description.includes("pr-review:summary")) {
        await updatePRDescription(owner, repo, pull_number, description.replace("pr-review:summary", summary));
    }
    if (comments.length > 0) {
        await createReviewComment(owner, repo, pull_number, comments);
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
