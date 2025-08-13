'use server'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google' 
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY_2,
})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()
    
    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector?.join(',')}]`

    const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    ` as {fileName: string; sourceCode: string; summary: string}[]

    let context = ''
    for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
    }

    const prompt = `
    You are an AI code assistant who answers questions about the codebase. Your target audience is tech interns.
    The AI assistant is brand new, powerful, human-like artificial intelligence.
    The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
    AI is well-behaved and well-mannered individual.
    AI is always friendly and kind and is eager to provide vivid and thoughtful responses to the user.
    
    AI has access to knowledge and is able to accurately answer questions about any topic.
    
    If the question is asking about code or a specific file, AI will provide detailed answers giving step by step instructions.
    
    START CONTEXT BLOCK
    ${context}
    END CONTEXT BLOCK 

    START QUESTION 
    ${question}
    END OF QUESTION 

    AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
    If the context does not provide the answer to the question, the AI assistant will say, "I am sorry, but I don't know the answer based on the provided context."
    AI will not apologize for previous responses, but instead will indicate new information was gained.
    AI assistant will not invent anything that is not drawn directly from the context.
    Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.`

    ;(async () => {
        try {
            const { textStream } = await streamText({
                model: google('gemini-1.5-flash'),
                prompt,
                maxTokens: 2000,
            })

            for await (const delta of textStream) {
                stream.update(delta)
            }
            
            stream.done()
        } catch (error) {
            console.error('Error in streaming:', error)
            stream.update('Sorry, there was an error processing your request. Please try again.')
            stream.done()
        }
    })()

    return {
        output: stream.value,
        filesReferences: result
    }
}