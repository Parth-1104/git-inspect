import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
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


export async function summariseCode(doc:Document)
{
 console.log("getting summary for",doc.metadata.source);

 try{
  const code=doc.pageContent.slice(0,10000);
 const response=await model.generateContent([
  `You are a intelligent software engineer who swpecilize in onboarding junior software engineeer in project `,
  `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
  Here is the code:
  ---
  ${code}

  ---

  Give a summary no more than 100 words of the code above 
  `,
 ]);
 return response.response.text()

 }
 catch(error)
 {
  return ' '
 }
 
}


export async function generateEmbedding(summary:string)
{
  const model=genAI.getGenerativeModel({
    model:'text-embedding-004'
  })
  const result=await model.embedContent(summary)
  const embedding=result.embedding
  return embedding.values

}

console.log(await generateEmbedding("hellow world"))