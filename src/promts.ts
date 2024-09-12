import { Chunk, File } from "parse-diff";
import { PRDetails } from "./pr.js";

export const createSystemPrompt = (language: string): string => {
    return `
Your task is to review pull requests. Instructions:
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.
- Use ${language} language to write the comments.
`;
};

export const createUserPrompt = (file: File, chunk: Chunk, prDetails: PRDetails): string => {
    return `
Review the following code diff in the file "${
        file.to
    }" and take the pull request title and description into account when writing the response.

Pull request title: ${prDetails.title}
Pull request description:

---
${prDetails.description}
---

Git diff to review:

\`\`\`diff
${chunk.content}
${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
\`\`\`
`;
};
