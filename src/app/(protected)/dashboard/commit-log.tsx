'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const CommitLog = () => {
  const { projectId, project } = useProject()
  const { data: commits } = api.project.getCommits.useQuery({ projectId })

  if (!commits) return <div>Loading commits...</div>
  if (commits.length === 0) return <div>No commits found.</div>

  return (
    <ul className="space-y-4">
      {commits.map((commit) => (
        <li key={commit.id} className="relative">
          <div className="rounded-md border border-primary bg-black p-4">
            <div className="flex items-center gap-2">
              <img
                src={commit.commitAuthorAvatar}
                alt={`${commit.commitAuthorName}'s avatar`}
                className="size-7 rounded-full bg-muted/20"
              />
              <Link
                target="_blank"
                href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                className="text-xs leading-5 text-muted-foreground hover:underline"
              >
                <span className="font-medium text-foreground">{commit.commitAuthorName}</span>
                <span className="inline-flex items-center ml-2">
                  committed
                  <ExternalLink className="ml-1 size-4" />
                </span>
              </Link>
            </div>
            <div className="mt-2 font-semibold text-foreground">{commit.commitMessage}</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{commit.summary}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CommitLog
