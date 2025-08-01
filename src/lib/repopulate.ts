import { Octokit } from 'octokit'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// CHANGE THESE VALUES
const GITHUB_OWNER = 'Parth-1104'
const GITHUB_REPO = 'git-inspect'

async function main() {
  // Step 1: Create project manually
  const project = await prisma.project.create({
    data: {
      name: GITHUB_REPO,
      githubUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
    },
  })

  // Step 2: Get latest commits
  const { data: commitsData } = await octokit.rest.repos.listCommits({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    per_page: 20, // Change as needed
  })

  // Step 3: Prepare and insert commits
  const commits = await prisma.commit.createMany({
    data: commitsData.map((commit) => ({
      projectId: project.id,
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitAuthorName: commit.commit.author?.name || 'Unknown',
      commitAuthorAvatar: commit.author?.avatar_url || '',
      commitDate: new Date(commit.commit.author?.date || new Date()),
      summary: generateDummySummary(commit.commit.message),
    })),
  })

  console.log(`Inserted ${commits.count} commits.`)
}

// Dummy summarizer — replace with your real summary function
function generateDummySummary(message: string): string {
  return `Summary: ${message.substring(0, 50)}...`
}

main()
  .then(() => {
    console.log('✅ Database repopulated.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error populating DB:', err)
    process.exit(1)
  })
