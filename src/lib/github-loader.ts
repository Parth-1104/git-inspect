import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';

async function getDefaultBranch(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const [_, owner, repo] = match;
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
    maxConcurrency: 5
  };

  if (token && token.trim() !== '') {
    options.accessToken = token.trim();
  }

  const loader = new GithubRepoLoader(githubUrl, options);
  return await loader.load();
};

// Test with a random public repo
console.log(await loadGithubRepo('https://github.com/sindresorhus/awesome'));

// Document {
//     pageContent: "# Media\n\n## Logo\n\n- Primary color: `#fc60a8`\n- Secondary color: `#494368`\n- Font: [`Orbitron`](https://fonts.google.com/specimen/Orbitron)\n\nYou are free to use and modify the logo for your Awesome list or other usage.\n",
//     metadata: {
//       source: "media/readme.md",
//       repository: "https://github.com/sindresorhus/awesome",
//       branch: "main",
//     },
//     id: undefined,