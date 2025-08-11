'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const CommitLog = () => {
  const { projectId,project } = useProject()
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
          <div className='flex-auto rounded-mg bg-white p-3 ring-1 ring-inset ring-gray-200'>
            <div className='flex justify-between gap-x-4'>
              <Link target='_blank' href={`${project?.githubUrl}/commits/${commit.commitHash}`} className='py-0.5 text-xs loading-5 text-gray-500'>
              <span className='font-md text-gray-900'>{commit.commitAuthorName}</span>
              <span className='inline-flex items-center'>
                committed
                <ExternalLink className='ml-1 size-4'/>
              </span>
              </Link>

            </div>
            <span className='font-semibold'>
            {commit.commitMessage}
          </span>
          <pre className='mt-2 whitespace-pre-wrap text-em loading-6 text-gray-500'>
            {commit.summary}
          </pre>

          </div>
         
        </li>
      ))}
    </ul>
  )
}

export default CommitLog
