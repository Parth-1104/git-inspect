'use client'
import React, { useState } from 'react'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import Codereferences from '@/app/(protected)/dashboard/code-references'

const QAPage = () => {
  const { projectId } = useProject()
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })
  const [questionIndex, setQuestionIndex] = useState(0)
  const question = questions?.[questionIndex]

  return (
    <Sheet>
      <AskQuestionCard />
      <div className='h-4'></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className='flex items-center gap-4 bg-white rounded-lg p-4 shadow border'>
                  <img 
                    className='rounded-full' 
                    height={30} 
                    width={30} 
                    src={question.user.imageUrl ?? ""} 
                    alt="User avatar"
                  />
                  <div className='text-left flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                        {question.question}
                      </p>
                      <span>
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className='text-gray-500 line-clamp-1 text-sm'>
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          )
        })}
      </div>

      {question && (
        <SheetContent className='sm:max-w-[80vw] flex flex-col'>
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="text-left">
              {question.question}
            </SheetTitle>
          </SheetHeader>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Answer Section */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Answer:</h3>
                <MDEditor.Markdown 
                  source={question.answer} 
                  className="max-w-full"
                />
              </div>
            </div>

            {/* Code References Section */}
            {question.filesReferences && Array.isArray(question.filesReferences) && question.filesReferences.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  📁 Referenced Files ({question.filesReferences.length})
                </h3>
                <div className="w-full">
                  <Codereferences
                    fileReferences={question.filesReferences.map((file: any) => ({
                      filename: file.fileName || file.filename || 'unknown',
                      sourceCode: file.sourceCode || file.source_code || '',
                      summary: file.summary || ''
                    }))}
                  />
                </div>
              </div>
            )}
            
            {/* Fallback: Show if no filesReferences */}
            {(!question.filesReferences || (Array.isArray(question.filesReferences) && question.filesReferences.length === 0)) && (
              <div className="border-t pt-4">
                <p className="text-gray-500">No file references found for this question.</p>
              </div>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage