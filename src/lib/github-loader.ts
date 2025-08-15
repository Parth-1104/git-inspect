import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { summariseCode, generateEmbedding } from './gemini';
import { db } from '@/server/db';

// File extensions to prioritize for summarization
const IMPORTANT_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.rs', '.go',
  '.php', '.rb', '.swift', '.kt', '.scala', '.cs', '.vue', '.svelte'
];

const CONFIG_EXTENSIONS = ['.json', '.yaml', '.yml', '.toml', '.ini', '.env'];
const IGNORE_EXTENSIONS = ['.lock', '.log', '.tmp', '.cache', '.git'];

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

// Filter and prioritize documents
function filterAndPrioritizeDocs(docs: Document[], maxFiles: number = 50): Document[] {
  // Filter out unwanted files
  const filtered = docs.filter(doc => {
    const fileName = doc.metadata.source.toLowerCase();
    
    // Skip if file is too large (>50KB)
    if (doc.pageContent.length > 50000) return false;
    
    // Skip ignored extensions
    if (IGNORE_EXTENSIONS.some(ext => fileName.includes(ext))) return false;
    
    // Skip common unimportant files
    if (fileName.includes('node_modules/') || 
        fileName.includes('.git/') ||
        fileName.includes('dist/') ||
        fileName.includes('build/')) return false;
    
    return true;
  });

  // Prioritize files by importance
  const prioritized = filtered.sort((a, b) => {
    const aFile = a.metadata.source.toLowerCase();
    const bFile = b.metadata.source.toLowerCase();
    
    // Priority 1: Important code files
    const aIsImportant = IMPORTANT_EXTENSIONS.some(ext => aFile.endsWith(ext));
    const bIsImportant = IMPORTANT_EXTENSIONS.some(ext => bFile.endsWith(ext));
    if (aIsImportant && !bIsImportant) return -1;
    if (!aIsImportant && bIsImportant) return 1;
    
    // Priority 2: Root level files
    const aDepth = aFile.split('/').length;
    const bDepth = bFile.split('/').length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    
    // Priority 3: README and main files
    if (aFile.includes('readme') || aFile.includes('index') || aFile.includes('main')) return -1;
    if (bFile.includes('readme') || bFile.includes('index') || bFile.includes('main')) return 1;
    
    return 0;
  });

  return prioritized.slice(0, maxFiles);
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const token = githubToken || process.env.GITHUB_TOKEN;
  const branch = await getDefaultBranch(githubUrl);
  
  const options: any = {
    branch,
    ignoreFiles: [
      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
      '*.lock', '*.log', '.DS_Store', 'Thumbs.db', '*.tmp', '*.cache'
    ],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 2, // Reduced concurrency
  };
  
  if (token?.trim()) {
    options.accessToken = token.trim();
  }
  
  const loader = new GithubRepoLoader(githubUrl, options);
  return loader.load();
};

// Process files in small batches with delays
const generateEmbeddings = async (docs: Document[], batchSize: number = 5) => {
  const results: Array<{
    summary: string;
    embedding: number[];
    sourceCode: string;
    fileName: string;
  }> = [];
  
  console.log(`Processing ${docs.length} files in batches of ${batchSize}`);
  
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(docs.length/batchSize)}`);
    
    try {
      const batchResults = await Promise.all(
        batch.map(async (doc) => {
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
      
      // Filter out results with null embeddings
      const validResults = batchResults.filter((result): result is { summary: string; embedding: number[]; sourceCode: string; fileName: string } => 
        result.embedding !== null
      );
      results.push(...validResults);
      
      // Wait between batches (respecting free tier: 15 requests/minute)
      if (i + batchSize < docs.length) {
        const delayMs = 30000; // 30 seconds between batches
        console.log(`Waiting ${delayMs/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      // Continue with next batch instead of failing completely
    }
  }
  
  return results;
};

export const indexGithubRepo = async (
  projectId: string, 
  githubUrl: string, 
  githubToken?: string,
  options: { maxFiles?: number; batchSize?: number } = {}
) => {
  const { maxFiles = 30, batchSize = 5 } = options; // Reduced defaults for free tier
  
  console.log(`Loading GitHub repository: ${githubUrl}`);
  const docs = await loadGithubRepo(githubUrl, githubToken);
  
  console.log(`Found ${docs.length} files, filtering and prioritizing...`);
  const filteredDocs = filterAndPrioritizeDocs(docs, maxFiles);
  console.log(`Processing ${filteredDocs.length} prioritized files`);
  
  const allEmbeddings = await generateEmbeddings(filteredDocs, batchSize);
  
  console.log('Saving to database...');
  const results = await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`Saving ${index + 1} of ${allEmbeddings.length}`);
      if (!embedding) return;
      
      try {
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
          },
        });
        
        // Fix the database query - convert embedding array to proper format
        const embeddingVector = `[${embedding.embedding.join(',')}]`;
        
        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embeddingVector}::vector
          WHERE "id" = ${sourceCodeEmbedding.id}
        `;
        
        return sourceCodeEmbedding;
      } catch (error) {
        console.error(`Failed to save embedding for ${embedding.fileName}:`, error);
        return null;
      }
    })
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Successfully processed ${successful}/${allEmbeddings.length} files`);
  
  return {
    totalFiles: docs.length,
    processedFiles: filteredDocs.length,
    successfulEmbeddings: successful,
    failedEmbeddings: allEmbeddings.length - successful
  };
};

// Utility function to preview which files would be processed
export const previewFilesToProcess = async (githubUrl: string, githubToken?: string, maxFiles: number = 30) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const filtered = filterAndPrioritizeDocs(docs, maxFiles);
  
  return {
    totalFiles: docs.length,
    selectedFiles: filtered.map(doc => ({
      path: doc.metadata.source,
      size: doc.pageContent.length,
      preview: doc.pageContent.slice(0, 100) + '...'
    }))
  };
};