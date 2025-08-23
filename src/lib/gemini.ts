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
].filter(key => key && key !== 'undefined');

if (API_KEYS.length === 0) {
  throw new Error('At least one GEMINI_API_KEY must be provided');
}

console.log(`🚀 Initialized with ${API_KEYS.length} API key(s) for maximum performance`);

// Enhanced API key management with circuit breaker pattern
interface ApiKeyState {
  genAI: GoogleGenerativeAI;
  dailyCount: number;
  minuteCount: number;
  lastReset: string;
  lastMinuteReset: number;
  isBlocked: boolean;
  blockUntil: Date | null;
  consecutiveErrors: number;
  lastSuccessTime: number;
  avgResponseTime: number;
  totalRequests: number;
}

const geminiInstances: ApiKeyState[] = API_KEYS.map(apiKey => ({
  genAI: new GoogleGenerativeAI(apiKey),
  dailyCount: 0,
  minuteCount: 0,
  lastReset: new Date().toDateString(),
  lastMinuteReset: Date.now(),
  isBlocked: false,
  blockUntil: null,
  consecutiveErrors: 0,
  lastSuccessTime: Date.now(),
  avgResponseTime: 1000,
  totalRequests: 0
}));

// ENHANCED: Optimized queues respecting 30 RPM quota per API key
const queues = geminiInstances.map((_, index) => new PQueue({
  concurrency: 5,     // Balanced concurrency for 30 RPM limit
  interval: 60000,    // 1 minute window
  intervalCap: 25     // Conservative 25/30 RPM to avoid rate limits
}));

// Smart load balancer with performance tracking
function selectOptimalApiKey(): { index: number; instance: ApiKeyState } | null {
  const now = Date.now();
  const today = new Date().toDateString();
  
  // Reset counters
  geminiInstances.forEach(instance => {
    if (today !== instance.lastReset) {
      instance.dailyCount = 0;
      instance.lastReset = today;
    }
    if (now - instance.lastMinuteReset >= 60000) {
      instance.minuteCount = 0;
      instance.lastMinuteReset = now;
    }
    // Auto-recovery from blocks
    if (instance.isBlocked && instance.blockUntil && now >= instance.blockUntil.getTime()) {
      instance.isBlocked = false;
      instance.blockUntil = null;
      instance.consecutiveErrors = 0;
    }
  });

  // Find healthy keys
  const healthyKeys = geminiInstances
    .map((instance, index) => ({ instance, index }))
    .filter(({ instance }) => {
      if (instance.isBlocked) return false;
      if (instance.dailyCount >= 1450) return false; // Conservative daily limit (97% of 1500)
      if (instance.minuteCount >= 25) return false; // Conservative minute limit (83% of 30)
      if (instance.consecutiveErrors >= 3) return false; // Circuit breaker
      return true;
    });

  if (healthyKeys.length === 0) return null;

  // Select best performing key (lowest response time + lowest load)
  const selected = healthyKeys.reduce((best, current) => {
    const bestScore = (best.instance.minuteCount * 1000) + best.instance.avgResponseTime;
    const currentScore = (current.instance.minuteCount * 1000) + current.instance.avgResponseTime;
    return currentScore < bestScore ? current : best;
  });

  return selected;
}

// Ultra-fast retry with intelligent fallback
async function smartRetry<T>(
  fn: (apiKey: string, genAI: GoogleGenerativeAI) => Promise<T>,
  maxRetries = 3,
  baseDelay = 500 // Very fast retry
): Promise<T> {
  const startTime = Date.now();
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const selected = selectOptimalApiKey();
    
    if (!selected) {
      // Emergency fallback - try any non-blocked key
      const emergencyKey = geminiInstances.find(instance => !instance.isBlocked);
      if (!emergencyKey) {
        throw new Error('All API keys exhausted. Consider adding more keys or wait for reset.');
      }
      const index = geminiInstances.indexOf(emergencyKey);
      console.warn(`⚠️  Emergency fallback to key ${index + 1}`);
      try {
        const result = await fn(API_KEYS[index], emergencyKey.genAI);
        emergencyKey.dailyCount++;
        emergencyKey.minuteCount++;
        return result;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    const { index, instance } = selected;
    const requestStart = Date.now();
    
    try {
      const result = await fn(API_KEYS[index], instance.genAI);
      
      // Update success metrics
      const responseTime = Date.now() - requestStart;
      instance.avgResponseTime = (instance.avgResponseTime * 0.7) + (responseTime * 0.3);
      instance.dailyCount++;
      instance.minuteCount++;
      instance.totalRequests++;
      instance.lastSuccessTime = Date.now();
      instance.consecutiveErrors = 0;
      
      return result;
      
    } catch (error: any) {
      lastError = error;
      instance.consecutiveErrors++;
      
      const isRateLimit = error?.status === 429 || 
                         error?.message?.toLowerCase().includes('quota') ||
                         error?.message?.toLowerCase().includes('rate limit') ||
                         error?.message?.toLowerCase().includes('too many requests');
      
      const isServerError = error?.status >= 500;
      
      if (isRateLimit) {
        // Immediate block with exponential backoff
        instance.isBlocked = true;
        instance.blockUntil = new Date(Date.now() + (Math.pow(2, attempt) * 5000));
        console.log(`⚡ Key ${index + 1} rate limited, blocked for ${Math.pow(2, attempt) * 5}s`);
      } else if (isServerError) {
        // Brief block for server errors
        instance.isBlocked = true;
        instance.blockUntil = new Date(Date.now() + 2000);
        console.log(`🔥 Key ${index + 1} server error, brief block`);
      }
      
      // Fast retry with different key
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * attempt, 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`💥 All retries failed after ${Date.now() - startTime}ms`);
  throw lastError || new Error('All retries exhausted');
}

// ENHANCED: Smart queue assignment with parallel load balancing
function addToOptimalQueue<T>(task: () => Promise<T>): Promise<T> {
  const selected = selectOptimalApiKey();
  if (!selected) {
    // Fallback to least busy queue
    const leastBusyIndex = queues.reduce((minIdx, queue, idx) => 
      queue.size < queues[minIdx].size ? idx : minIdx, 0);
    return queues[leastBusyIndex].add(task);
  }
  
  return queues[selected.index].add(task);
}

// ENHANCED: Parallel processing wrapper respecting API quotas
async function processInParallel<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrency = Math.min(API_KEYS.length * 3, 20) // Respect 30 RPM limit across keys
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const semaphore = new PQueue({ concurrency: maxConcurrency });
  
  const promises = tasks.map((task, index) =>
    semaphore.add(async () => {
      const result = await task();
      results[index] = result;
      return result;
    })
  );
  
  await Promise.all(promises);
  return results;
}

// Optimized main functions with better prompts
export const AisummariseCommit = async (diff: string): Promise<string> => {
  const truncatedDiff = diff.length > 8000 ? diff.slice(0, 8000) + '\n... (truncated)' : diff;
  
  try {
    return await addToOptimalQueue(async () => {
      return smartRetry(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-lite',
          generationConfig: {
            temperature: 0.1, // More focused responses
            maxOutputTokens: 200, // Limit output for speed
          }
        });
        
        const response = await model.generateContent([
          `Analyze this Git diff and provide a detailed  summary of the changes and the impact of the changes on the codebase:

FORMAT: [TYPE] description | Key files: file1, file2 | Impact: detaile 3 line  impact
KEY Changes or Addition: describe the changes or additions in the codebase
TYPES: feat, fix, refactor, docs, style, test, chore, perf, build, ci, revert, security, other

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
  const truncatedDiff = diff.length > 10000 ? diff.slice(0, 10000) + '\n... (truncated)' : diff;
  
  try {
    return await addToOptimalQueue(async () => {
      return smartRetry(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-lite',
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 500,
          }
        });
        
        const response = await model.generateContent([
          `Analyze for breaking changes. Return ONLY valid JSON:

{
  "hasBreakingChanges": boolean,
  "severity": "low"|"medium"|"high"|"critical"|null,
  "details": "specific description or null",
  "affectedComponents": ["comp1","comp2"] or null,
  "migrationRequired": boolean,
  "migrationSteps": "steps or null"
}

Breaking change indicators:
- Removed/renamed public APIs
- Changed function signatures
- Modified database schemas
- Removed config options
- Changed return types

Commit: ${commitMessage}

Diff:
\`\`\`diff
${truncatedDiff}
\`\`\`
`,
        ]);
        
        const text = response.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid JSON response');
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
  console.log("📝 Summarizing", doc.metadata.source);
  
  const code = doc.pageContent.slice(0, 6000); // Reduced for speed
  
  try {
    return await addToOptimalQueue(async () => {
      return smartRetry(async (apiKey, genAI) => {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-lite',
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          }
        });
        
        const response = await model.generateContent([
          `Explain ${doc.metadata.source} in exactly 40 words or less. Focus on PURPOSE and KEY FUNCTIONALITY:

${code}
`,
        ]);
        return response.response.text();
      });
    });
  } catch (error) {
    console.error(`Failed to summarize ${doc.metadata.source}:`, error);
    return extractBasicCodeSummary(doc);
  }
}

export async function generateEmbedding(summary: string): Promise<number[] | null> {
  try {
    return await addToOptimalQueue(async () => {
      return smartRetry(async (apiKey, genAI) => {
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

// ENHANCED: Optimized parallel batch processing respecting quotas
export async function batchSummarizeCommits(diffs: string[]): Promise<string[]> {
  console.log(`🚄 Parallel batch processing ${diffs.length} commits...`);
  
  // ENHANCED: Batch size respecting 30 RPM per key
  const batchSize = Math.min(20, API_KEYS.length * 3); // Conservative batching
  const results: string[] = [];
  
  for (let i = 0; i < diffs.length; i += batchSize) {
    const batch = diffs.slice(i, i + batchSize);
    
    // ENHANCED: Process entire batch in parallel with quota limits
    const batchTasks = batch.map(diff => () => AisummariseCommit(diff));
    const batchResults = await processInParallel(batchTasks, Math.min(API_KEYS.length * 2, 15));
    
    results.push(...batchResults);
    
    // Appropriate pause to respect rate limits
    if (i + batchSize < diffs.length) {
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s between batches
    }
  }
  
  return results;
}

export async function batchSummarizeCode(docs: Document[]): Promise<string[]> {
  console.log(`📚 Parallel batch processing ${docs.length} files...`);
  
  // ENHANCED: Batch size respecting API quotas
  const batchSize = Math.min(15, API_KEYS.length * 2);
  const results: string[] = [];
  
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    
    // ENHANCED: Process entire batch in parallel with quota limits
    const batchTasks = batch.map(doc => () => summariseCode(doc));
    const batchResults = await processInParallel(batchTasks, Math.min(API_KEYS.length * 2, 12));
    
    results.push(...batchResults);
    
    if (i + batchSize < docs.length) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3s between batches
    }
  }
  
  return results;
}

// ENHANCED: Parallel processing for commits respecting API quotas
export async function batchProcessCommitsParallel(
  commits: Array<{ diff: string; commitMessage: string }>
): Promise<Array<{ summary: string; breakingChanges: any }>> {
  console.log(`⚡ Parallel processing ${commits.length} commits with breaking changes detection...`);
  
  const tasks = commits.map(({ diff, commitMessage }) => async () => {
    // Process summary and breaking changes in parallel for each commit
    const [summary, breakingChanges] = await Promise.all([
      AisummariseCommit(diff),
      detectBreakingChanges(diff, commitMessage)
    ]);
    
    return { summary, breakingChanges };
  });
  
  // Process with respect to API quotas (30 RPM per key)
  return await processInParallel(tasks, Math.min(API_KEYS.length * 2, 10));
}

// Lightning-fast priority processing
export async function priorityProcess(content: string, type: 'commit' | 'code'): Promise<string> {
  const selected = selectOptimalApiKey();
  if (!selected) {
    throw new Error('No API keys available for priority processing');
  }

  try {
    const { instance } = selected;
    const model = instance.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 50,
      }
    });
    
    const prompt = type === 'commit' 
      ? `One sentence summary: ${content.slice(0, 2000)}`
      : `What does this code do in 10 words: ${content.slice(0, 2000)}`;
    
    const response = await model.generateContent([prompt]);
    instance.dailyCount++;
    instance.minuteCount++;
    return response.response.text();
  } catch (error) {
    console.error('Priority processing failed:', error);
    return type === 'commit' 
      ? extractBasicDiffSummary(content)
      : 'Code analysis unavailable';
  }
}

// Enhanced monitoring and status
export function getDetailedStatus() {
  const now = Date.now();
  return geminiInstances.map((instance, index) => ({
    keyIndex: index + 1,
    health: instance.consecutiveErrors === 0 ? 'healthy' : 
           instance.consecutiveErrors < 3 ? 'degraded' : 'unhealthy',
    dailyUsage: `${instance.dailyCount}/1500`,
    minuteUsage: `${instance.minuteCount}/30`,
    usagePercentage: Math.round((instance.dailyCount / 1500) * 100),
    isBlocked: instance.isBlocked,
    blockTimeRemaining: instance.blockUntil ? 
      Math.max(0, Math.ceil((instance.blockUntil.getTime() - now) / 1000)) : 0,
    avgResponseTime: `${Math.round(instance.avgResponseTime)}ms`,
    consecutiveErrors: instance.consecutiveErrors,
    queueSize: queues[index]?.size || 0,
    queuePending: queues[index]?.pending || 0
  }));
}

export function getSystemPerformance() {
  const availableKeys = geminiInstances.filter(instance => 
    !instance.isBlocked && instance.dailyCount < 1400 && instance.consecutiveErrors < 3
  ).length;
  
  const totalDailyUsage = geminiInstances.reduce((sum, instance) => sum + instance.dailyCount, 0);
  const totalRequests = geminiInstances.reduce((sum, instance) => sum + instance.totalRequests, 0);
  const avgResponseTime = geminiInstances.reduce((sum, instance) => sum + instance.avgResponseTime, 0) / geminiInstances.length;
  
  return {
    status: availableKeys > 0 ? 'operational' : 'degraded',
    availableKeys,
    totalKeys: geminiInstances.length,
    totalDailyUsage,
    totalDailyLimit: geminiInstances.length * 1500,
    totalRequests,
    avgResponseTime: Math.round(avgResponseTime),
    maxThroughput: availableKeys * 30, // 30 RPM per key (actual quota)
    maxConcurrency: availableKeys * 5, // 5 concurrent per key (respecting quotas)
    efficiency: Math.round((totalRequests / Math.max(totalDailyUsage, 1)) * 100)
  };
}

// Emergency controls
export function emergencyReset() {
  geminiInstances.forEach(instance => {
    instance.isBlocked = false;
    instance.blockUntil = null;
    instance.consecutiveErrors = 0;
  });
  queues.forEach(queue => queue.start());
  console.log('🆘 Emergency reset completed');
}

export function throttleSystem(percentage: number) {
  const throttledConcurrency = Math.max(1, Math.floor(5 * (percentage / 100))); // Updated for quota limits
  queues.forEach(queue => {
    queue.concurrency = throttledConcurrency;
  });
  console.log(`🐌 System throttled to ${percentage}% (concurrency: ${throttledConcurrency})`);
}

// Fallback functions (optimized)
function extractBasicDiffSummary(diff: string): string {
  const lines = diff.split('\n');
  const additions = lines.filter(line => line.startsWith('+')).length;
  const deletions = lines.filter(line => line.startsWith('-')).length;
  
  const filePattern = /^[\+\-]{3}\s+(.+)$/;
  const files = Array.from(new Set(
    lines.filter(line => filePattern.test(line))
      .map(line => {
        const match = line.match(filePattern);
        return match ? match[1].split('\t')[0] : '';
      })
      .filter(filename => filename && !filename.startsWith('/dev/null'))
  ));
  
  return `[AUTO] Changes: +${additions}/-${deletions} in ${files.length} files: ${files.slice(0, 2).join(', ')}${files.length > 2 ? '...' : ''}`;
}

function extractBasicCodeSummary(doc: Document): string {
  const filename = doc.metadata.source;
  const content = doc.pageContent;
  const lines = content.split('\n').length;
  
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'js': 'JavaScript', 'ts': 'TypeScript', 'py': 'Python', 
    'java': 'Java', 'cpp': 'C++', 'c': 'C', 'html': 'HTML',
    'css': 'CSS', 'json': 'Config', 'yml': 'Config', 'yaml': 'Config'
  };
  
  const fileType = typeMap[ext] || 'Code';
  return `${fileType} file (${lines} lines) - Analysis unavailable due to rate limits`;
}