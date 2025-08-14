---
id: index
title: Git-Inspect Docs
slug: /
---

---
id: index
title: Git-Inspect
slug: /
on this page
---

# Git-Inspect

**Transform your GitHub repository into an AI-queryable knowledge base**

Git-Inspect is a powerful developer tool that ingests your source code and commits, generates intelligent summaries with vector embeddings, and enables fast, context-grounded Q&A over your entire codebase. Perfect for team onboarding, project handovers, and understanding unfamiliar code sections.

## ✨ Key Benefits

- **Natural Language Queries**: Ask questions about your code in plain English and get answers grounded in real files and commits
- **Commit Intelligence**: Automatically summarize and track recent changes with digestible commit summaries  
- **Smart Prioritization**: Index critical files first with intelligent prioritization for faster setup
- **Context-Aware**: Vector embeddings ensure accurate, contextual responses to your questions

---

## 🚀 Quick Start

### Prerequisites

Before getting started, ensure you have:

- **Node.js** ≥ 20
- **npm** package manager
- **PostgreSQL** database (local Docker instance works fine)
- **GitHub Personal Access Token** with read access to your repositories
- **Google Gemini API key** for AI functionality
- **Clerk authentication keys** or configured Clerk project

### Environment Setup

Create a `.env` file in your Next.js app root directory (`git-inspect/`) with the following variables:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/git_inspect
GITHUB_TOKEN=ghp_your_github_personal_access_token
GEMINI_API_KEY_2=your_gemini_api_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Database Configuration

**1. Start PostgreSQL Database**

Use the provided helper script to start a local PostgreSQL instance:

```bash
./start-database.sh
```

**2. Apply Database Schema**

Install dependencies and set up the database schema:

```bash
npm install
npm run db:generate   # Runs prisma migrate dev
# Alternative: npm run db:push
```

### Launch the Application

Start the development server:

```bash
npm run dev
# Application will be available at http://localhost:3000
```

**Optional: Serve Documentation**

To serve documentation at `/docs` within the app:

```bash
npm run build:docs && npm run postbuild
# Copies static docs to public/docs for http://localhost:3000/docs
```

---

## 📖 Usage Guide

### 1. Create Project & Link Repository (UI)

- Navigate to `/create` in your browser
- Add your GitHub repository URL (e.g., `https://github.com/org/repo`)
- Access your dashboard at `/dashboard` to view recent commits and the Q&A panel

### 2. Preview Files for Indexing (Programmatic)

Before indexing, preview which files will be processed:

```typescript
import { previewFilesToProcess } from '@/lib/github-loader';

const preview = await previewFilesToProcess(
  'https://github.com/org/repo',
  process.env.GITHUB_TOKEN,
  30
);

console.log(preview);
/*
Returns:
{
  totalFiles: number,
  selectedFiles: Array<{
    path: string;
    size: number;
    preview: string;
  }>
}
*/
```

### 3. Index Repository (Programmatic)

Generate summaries and embeddings for prioritized files, storing them in PostgreSQL with pgvector:

```typescript
import { indexGithubRepo } from '@/lib/github-loader';

await indexGithubRepo(
  'your-project-id',
  'https://github.com/org/repo',
  process.env.GITHUB_TOKEN,
  { 
    maxFiles: 50, 
    batchSize: 5 
  }
);
```

### 4. Summarize Latest Commits (Programmatic)

Fetch and summarize recent commit diffs using Gemini:

```typescript
import { pollCommits } from '@/lib/github';

await pollCommits('your-project-id');
```

### 5. Query Your Codebase (UI)

Use the **"Ask a Question"** panel on your dashboard. The system:

1. **Embeds** your natural language question
2. **Searches** for the most similar code summaries using pgvector
3. **Streams** a contextual answer from Gemini based on retrieved information

---

## 🎯 Core Features

### 🤖 AI-Powered Q&A
- **Vector Search**: Embedding-backed retrieval over `SourceCodeEmbedding` with pgvector
- **Grounded Answers**: Responses based on real files and generated summaries
- **Context Awareness**: Maintains context across code relationships

### 🔍 Intelligent GitHub Integration
- **Smart Prioritization**: Focuses on important file types, root-level files, and READMEs
- **Noise Filtering**: Automatically skips large or irrelevant files (node_modules, build outputs, etc.)
- **Efficient Processing**: Optimized ingestion pipeline for faster indexing

### 📊 Commit Analysis
- **Automated Summaries**: Processes latest commits with human-friendly digests
- **Change Tracking**: Monitor repository evolution over time
- **Diff Intelligence**: Understands and explains code changes

### 👥 Multi-User Support
- **Authentication**: Clerk-based user authentication and session management
- **Project Isolation**: Multi-project, multi-user architecture
- **Secure Access**: Proper authorization controls

### 🛠️ Developer-Friendly APIs
- **Programmatic Control**: Full API access for preview, index, and summarize operations
- **Modern Stack**: Built with Next.js and Prisma for reliability
- **Extensible**: Easy to customize and extend functionality

---

## 🔗 Navigation & Resources

### Quick Links
- **[Create a Project](/create)** - Set up a new repository connection
- **[Dashboard & Q&A](/dashboard)** - Main interface for querying and insights
- **[Documentation](/docs)** - In-app static documentation

### Key Source Files
- **Database Schema**: `prisma/schema.prisma`
- **GitHub Integration**: `src/lib/github-loader.ts`
- **Commit Processing**: `src/lib/github.ts`
- **Q&A Engine**: `src/app/(protected)/dashboard/action.ts`
- **Database Helper**: `start-database.sh`

---

## 🚢 Build & Deployment

### Application Build

Prepare the application for production:

```bash
npm run build
```

### Documentation Build

Build and deploy documentation to be served at `/docs`:

```bash
npm run build:docs && npm run postbuild
```

This copies the static documentation files into the `public/docs` directory, making them available at `http://localhost:3000/docs` in production.

---

## 🤝 Getting Help

Git-Inspect makes complex codebases accessible through AI-powered insights. Whether you're onboarding new team members, conducting code reviews, or exploring unfamiliar code sections, Git-Inspect provides the context and understanding you need to work more efficiently.

Ready to get started? Head over to [Create a Project](/create) and connect your first repository!
