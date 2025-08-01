import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export const AisummariseCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert software engineer.

I will give you a Git diff of a commit.

Your task is to:
1. Summarize the overall purpose of the commit in 1–2 sentences.
2. List each file affected and describe:
  - Whether it was added, deleted, or modified.
  - What specifically changed inside (e.g., added a function, fixed a bug, updated component props, etc.).
3. Mention any new components, functions, or classes added and their purpose if applicable.

You should write the output in markdown format using bullet points and code style where needed.

Here's a reminder of how Git diffs work:
- File metadata lines look like:
  \`diff --git a/lib/index.js b/lib/index.js\`
  \`--- a/lib/index.js\`
  \`+++ b/lib/index.js\`
- New files show: \`new file mode 100644\`
- Deleted files show: \`deleted file mode\`
- \`@@ -12,6 +12,15 @@\` indicates the chunk of change
- Lines starting with '+' are additions
- Lines starting with '-' are deletions

Example summary:
- **Modified** \`lib/index.js\`: Raised the amount of returned recordings from \`10\` to \`100\`
- **Added** \`components/NewHeader.tsx\`: Introduced a new header component for responsive layout

Now analyze the following Git diff and provide a structured summary:

\`\`\`diff
${diff}
\`\`\`
`,
  ]);

  return response.response.text(); // NOTE: Gemini uses `response.response.text()` for output
};

// Example usage:
const run = async () => {
  const diff = `diff --git a/src/components/ui/MultistepLoader.tsx b/src/components/ui/MultistepLoader.tsx
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/components/ui/MultistepLoader.tsx
@@ -0,0 +1,146 @@
+ "use client";
+import { cn } from "../../utils/lib";
+import { AnimatePresence, motion } from "motion/react";
// ... (rest of your large patch text)
+export const MultiStepLoader = ({ ... }) => { ... };
`;

  const summary = await AisummariseCommit(diff);
  console.log(summary);
};

run().catch(console.error);
