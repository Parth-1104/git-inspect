'use client'
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React, { useState } from 'react'
import { Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {lucario} from 'react-syntax-highlighter/dist/esm/styles/prism'

type Props = {
  fileReferences: {filename: string; sourceCode: string; summary: string}[]
}

const Codereferences = ({fileReferences}: Props) => {
  const [tab, setTab] = useState(fileReferences?.[0]?.filename || '')
  
  if (!fileReferences || fileReferences.length === 0) return null
  
  return (
    <div className='max-w-[70vw]'>
      <Tabs value={tab} onValueChange={setTab}>
        <div className='overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md'>
          {fileReferences.map(file => (
            <button 
              key={file.filename} 
              onClick={() => setTab(file.filename)}
              className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted',
                {
                  'bg-primary text-primary-foreground': tab === file.filename,
                }
              )}
            >
              {file.filename}
            </button>
          ))}
        </div>
        {fileReferences.map(file => (
          tab === file.filename && (
            <div key={file.filename} className='max-h-[40vh] overflow-scroll max-w-7xl rounded-md'>
              <SyntaxHighlighter language='typescript' style={lucario}>
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
          )
        ))}
      </Tabs>
    </div>
  )
}

export default Codereferences