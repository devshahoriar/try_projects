/* eslint-disable @typescript-eslint/no-explicit-any */

import { arrayRowSchema } from "@/types/gen";
import { createTRPCRouter, publicProcedure } from "../trpc";

import generateApp from "@/lib/generator";
import z from "zod";
import { saveCSV } from "@/lib/csvOpration";

// In-memory storage for streaming logs (in production, use Redis or database)
const sessionLogs = new Map<
  string,
  Array<{
    message: string;
    type: "info" | "success" | "error";
    timestamp: string;
  }>
>();

const sessionStatus = new Map<string, "running" | "completed" | "error">();

const siteRoute = createTRPCRouter({
  updateCsv: publicProcedure
    .input(arrayRowSchema)
    .mutation(async ({ input }) => {
      await saveCSV(input as any);
    }),
  generateApp: publicProcedure
    .input(
      z.object({
        installDep: z.boolean().optional(),
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sessionId = input.sessionId;

      // Initialize session
      sessionLogs.set(sessionId, []);
      sessionStatus.set(sessionId, "running");

      // Start generation in background
      const generateAsync = async () => {
        try {
          await generateApp({
            installDep: input.installDep ?? false,
            onOutput: (message, type = "info") => {
              const logs = sessionLogs.get(sessionId) ?? [];
              logs.push({
                message,
                type,
                timestamp: new Date().toISOString(),
              });
              sessionLogs.set(sessionId, logs);
            },
          });

          sessionStatus.set(sessionId, "completed");
        } catch (error) {
          const logs = sessionLogs.get(sessionId) ?? [];
          logs.push({
            message: `Error: ${error instanceof Error ? error.message : "Generation failed"}`,
            type: "error",
            timestamp: new Date().toISOString(),
          });
          sessionLogs.set(sessionId, logs);
          sessionStatus.set(sessionId, "error");
        }
      };

      // Start generation asynchronously (don't await)
      void generateAsync();

      return { started: true, sessionId };
    }),

  // Polling endpoint for logs
  getGenerationLogs: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const logs = sessionLogs.get(input.sessionId) ?? [];
      const status = sessionStatus.get(input.sessionId) ?? "running";

      return {
        logs,
        status,
        isComplete: status === "completed" || status === "error",
      };
    }),
});

export default siteRoute;
