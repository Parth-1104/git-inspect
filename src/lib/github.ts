import { Octokit } from 'octokit';
import { db } from '@/server/db';
import axios from 'axios';
import { AisummariseCommit } from './gemini';

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

  const summaryResponses = await Promise.allSettled(
    commitsToSummarize.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    })
  );

  const summaries = summaryResponses.map((response) => {
    if (response.status === 'fulfilled') {
      return response.value as string;
    }
    return ' ';
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: commitsToSummarize[index]!.commitHash,
        commitMessage: commitsToSummarize[index]!.commitMessage,
        commitAuthorName: commitsToSummarize[index]!.commitAuthorName,
        commitAuthorAvatar: commitsToSummarize[index]!.commitAuthorAvatar,
        commitDate: commitsToSummarize[index]!.commitDate,
        summary,
      };
    }),
  });

  return commits;

  async function summariseCommit(githubUrl: string, commitHash: string) {
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

      const summary = await AisummariseCommit(diffContent);
      return summary || ' ';
    } catch (error) { 
      console.error(`Error summarizing commit ${commitHash}:`, error);
      return ' ';
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
