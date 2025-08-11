import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { summariseCode, generateEmbedding } from './gemini';
import { db } from '@/server/db'; // <-- Ensure correct Prisma import

async function getDefaultBranch(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Failed to fetch repo info: ${res.statusText}`);

  const data = await res.json();
  return data.default_branch;
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const token = githubToken || process.env.GITHUB_TOKEN;
  const branch = await getDefaultBranch(githubUrl);

  const options: any = {
    branch,
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5,
  };

  if (token?.trim()) {
    options.accessToken = token.trim();
  }

  const loader = new GithubRepoLoader(githubUrl, options);
  return loader.load();
};

const generateEmbeddings = async (docs: Document[]) => {
  return Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);
      return {
        summary,
        embedding,
        sourceCode: doc.pageContent,
        fileName: doc.metadata.source,
      };
    })
  );
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`Processing ${index + 1} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.SourceCodeEmbedding.create({
        // ⚠️ Ensure this matches your actual Prisma model name
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRawUnsafe(`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = $1::vector
        WHERE "id" = $2
      `, embedding.embedding, sourceCodeEmbedding.id);
    })
  );
};

// Example test
// (async () => {
//   console.log(await loadGithubRepo('https://github.com/sindresorhus/awesome'));
// })();
