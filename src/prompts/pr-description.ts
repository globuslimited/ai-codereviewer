import { type File } from "parse-diff";
import { type PRDetails } from "../pr.js";
import { generateFileDiff } from "./helpers.js";

export const createSystemPrompt = (language: string): string => {
    return `
You are an expert software developer who has just made changes to a codebase. Your task is to write a clear and concise pull request description that effectively communicates the changes and their purpose.

Please analyze the provided diff and create a PR description that:

1. Clearly states what was changed in the code
2. Explains the purpose and motivation behind these changes
3. Highlights any important implementation details that reviewers should be aware of
4. Keeps the description concise yet informative
5. Uses professional and technical language appropriate for a development team
6. Focuses on the "what" and "why" of the changes

Important Guidelines:
- Be direct and to the point
- Avoid unnecessary technical details unless crucial for understanding
- Structure the description in a logical way
- Write in ${language} language
- Assume you are the author of these changes

The description should help reviewers quickly understand the scope and purpose of your changes while providing necessary context for effective code review.
`;
};

export const createUserPrompt = (files: File[], title: string): string => {
    return `
Here is the information about your pull request:
Pull request title: ${title}

Git diff to review:
${files.map(generateFileDiff).join("\n\n")}
`;
};
