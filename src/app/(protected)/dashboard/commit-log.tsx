'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import Link from 'next/link'
import { ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const CommitLog = () => {
  const { projectId, project } = useProject()
  const { data: commits } = api.project.getCommits.useQuery({ projectId })

  if (!commits) return <div>Loading commits...</div>
  if (commits.length === 0) return <div>No commits found.</div>

  return (
    <ul className="space-y-4">
      {commits.map((commit) => (
        <li key={commit.id} className="relative">
          <div className={`rounded-md border p-4 ${
            commit.hasBreakingChanges 
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' 
              : 'border-primary bg-black'
          }`}>
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
              
              {/* Breaking Changes Indicators */}
              {commit.hasBreakingChanges && (
                <div className="flex items-center gap-2 ml-auto">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Badge 
                    variant={
                      commit.breakingChangeSeverity === 'critical' ? 'destructive' :
                      commit.breakingChangeSeverity === 'high' ? 'destructive' :
                      commit.breakingChangeSeverity === 'medium' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {commit.breakingChangeSeverity || 'unknown'}
                  </Badge>
                  {commit.migrationRequired && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Migration
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-2 font-semibold text-foreground">{commit.commitMessage}</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {commit.summary}
            </div>
            
            {/* Breaking Changes Details */}
            {commit.hasBreakingChanges && commit.breakingChangeDetails && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm text-red-800 dark:text-red-200">
                    Breaking Changes Detected
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  {commit.breakingChangeDetails}
                </p>
                
                {commit.affectedComponents && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                      Affected Components:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(commit.affectedComponents).map((component: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {commit.migrationSteps && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                      View Migration Steps
                    </summary>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                      <pre className="whitespace-pre-wrap text-xs text-red-700 dark:text-red-300">
                        {commit.migrationSteps}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CommitLog
