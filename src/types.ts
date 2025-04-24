import { z } from 'zod';

export const MCPRequestSchema = z.object({
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
});

export type MCPRequest = z.infer<typeof MCPRequestSchema>;
