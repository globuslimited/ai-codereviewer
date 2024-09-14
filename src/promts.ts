import { Chunk, File } from "parse-diff";
import { PRDetails } from "./pr.js";

export const createSystemPrompt = (language: string): string => {
    return `
Your task is to review pull requests. Instructions:
- Do not give positive comments or compliments. Do not give useless advices to make sure on something or check something, only give suggestions if there is something that can be improved significantly.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.
- Use ${language} language to write the comments.
`;
};

const generateChunk = (chunk: Chunk) => {
    return `\`\`\`diff
${chunk.content}
${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
\`\`\``;
};

const generateFileDiff = (file: File) => {
    return `
File: "${file.to}"
${file.chunks.map(generateChunk).join("\n\n")}
`;
};

export const createUserPrompt = (files: File[], prDetails: PRDetails): string => {
    return `Review the following code diff and take the pull request title and description into account when writing the response.

Pull request title: ${prDetails.title}
Pull request description:

---
${prDetails.description}
---

Git diff to review:
${files.map(generateFileDiff).join("\n\n")}
`;
};
