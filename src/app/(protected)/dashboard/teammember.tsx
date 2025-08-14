

'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembers = () => {
    const {projectId}=useProject()
    const {data:members}=api.project.getTeamMembers.useQuery({projectId})
  return (
    <div>{members?.map((member)=>(
        <img key={members.id} src={member.user.imageUrl} alt={member.user.firstName} height={30} className='w-8 h-8 rounded-full'/>
          
          ))}</div>
  )
}

export default TeamMembers