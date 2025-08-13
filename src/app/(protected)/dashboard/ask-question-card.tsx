'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import React, { useState } from 'react'
import { askQuestion } from './action'
import { readStreamableValue } from 'ai/rsc'

const AskQuestionCard = () => {
    const { project } = useProject()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState('')
    const [filesReferences, setFileReferences] = useState<{fileName: string; sourceCode: string; summary: string}[]>([])
    const [answer, setAnswer] = useState('')

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!project?.id) return 
        
        setLoading(true)
        setOpen(true)
        setAnswer('') // Reset answer before starting

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
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-lg font-semibold pr-8">
                            {question}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {loading ? (
                            <div className="flex items-center space-x-2 py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                <span className="text-gray-600">Processing your question...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {answer && (
                                    <div className="prose prose-sm max-w-none">
                                        <div 
                                            className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                                            style={{
                                                fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                                            }}
                                        >
                                            {answer}
                                        </div>
                                    </div>
                                )}
                                
                                {!loading && !answer && (
                                    <div className="text-gray-500 text-center py-8">
                                        No response generated yet...
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {filesReferences.length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                    📁 Referenced Files ({filesReferences.length})
                                </h3>
                                <div className="grid gap-3">
                                    {filesReferences.map((file, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="font-mono text-sm font-medium text-blue-600 mb-1">
                                                {file.fileName}
                                            </div>
                                            {file.summary && (
                                                <div className="text-xs text-gray-600 line-clamp-2">
                                                    {file.summary}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                        <Textarea 
                            placeholder='Which file should I edit to change the home page?' 
                            value={question} 
                            onChange={e => setQuestion(e.target.value)}
                            disabled={loading}
                            className="min-h-[100px] resize-none"
                            rows={4}
                        />
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
                                <>🚀 Ask Git_Inspect</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard