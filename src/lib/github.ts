import { Octokit } from 'octokit';
import { db } from '@/server/db';
import axios from 'axios';
import { AisummariseCommit, detectBreakingChanges } from './gemini';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = 'https://github.com/Parth-1104/git-inspect';

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split('/').slice(-2);
  if (!owner || !repo) {
    throw new Error('Invalid github Url');
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime()
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? ' ',
    commitAuthorName: commit.commit?.author?.name ?? ' ',
    commitAuthorAvatar: commit?.author?.avatar_url ?? ' ',
    commitDate: commit.commit?.author?.date ?? ' ',
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await FetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes
  );

  // Only select the latest 10 unprocessed commits for summarization
  const commitsToSummarize = unprocessedCommits.slice(0, 10);

  const commitAnalyses = await Promise.allSettled(
    commitsToSummarize.map(async (commit) => {
      return await analyzeCommit(githubUrl, commit.commitHash, commit.commitMessage);
    })
  );

  const commits = await db.commit.createMany({
    data: commitAnalyses.map((response, index) => {
      if (response.status === 'fulfilled') {
        const { summary, breakingChanges } = response.value;
        return {
          projectId: projectId,
          commitHash: commitsToSummarize[index]!.commitHash,
          commitMessage: commitsToSummarize[index]!.commitMessage,
          commitAuthorName: commitsToSummarize[index]!.commitAuthorName,
          commitAuthorAvatar: commitsToSummarize[index]!.commitAuthorAvatar,
          commitDate: commitsToSummarize[index]!.commitDate,
          summary: summary || ' ',
          hasBreakingChanges: breakingChanges.hasBreakingChanges,
          breakingChangeSeverity: breakingChanges.severity,
          breakingChangeDetails: breakingChanges.details,
          affectedComponents: breakingChanges.affectedComponents ? JSON.stringify(breakingChanges.affectedComponents) : null,
          migrationRequired: breakingChanges.migrationRequired,
          migrationSteps: breakingChanges.migrationSteps,
        };
      }
      // Fallback for failed analysis
      return {
        projectId: projectId,
        commitHash: commitsToSummarize[index]!.commitHash,
        commitMessage: commitsToSummarize[index]!.commitMessage,
        commitAuthorName: commitsToSummarize[index]!.commitAuthorName,
        commitAuthorAvatar: commitsToSummarize[index]!.commitAuthorAvatar,
        commitDate: commitsToSummarize[index]!.commitDate,
        summary: ' ',
        hasBreakingChanges: false,
        breakingChangeSeverity: null,
        breakingChangeDetails: null,
        affectedComponents: null,
        migrationRequired: false,
        migrationSteps: null,
      };
    }),
  });

  return commits;

  async function analyzeCommit(githubUrl: string, commitHash: string, commitMessage: string) {
    try {
      // Extract owner and repo from githubUrl
      const urlParts = githubUrl.split('/').slice(-2);
      const owner = urlParts[0];
      const repo = urlParts[1];
      
      if (!owner || !repo) {
        throw new Error('Invalid GitHub URL format');
      }
      
      // Use GitHub API to get commit details
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commitHash,
      });

      // Create a diff-like string from the commit data
      let diffContent = `Commit: ${commitData.commit.message}\n\n`;
      
      if (commitData.files) {
        for (const file of commitData.files) {
          diffContent += `diff --git a/${file.filename} b/${file.filename}\n`;
          diffContent += `--- a/${file.filename}\n`;
          diffContent += `+++ b/${file.filename}\n`;
          
          if (file.patch) {
            diffContent += file.patch + '\n';
          } else if (file.status === 'added') {
            diffContent += `+ New file added\n`;
          } else if (file.status === 'removed') {
            diffContent += `- File removed\n`;
          }
          diffContent += '\n';
        }
      }

      // Analyze both summary and breaking changes concurrently
      const [summary, breakingChanges] = await Promise.all([
        AisummariseCommit(diffContent),
        detectBreakingChanges(diffContent, commitMessage)
      ]);

      return {
        summary: summary || ' ',
        breakingChanges
      };
    } catch (error) { 
      console.error(`Error analyzing commit ${commitHash}:`, error);
      return {
        summary: ' ',
        breakingChanges: {
          hasBreakingChanges: false,
          severity: null,
          details: null,
          affectedComponents: null,
          migrationRequired: false,
          migrationSteps: null,
        }
      };
    }
  }

  async function FetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        githubUrl: true,
      },
    });
    if (!project?.githubUrl) {
      throw new Error('Project has no github Url');
    }

    return { project, githubUrl: project?.githubUrl };
  }
};

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[]
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash
      )
  );

  return unprocessedCommits;
}
