import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createPost: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  createProject: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      githubUrl: z.string().url(),
      githubToken: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          UserToProjects: {
            create: {
              userId: ctx.userId,
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

  getProjects: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProjects: {
          some: {
            userId: ctx.userId,
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
