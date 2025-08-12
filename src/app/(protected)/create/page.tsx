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
  const { register, handleSubmit, reset, watch } = useForm<FormInput>()
  const repoUrl = watch('repoUrl')
  const githubToken = watch('githubToken')

  const previewIndex = api.project.previewIndex.useMutation()
  const createProject = api.project.createProject.useMutation()

  // Animated console state
  const [messages, setMessages] = React.useState<string[]>([])
  const [progress, setProgress] = React.useState<number>(0)
  const [isAnimating, setIsAnimating] = React.useState<boolean>(false)

  // Kick off preview to seed filenames for nicer messages
  React.useEffect(() => {
    const shouldPreview = repoUrl && repoUrl.length > 8 && !previewIndex.isPending && !createProject.isPending
    if (!shouldPreview) return

    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await previewIndex.mutateAsync({ githubUrl: repoUrl.trim(), githubToken: githubToken?.trim() || undefined, maxFiles: 20 })
        const names = res.selectedFiles.map((f: { path: string }) => f.path).slice(0, 20)
        if (names.length) {
          setMessages(names.map((n: string) => `Getting summary for ${n}`))
        }
      } catch {}
    })()

    return () => controller.abort()
  }, [repoUrl, githubToken])

  // Lightweight animated ticker when we do not have names yet
  React.useEffect(() => {
    if (!createProject.isPending) return
    setIsAnimating(true)

    let idx = 0
    const fallback = [
      'Scanning repository…',
      'Finding important files…',
      'Getting summary for README…',
      'Generating embeddings…',
      'Saving insights…',
    ]

    const list = messages.length ? messages : fallback
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.max(2, Math.floor(100 / (list.length + 5)))))
      idx = (idx + 1) % list.length
      // rotate messages smoothly (always return string[])
      setMessages((prev) => {
        const base = prev.length ? prev : list
        const rotated = [...base.slice(idx), ...base.slice(0, idx)]
        return rotated
      })
    }, 900)

    return () => {
      clearInterval(interval)
      setIsAnimating(false)
    }
  }, [createProject.isPending, messages.length])

  function onSubmit(data: FormInput) {
    setMessages((m) => (m.length ? m : ['Starting…']))
    setProgress(0)

    createProject.mutate(
      {
        githubUrl: data.repoUrl.trim(),
        name: data.projectName.trim(),
        githubToken: data.githubToken?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Project created successfully')
          setProgress(100)
          refetch()
          reset()
          setTimeout(() => setMessages([]), 1200)
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create project')
          setIsAnimating(false)
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

        {/* Animated console */}
        { (createProject.isPending || isAnimating) && (
          <div className="mt-6 w-[520px] max-w-full rounded-lg border bg-black text-green-300 shadow-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-900 text-xs text-zinc-300 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live activity</span>
            </div>
            <div className="h-40 overflow-hidden">
              <ul className="h-full [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                {(messages.length ? messages : ['Preparing…']).map((msg) => (
                  <li key={msg} className="px-4 py-2 text-sm flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500/60 animate-ping [animation-duration:2s]" />
                    <span className="font-mono whitespace-nowrap truncate">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-2 bg-zinc-900">
              <div className="h-1.5 w-full rounded bg-green-500/20 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{Math.min(100, progress)}%</span>
                <span>{messages[0] ? messages[0] : 'Working…'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePage
