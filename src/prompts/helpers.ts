import { type Chunk, type File } from "parse-diff";

export const generateChunk = (chunk: Chunk) => {
    return `\`\`\`diff
${chunk.content}
${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
\`\`\``;
};

export const generateFileDiff = (file: File) => {
    return `
File: "${file.to}"
${file.chunks.map(generateChunk).join("\n\n")}
`;
};
