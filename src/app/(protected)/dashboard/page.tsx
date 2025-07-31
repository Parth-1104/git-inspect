'use client'
import useProject from '@/hooks/use-project'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {

    const {project}=useProject()
  return (
    <div>

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
        <div className='grid-cols-1 gap-4 sm:grid-cols-5'>
          Ask que
          meeting
        </div>
      </div>

      <div className="mt-8">
        Commit log
      </div>
    </div>

  )
}

export default page