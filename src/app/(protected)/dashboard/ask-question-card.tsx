'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import React, { useState } from 'react'
import { askQuestion } from './action'
import { readStreamableValue } from 'ai/rsc'
import MDEditor from '@uiw/react-md-editor'
import Codereferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

// Blinking placeholder component
const BlinkingPlaceholder = ({ text }: { text: string }) => (
  <span className="inline-block animate-pulse text-muted-foreground/60">
    {text}
  </span>
)

const AskQuestionCard = () => {
  const { project } = useProject()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [filesReferences, setFileReferences] = useState<{fileName: string; sourceCode: string; summary: string}[]>([])
  const [answer, setAnswer] = useState('')
  const saveAnswer = api.project.saveAnswer.useMutation()
  const refetch = useRefetch()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!project?.id) return
    setLoading(true)
    setOpen(true)
    setAnswer('') // Reset answer before starting
    setFileReferences([]) // Reset file references

    try {
      const { output, filesReferences } = await askQuestion(question, project.id)
      setFileReferences(filesReferences)
      
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer(ans => ans + delta)
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error)
      setAnswer('Sorry, there was an error processing your question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAnswer = () => {
    if (!project?.id || !answer.trim()) return
    
    saveAnswer.mutate({
      projectId: project.id,
      question,
      answer,
      filesReferences
    }, {
      onSuccess: () => {
        toast.success('Answer Saved')
        refetch()
      },
      onError: () => {
        toast.error('Failed to save answer')
      }
    })
  }

  const handleClose = () => {
    setOpen(false)
    // Reset state when closing
    setTimeout(() => {
      setAnswer('')
      setFileReferences([])
    }, 200)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl sm:max-w-[80vw] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {question}
              </DialogTitle>
              {answer && !loading && (
                <Button 
                  disabled={saveAnswer.isPending} 
                  variant={'outline'} 
                  onClick={handleSaveAnswer}
                  size="sm"
                >
                  {saveAnswer.isPending ? 'Saving...' : 'Save Answer'}
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading ? (
              <div className="flex items-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Processing your question...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {answer && (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="whitespace-pre-wrap text-foreground leading-relaxed"
                      style={{
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                      }}
                    >
                      <MDEditor.Markdown source={answer} className='max-w-[89vw] h-full max-h-[40vh] overflow-scroll'/>
                    </div>
                  </div>
                )}
                
                {!loading && !answer && (
                  <div className="text-muted-foreground text-center py-8">
                    No response generated yet...
                  </div>
                )}
              </div>
            )}
            
            {/* Code References Component - Always visible when data exists */}
            {filesReferences.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  📁 Referenced Files ({filesReferences.length})
                </h3>
                <Codereferences 
                  fileReferences={filesReferences.map(file => ({
                    filename: file.fileName,
                    sourceCode: file.sourceCode,
                    summary: file.summary
                  }))} 
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className='relative col-span-2'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖 Ask a Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder=""
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={loading}
                className="min-h-[100px] resize-none"
                rows={4}
              />
              {!question && (
                <div className="absolute top-2 left-3 pointer-events-none text-muted-foreground/60">
                  <BlinkingPlaceholder text="Which file should I edit to change the home page?" />
                </div>
              )}
            </div>
            <Button
              type='submit'
              disabled={loading || !question.trim()}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>Ask Git Inspect</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard