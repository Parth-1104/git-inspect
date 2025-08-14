import {z} from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from '@/lib/github';
import { indexGithubRepo, previewFilesToProcess } from '@/lib/github-loader';
import { db } from '@/server/db';
export const projectRouter=createTRPCRouter({
    createProject:protectedProcedure.input(
    z.object({
        name:z.string(),
        githubUrl:z.string(),
        githubToken:z.string().optional()

    })

    ).mutation(async({ctx,input})=>{
        if (!ctx.user.userId) {
            throw new Error('User ID is required');
        }
        
        const project=await ctx.db.project.create({
            data:{
                githubUrl:input.githubUrl,
                name:input.name,
                UserToProjects:{
                    create:{
                        userId:ctx.user.userId
                    }
                }

            }
        })
        await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
        await pollCommits(project.id)
        return project
    }),

    previewIndex: protectedProcedure.input(z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional(),
        maxFiles: z.number().optional(),
    })).mutation(async ({ input }) => {
        const result = await previewFilesToProcess(input.githubUrl, input.githubToken, input.maxFiles ?? 30)
        return result;
    }),

    getProjects: protectedProcedure.query(async({ctx})=>{
        if (!ctx.user.userId) {
            throw new Error('User ID is required');
        }
        
        return await ctx.db.project.findMany({
            where:{
                UserToProjects:{
                    some:{
                        userId:ctx.user.userId
                    }
                },
                deletedAt:null
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId:z.string()
    })).query(async({ctx,input})=>{
        return await ctx.db.commit.findMany({
            where:{
            projectId:input.projectId
            },
            orderBy: { commitDate: "desc" }
        })
    }),

    pollNewCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      await pollCommits(input.projectId);
      return { success: true };
    }),

    saveAnswer:protectedProcedure.input(z.object({
        projectId:z.string(),
        question:z.string(),
        filesReferences:z.any(),
        answer:z.string()
    })).mutation(async({ctx,input})=>{
        return await ctx.db.question.create({
            data:{
                answer:input.answer,
                filesReferences:input.filesReferences,
                projectId:input.projectId,
                question:input.question,
                userId:ctx.user.userId!
            }
        })
    }),
    getQuestions:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.question.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                user:true
            },
            orderBy:{
                createdAt:'desc'
            }
        })
    }),
    archiveProject:protectedProcedure.input(z.object({projectId:z.string()})).mutation(async ({ctx,input})=>{
        return await ctx.db.project.update({where:{id:input.projectId},data:{deletedAt:new Date()}})
    }),
    getTeamMembers:protectedProcedure.input(z.object({projectId:z.string()})).query(async ({ctx,input})=>{
        return await ctx.db.userToProject.findMany({where: {projectId: input.projectId},include:{user:true}})
    })


});
