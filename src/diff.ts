import { readFile } from "fs/promises";
import { octokit } from "./octokit.js";
import { PullRequestEvent } from "@octokit/webhooks-types";

export async function getDiff(owner: string, repo: string, pull_number: number): Promise<string | null> {
    const eventData: PullRequestEvent = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH ?? "", "utf8"));

    if (eventData.action === "opened") {
        const response = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
            mediaType: { format: "diff" },
        });
        console.log("pull request diff", response.data);
        return response.data as unknown as string;
    } else if (eventData.action === "synchronize") {
        const newBaseSha = eventData.before;
        const newHeadSha = eventData.after;

        const response = await octokit.repos.compareCommits({
            headers: {
                accept: "application/vnd.github.v3.diff",
            },
            owner,
            repo,
            base: newBaseSha,
            head: newHeadSha,
        });

        return String(response.data);
    } else {
        console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
        return null;
    }
}
