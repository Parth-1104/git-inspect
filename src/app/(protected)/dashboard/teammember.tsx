

'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembers = () => {
    const {projectId}=useProject()
    const {data:members}=api.project.getTeamMembers.useQuery({projectId})
  return (
    <div>{members?.map((member: { id: string; user: { id: string; createdAt: Date; updatedAt: Date; imageUrl: string | null; firstName: string | null; lastName: string | null; emailAddress: string; credits: number; } })=>(
        <img key={member.id} src={member.user.imageUrl || undefined} alt={member.user.firstName || 'User'} height={30} className='w-8 h-8 rounded-full'/>
          
          ))}</div>
  )
}

export default TeamMembers