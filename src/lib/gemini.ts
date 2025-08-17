import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
import PQueue from 'p-queue';

// Configuration for multiple API keys
const API_KEYS = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
  process.env.GEMINI_API_KEY_4!,
  process.env.GEMINI_API_KEY_5!,
  process.env.GEMINI_API_KEY_6!,
  process.env.GEMINI_API_KEY_7!,
  process.env.GEMINI_API_KEY_8!,
  process.env.GEMINI_API_KEY_9!,
  process.env.GEMINI_API_KEY_10!,
  // Add more keys as needed
  // process.env.GEMINI_API_KEY_3!,
].filter(key => key && key !== 'undefined');

if (API_KEYS.length === 0) {
  throw new Error('At least one GEMINI_API_KEY must be provided');
}

console.log(`Initialized with ${API_KEYS.length} API key(s)`);

// Create separate instances for each API key
const geminiInstances = API_KEYS.map(apiKey => ({
  genAI: new GoogleGenerativeAI(apiKey),
  dailyCount: 0,
  lastReset: new Date().toDateString(),
  isBlocked: false,
  blockUntil: null as Date | null
}));

// Create separate queues for each API key
// Aggressive settings for maximum speed
const queues = geminiInstances.map((_, index) => new PQueue({
  concurrency: 3,     // Process 3 requests simultaneously per key
  interval: 60000,    // 1 minute
  intervalCap: 30     // Use full 30 RPM limit
}));

// Round-robin or least-loaded key selection
let currentKeyIndex = 0;

function selectBestApiKey(): { index: number; instance: typeof geminiInstances[0] } | null {
  const now = new Date();
  
  // Reset daily counters if new day
  geminiInstances.forEach(instance => {
    const today = new Date().toDateString();
    if (today !== instance.lastReset) {
      instance.dailyCount = 0;
      instance.lastReset = today;
      instance.isBlocked = false;
      instance.blockUntil = null;
    }
  });

  // Find available keys (not blocked and under daily limit)
  const availableKeys = geminiInstances
    .map((instance, index) => ({ instance, index }))
    .filter(({ instance }) => {
      // Check if temporarily blocked
      if (instance.isBlocked && instance.blockUntil && now < instance.blockUntil) {
        return false;
      }
      // Reset block if time has passed
      if (instance.isBlocked && instance.blockUntil && now >= instance.blockUntil) {
        instance.isBlocked = false;
        instance.blockUntil = null;
      }
      // Check daily limit - more aggressive threshold
      return instance.dailyCount < 1480; // Higher threshold, only 20 request buffer
    });

  if (availableKeys.length === 0) {
    return null; // All keys exhausted
  }

  // Select least used key
  const selected = availableKeys.reduce((prev, current) => 
    prev.instance.dailyCount <= current.instance.dailyCount ? prev : current
  );

  return selected;
}

// Enhanced retry with multi-key awareness - optimized for speed
async function retryWithBackoff<T>(
  fn: (apiKey: string, genAI: GoogleGenerativeAI) => Promise<T>,
  maxRetries = 2, // Reduced retries for faster failure
  baseDelay = 1000 // Reduced base delay
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const selected = selectBestApiKey();
    
    if (!selected) {
      throw new Error('All API keys have reached their limits. Please wait or add more keys.');
    }

    const { index, instance } = selected;
    
    // Safety check to ensure the index is valid
    if (index < 0 || index >= API_KEYS.length || !API_KEYS[index]) {
      console.error(`Invalid API key index: ${index}, API_KEYS length: ${API_KEYS.length}`);
      continue; // Try with a different key
    }
    
    try {
      const result = await fn(API_KEYS[index], instance.genAI);
      instance.dailyCount++;
      return result;
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || 
                         error?.message?.includes('quota') ||
                         error?.message?.includes('rate limit') ||
                         error?.message?.includes('too many requests');
      
      if (isRateLimit) {
        // Block this specific key for shorter time
        instance.isBlocked = true;
        instance.blockUntil = new Date(Date.now() + (10 * 1000)); // Block for only 10 seconds
        console.log(`API key ${index + 1} hit rate limit, blocked for 10s`);
        
        // Try with different key immediately if available
        const alternateKey = selectBestApiKey();
        if (alternateKey) {
          continue; // Try again with different key
        }
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * attempt, 3000); // Cap at 3 seconds max
        console.log(`Attempt ${attempt} failed, waiting ${delay/1000}s before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retries exhausted');
}

// Queue task to least loaded queue
function addToLeastLoadedQueue<T>(task: () => Promise<T>): Promise<T> {
  const selected = selectBestApiKey();
  if (!selected) {
    throw new Error('No API keys available');
  }
  
  // Safety check to ensure the queue index is valid
  if (selected.index < 0 || selected.index >= queues.length || !queues[selected.index]) {
    throw new Error(`Invalid queue index: ${selected.index}, queues length: ${queues.length}`);
  }
  
  return queues[selected.index]!.add(task);
}

export const AisummariseCommit = async (diff: string): Promise<string> => {
  const truncatedDiff = diff.length > 6000 ? diff.slice(0, 6000) + '\n... (truncated)' : diff;
  
  try {
    return await addToLeastLoadedQueue(async () => {
      return retryWithBackoff(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const response = await model.generateContent([
          `You are an expert software engineer. Analyze this Git diff and provide a concise summary:

1. Summarize the overall purpose in 1 sentence.
2. List key changes by file (max 3 most important files).
3. Be concise - maximum 150 words total.

Diff:
\`\`\`diff
${truncatedDiff}
\`\`\`
`,
        ]);
        return response.response.text();
      });
    });
  } catch (error) {
    console.error('Failed to summarize commit:', error);
    return extractBasicDiffSummary(diff);
  }
};

export const detectBreakingChanges = async (diff: string, commitMessage: string): Promise<{
  hasBreakingChanges: boolean;
  severity: string | null;
  details: string | null;
  affectedComponents: string[] | null;
  migrationRequired: boolean;
  migrationSteps: string | null;
}> => {
  const truncatedDiff = diff.length > 8000 ? diff.slice(0, 8000) + '\n... (truncated)' : diff;
  
  try {
    return await addToLeastLoadedQueue(async () => {
      return retryWithBackoff(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const response = await model.generateContent([
          `You are an expert software engineer specializing in API design and breaking changes detection. Analyze this Git diff and commit message to determine if there are breaking changes.

Analyze the following:
1. API signature changes (function parameters, return types, class interfaces)
2. Database schema changes
3. Configuration file changes
4. Removed functionality
5. Changed behavior that could break existing code

Respond with a JSON object in this exact format:
{
  "hasBreakingChanges": boolean,
  "severity": "low" | "medium" | "high" | "critical" | null,
  "details": "Detailed description of breaking changes or null",
  "affectedComponents": ["component1", "component2"] or null,
  "migrationRequired": boolean,
  "migrationSteps": "Step-by-step migration guide or null"
}

Severity levels:
- "low": Minor changes that might cause warnings but not failures
- "medium": Changes that could break some integrations but are easily fixable
- "high": Significant changes that will break most integrations
- "critical": Major changes that require complete refactoring

Commit Message: ${commitMessage}

Diff:
\`\`\`diff
${truncatedDiff}
\`\`\`
`,
        ]);
        
        const text = response.response.text();
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            hasBreakingChanges: parsed.hasBreakingChanges || false,
            severity: parsed.severity || null,
            details: parsed.details || null,
            affectedComponents: parsed.affectedComponents || null,
            migrationRequired: parsed.migrationRequired || false,
            migrationSteps: parsed.migrationSteps || null,
          };
        }
        
        // Fallback if JSON parsing fails
        return {
          hasBreakingChanges: false,
          severity: null,
          details: null,
          affectedComponents: null,
          migrationRequired: false,
          migrationSteps: null,
        };
      });
    });
  } catch (error) {
    console.error('Failed to detect breaking changes:', error);
    return {
      hasBreakingChanges: false,
      severity: null,
      details: null,
      affectedComponents: null,
      migrationRequired: false,
      migrationSteps: null,
    };
  }
};

export async function summariseCode(doc: Document): Promise<string> {
  console.log("getting summary for", doc.metadata.source);
  
  const code = doc.pageContent.slice(0, 8000);
  
  try {
    return await addToLeastLoadedQueue(async () => {
      return retryWithBackoff(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const response = await model.generateContent([
          `Explain the purpose of this ${doc.metadata.source} file to a junior developer in exactly 50 words or less:

${code}
`,
        ]);
        return response.response.text();
      });
    });
  } catch (error) {
    console.error(`Failed to summarize code for ${doc.metadata.source}:`, error);
    return extractBasicCodeSummary(doc);
  }
}

export async function generateEmbedding(summary: string): Promise<number[] | null> {
  try {
    return await addToLeastLoadedQueue(async () => {
      return retryWithBackoff(async (apiKey, genAI) => {
        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await embedModel.embedContent(summary);
        return result.embedding.values;
      });
    });
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

// Fallback functions (unchanged)
function extractBasicDiffSummary(diff: string): string {
  const lines = diff.split('\n');
  const additions = lines.filter(line => line.startsWith('+')).length;
  const deletions = lines.filter(line => line.startsWith('-')).length;
  const files = Array.from(new Set(
    lines.filter(line => line.startsWith('+++') || line.startsWith('---'))
      .map(line => {
        const parts = line.split('\t');
        return parts[0] ? parts[0].replace(/^[\+\-]{3}\s*/, '') : '';
      })
      .filter(filename => filename) // Remove empty filenames
  ));
  
  return `Code changes detected: ${additions} additions, ${deletions} deletions across ${files.length} files. Modified files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`;
}

function extractBasicCodeSummary(doc: Document): string {
  const filename = doc.metadata.source;
  const content = doc.pageContent;
  const lines = content.split('\n').length;
  
  let fileType = 'file';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) fileType = 'JavaScript/TypeScript';
  else if (filename.endsWith('.py')) fileType = 'Python';
  else if (filename.endsWith('.java')) fileType = 'Java';
  else if (filename.endsWith('.cpp') || filename.endsWith('.c')) fileType = 'C/C++';
  else if (filename.endsWith('.html')) fileType = 'HTML';
  else if (filename.endsWith('.css')) fileType = 'CSS';
  
  return `${fileType} file with ${lines} lines. Unable to generate detailed summary due to rate limits.`;
}

// Enhanced monitoring functions
export function getMultiKeyStatus() {
  const now = new Date();
  return geminiInstances.map((instance, index) => ({
    keyIndex: index + 1,
    dailyUsage: `${instance.dailyCount}/1500`,
    usagePercentage: Math.round((instance.dailyCount / 1500) * 100),
    isBlocked: instance.isBlocked,
    blockUntil: instance.blockUntil,
    secondsUntilUnblock: instance.blockUntil ? Math.max(0, Math.ceil((instance.blockUntil.getTime() - now.getTime()) / 1000)) : 0,
    queuePending: queues[index]?.pending,
    queueSize: queues[index]?.size
  }));
}

export function getTotalCapacity() {
  const availableKeys = geminiInstances.filter(instance => 
    !instance.isBlocked && instance.dailyCount < 1400
  ).length;
  
  const totalDailyUsage = geminiInstances.reduce((sum, instance) => sum + instance.dailyCount, 0);
  const totalDailyLimit = geminiInstances.length * 1500;
  
  return {
    availableKeys,
    totalKeys: geminiInstances.length,
    totalDailyUsage,
    totalDailyLimit,
    overallUsagePercentage: Math.round((totalDailyUsage / totalDailyLimit) * 100),
    estimatedRequestsPerMinute: availableKeys * 30, // Full 30 RPM per available key
    maxConcurrentRequests: availableKeys * 3, // 3 concurrent per key
  };
}

export function pauseAllQueues() {
  queues.forEach((queue, index) => {
    queue.pause();
    console.log(`Queue ${index + 1} paused`);
  });
}

export function resumeAllQueues() {
  queues.forEach((queue, index) => {
    queue.start();
    console.log(`Queue ${index + 1} resumed`);
  });
}

// Add batch processing function for maximum speed
export async function batchSummarizeCommits(diffs: string[]): Promise<string[]> {
  console.log(`Processing ${diffs.length} commits in batch mode...`);
  
  // Process all diffs concurrently with automatic load balancing
  const promises = diffs.map(diff => AisummariseCommit(diff));
  return Promise.all(promises);
}

export async function batchSummarizeCode(docs: Document[]): Promise<string[]> {
  console.log(`Processing ${docs.length} files in batch mode...`);
  
  // Process all documents concurrently
  const promises = docs.map(doc => summariseCode(doc));
  return Promise.all(promises);
}

// Add fast-track function that skips queues for urgent requests
export async function fastTrackSummarize(content: string, type: 'commit' | 'code'): Promise<string> {
  const selected = selectBestApiKey();
  if (!selected) {
    throw new Error('No API keys available for fast-track processing');
  }

  try {
    const { instance } = selected;
    const model = instance.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    const prompt = type === 'commit' 
      ? `Quickly summarize this git diff in 1-2 sentences:\n${content.slice(0, 3000)}`
      : `What does this code file do? Answer in 1 sentence:\n${content.slice(0, 3000)}`;
    
    const response = await model.generateContent([prompt]);
    instance.dailyCount++;
    return response.response.text();
  } catch (error) {
    console.error('Fast-track failed:', error);
    return type === 'commit' 
      ? extractBasicDiffSummary(content)
      : `Code file analysis unavailable due to rate limits`;
  }
}