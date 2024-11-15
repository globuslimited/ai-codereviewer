import { getInput } from "@actions/core";
import parseDiff, { type File } from "parse-diff";
import { minimatch } from "minimatch";
import { createReviewComment, getPRDetails, createComment, updatePRDescription } from "./pr.js";
import { getDiff } from "./diff.js";
import {
    createSystemPrompt as createCodeReviewSystemPrompt,
    createUserPrompt as createCodeReviewUserPrompt,
} from "./prompts/code-review.js";
import {
    createSystemPrompt as createPRDescriptionSystemPrompt,
    createUserPrompt as createPRDescriptionUserPrompt,
} from "./prompts/pr-description.js";
import { createAIReview, createPRDescription } from "./ai.js";

const language = getInput("language", { required: false }) ?? "English";
const excludePatterns = getInput("exclude")
    .split(",")
    .map((s) => s.trim());

const analyzeCode = (parsedDiff: File[], title: string, description: string) => {
    const systemPrompt = createCodeReviewSystemPrompt(language);
    const userPrompt = createCodeReviewUserPrompt(parsedDiff, title, description);
    return createAIReview(systemPrompt, userPrompt);
};

const describePR = async (parsedDiff: File[], title: string) => {
    const systemPrompt = createPRDescriptionSystemPrompt(language);
    const userPrompt = createPRDescriptionUserPrompt(parsedDiff, title);
    const description = await createPRDescription(systemPrompt, userPrompt);
    return `<!-- pr-review:summary:start -->\n${description}\n<!-- pr-review:summary:end -->`;
};

const { waitTill, waitEveryone } = (() => {
    const promises: Promise<any>[] = [];
    return {
        waitTill: (promise: Promise<any>) => {
            promises.push(promise);
        },
        waitEveryone: () => Promise.all(promises),
    };
})();

async function main() {
    const details = await getPRDetails();
    const { owner, repo, pull_number } = details;

    const diff = await getDiff(owner, repo, pull_number);

    const parsedDiff = parseDiff(diff);

    const filteredDiff = parsedDiff.filter((file) => {
        return !excludePatterns.some((pattern) => minimatch(file.to ?? "", pattern));
    });

    let description = details.description;

    if (description.includes("pr-review:summary")) {
        description = await describePR(filteredDiff, details.title);
        waitTill(updatePRDescription(owner, repo, pull_number, description.replace("pr-review:summary", description)));
    }

    const { summary, comments } = await analyzeCode(filteredDiff, details.title, description);

    if (comments.length > 0) {
        waitTill(createReviewComment(owner, repo, pull_number, comments));
    }
    if (summary) {
        waitTill(createComment(owner, repo, pull_number, summary));
    }

    await waitEveryone();
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
