'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput={
    repoUrl:string
    projectName:string
    githubToken?:string
}

const CreatePage = () => {
    const {register,handleSubmit,reset}=useForm<FormInput>()
    const createProject=api.project.createProject.useMutation()
    function onSubmit(data:FormInput)
    {
        createProject.mutate({
            githubUrl:data.repoUrl,
            name:data.projectName,
            githubToken:data.githubToken
        },
    {
        onSuccess:()=>{
            toast.success('Project created Successfully')
            reset()
        },
        onError:()=>{
            toast.success('failed to create')
        }
    })
    }

  return (
    <div className='flex item-center gap-12 h-full justify-center'>
        {/* <img></img> */}
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your Github Repository
                </h1>
                <p>
                    Enter the Url of your repo 
                </p>
            </div>
            <div className='h-4'></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input 
                    {...register('projectName',{ required:true })}
                        placeholder='ProjectName'

                    />
                    <div className='h-2'></div>
                    <Input 
                    {...register('repoUrl',{ required:true })}
                        placeholder='Repository Url'
                        type='url'

                    />
                    <div className='h-2'></div>
                    <Input 
                    {...register('githubToken')}
                        placeholder='Github Token (Optional)'

                    />
                    <div className="h-2"></div>
                    <Button type='submit' disabled={createProject.isPending}>Create Project</Button>

                </form>
            </div>

            </div>
        </div>

  )
}

export default CreatePage