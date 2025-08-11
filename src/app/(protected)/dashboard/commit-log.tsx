'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const CommitLog = () => {
  const { projectId, project } = useProject()
  const { data: commits, isLoading, isError } = api.project.getCommits.useQuery({ projectId })

  // Skeleton UI
  if (isLoading) {
    return (
      <ul className="space-y-6 animate-pulse">
        {Array.from({ length: 5 }).map((_, idx) => (
          <li key={idx} className="relative flex gap-x-4">
            <div className="absolute left-0 top-0 w-px bg-zinc-200 h-full" />
            <div className="relative mt-4 size-8 rounded-full bg-gray-300 blur-sm" />
            <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
              <div className="flex justify-between gap-x-4 mb-2">
                <div className="h-3 w-32 bg-gray-300 rounded blur-sm" />
                <div className="h-3 w-16 bg-gray-300 rounded blur-sm" />
              </div>
              <div className="h-4 w-48 bg-gray-300 rounded blur-sm mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-300 rounded blur-sm" />
                <div className="h-3 w-3/4 bg-gray-300 rounded blur-sm" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  // Show "No commits" only if error (e.g., repo not found/private)
  if (isError) {
    return <div className="text-gray-500">No commits found. Repository might be private or invalid.</div>
  }

  return (
    <ul className="space-y-6">
      {commits?.map((commit, commitIdx) => (
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
          <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
            <div className="flex justify-between gap-x-4">
              <Link
                target="_blank"
                href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                className="py-0.5 text-xs leading-5 text-gray-500"
              >
                <span className="font-medium text-gray-900">
                  {commit.commitAuthorName}
                </span>
                <span className="inline-flex items-center">
                  committed
                  <ExternalLink className="ml-1 size-4" />
                </span>
              </Link>
            </div>
            <span className="font-semibold">{commit.commitMessage}</span>
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
              {commit.summary}
            </pre>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CommitLog
