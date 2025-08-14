'use client'
import useProject from '@/hooks/use-project'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const page = () => {
    const { projectId, project } = useProject()
    const { refetch: refetchCommits } = api.project.getCommits.useQuery({ projectId })
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

  return (
    <div>
      {/* {project?.id ?? 'No project selected'} */}

      <div className='flex item-center justify-between flex-wrap gap-y-4'>
        {/* githublink */}
        <div className='w-fit rounded-md bg-primary px-4 py-3'>
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
          Team Member
          Inviter
        </div>
      </div>
      <div className="mt-4">
        <div className=' grid grid-cols-2 gap-4 sm:grid-cols-2'>
          <AskQuestionCard/>
         
        </div>
      </div>

      <div className="mt-8 border-t-2 border-primary pt-6 rounded-none flex justify-end">
        <Button 
            onClick={handleFetchNewCommits} 
            disabled={pollCommitsMutation.isPending || !projectId}
        >
            {pollCommitsMutation.isPending ? 'Fetching...' : 'Fetch New Commits'}
        </Button>
      </div>
      <div className="mt-8 border-t-2 border-primary pt-6 rounded-none">
       <CommitLog/>
      </div>
    </div>

  )
}

export default page