import { readFile } from "node:fs/promises";
import { octokit } from "./octokit.js";
import { type AIResponse } from "./ai.js";

export interface PRDetails {
    owner: string;
    repo: string;
    pull_number: number;
    title: string;
    description: string;
}

export async function getPRDetails(): Promise<PRDetails> {
    const { repository, number } = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH || "", "utf8"));
    const prResponse = await octokit.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
    });
    return {
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
        title: prResponse.data.title ?? "",
        description: prResponse.data.body ?? "",
    };
}

export async function createReviewComment(
    owner: string,
    repo: string,
    pull_number: number,
    comments: AIResponse["comments"],
) {
    const event = comments.some(({ severity }) => severity === "critical") ? "REQUEST_CHANGES" : "COMMENT";
    return octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        comments: comments.map(({ file, lineNumber, reviewComment, severity }) => ({
            body: `[${severity}] ${reviewComment}`,
            path: file,
            line: lineNumber,
        })),
        event,
    });
}

export const updatePRDescription = async (owner: string, repo: string, pull_number: number, description: string) => {
    return octokit.pulls.update({
        owner,
        repo,
        pull_number,
        body: description,
    });
};

export const createComment = async (owner: string, repo: string, pull_number: number, comment: string) => {
    return octokit.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: comment,
    });
};
