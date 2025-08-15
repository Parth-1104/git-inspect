'use client'
import useProject from '@/hooks/use-project'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github, Loader2 } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import ArchiveButton from './archive-button'
// import InviteButton from './invitebutton'
const InviteButton=dynamic(()=> import('./invitebutton'),{ssr:false})
import TeamMembers from './teammember'
import dynamic from 'next/dynamic'

// Loading component for better UX
const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-64 bg-gray-200 rounded-md"></div>
  </div>
)

const page = () => {
    const { projectId, project, projects } = useProject()
    const { refetch: refetchCommits } = api.project.getCommits.useQuery({ projectId }, {
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
    const pollCommitsMutation = api.project.pollNewCommits.useMutation()

    const handleFetchNewCommits = async () => {
        if (!projectId) {
            toast.error('No project selected.')
            return
        }
        try {
            await pollCommitsMutation.mutateAsync({ projectId })
            toast.success('New commits fetched successfully!')
            refetchCommits()
        } catch (error) {
            console.error('Error fetching new commits:', error)
            toast.error('Failed to fetch new commits.')
        }
    }

    // Show loading state while projects are loading
    if (!projects) {
        return <DashboardSkeleton />
    }

    // Show message if no project is selected
    if (!projectId || !project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">No Project Selected</h2>
                <p className="text-muted-foreground mb-6">
                    Please select a project to view your dashboard.
                </p>
                {projects.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Available projects:</p>
                        {projects.map((p) => (
                            <div key={p.id} className="text-sm">
                                {p.name} - {p.githubUrl}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

  return (
    <div>
      <div className='flex item-center justify-between flex-wrap gap-y-4'>
        {/* githublink */}
        <div className='w-fit rounded-md bg-black px-4 py-3'>
          <div className="flex item-center">
          <Github className='size-5 text-white'/>
          <div className='m-2'>
            <p className='text-sm font-medium text-white'>
              Linked to {' '}
              <Link href={project?.githubUrl ?? ''} className='inline-flex item-center text-white/80 hover:underline '>
              {project?.githubUrl}
              <ExternalLink className='ml-1 size-4'/>
              </Link>
            </p>
          </div>
          </div>
          
        </div>

        <div className="h-4"></div>
        <div className="flex item-center gap-4">
          <TeamMembers/>
          <ArchiveButton/>
          <InviteButton/>
          
        </div>
      </div>
      <div className="mt-4">
        <div className=' grid grid-cols-2 gap-4 sm:grid-cols-2'>
          <Suspense fallback={<div className="h-32 bg-gray-100 rounded-md animate-pulse"></div>}>
            <AskQuestionCard/>
          </Suspense>
         
        </div>
      </div>

      <div className="mt-8 border-t-2 border-primary pt-6 rounded-none flex justify-end">
        <Button 
            onClick={handleFetchNewCommits} 
            disabled={pollCommitsMutation.isPending || !projectId} className='bg-red text-white'
         >
            {pollCommitsMutation.isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                </>
            ) : (
                'Fetch New Commits'
            )}
        </Button>
      </div>
      <div className="mt-8 border-t-2 border-primary pt-6 rounded-none">
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-md animate-pulse"></div>}>
          <CommitLog/>
        </Suspense>
      </div>
    </div>

  )
}

export default page