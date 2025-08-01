'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'

const CommitLog = () => {
  const { projectId } = useProject()
  const { data: commits } = api.project.getCommits.useQuery({ projectId })

  if (!commits) return <div>Loading commits...</div>
  if (commits.length === 0) return <div>No commits found.</div>

  return (
    <ul className="space-y-6">
      {commits.map((commit, commitIdx) => (
        <li key={commit.id} className="relative flex gap-x-4">
          <div
            className={cn(
              'absolute left-0 top-0 w-px bg-zinc-200',
              commitIdx === commits.length - 1 ? 'h-6' : 'h-full'
            )}
          />
          <img
            src={commit.commitAuthorAvatar}
            alt={`${commit.commitAuthorName}'s avatar`}
            className="relative mt-4 size-8 rounded-full bg-zinc-100"
          />
        </li>
      ))}
    </ul>
  )
}

export default CommitLog
