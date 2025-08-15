import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      githubUrl: z.string().url(),
      githubToken: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.userId) {
        throw new Error('User ID is required');
      }
      
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          UserToProjects: {
            create: {
              userId: ctx.user.userId,
            }
          }
        }
      })
      if (input.githubToken) {
        // TODO: Store github token securely
        console.log("Github Token:", input.githubToken)
      }
      // Call pollCommits after project creation
      await pollCommits(project.id)
      return project
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.userId) {
      throw new Error('User ID is required');
    }
    
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProjects: {
          some: {
            userId: ctx.user.userId,
          }
        }
      }
    })
    return projects
  }),

  getCommits: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const commits = await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: { commitDate: "desc" }
      })
      return commits
    }),
});
