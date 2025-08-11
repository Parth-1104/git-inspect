'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const CreatePage = () => {
  const refetch = useRefetch()
  const { register, handleSubmit, reset } = useForm<FormInput>()
  const createProject = api.project.createProject.useMutation()

  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        githubUrl: data.repoUrl.trim(),
        name: data.projectName.trim(),
        githubToken: data.githubToken?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Project created successfully')
          refetch()
          reset()
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create project')
        },
      }
    )
  }

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <div>
        <h1 className="font-semibold text-2xl">Link your GitHub Repository</h1>
        <p className="text-gray-600 mb-4">Enter the URL of your repository</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            {...register('projectName', { required: true })}
            placeholder="Project Name"
          />
          <Input
            {...register('repoUrl', { required: true })}
            placeholder="Repository URL"
            type="url"
          />
          <Input
            {...register('githubToken')}
            placeholder="GitHub Token (Optional)"
          />

          <Button type="submit" disabled={createProject.isPending} className="w-full">
            {createProject.isPending && (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            Create Project
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CreatePage
