import { z } from "zod";

// Configuration schema
export const configSchema = z.object({
  userId: z.string(),
  secretKey: z.string(),
  baseUrl: z.string().url().default("https://api.play.ai/api/v1"),
});

// Request schema
const generatePodcastSchema = z.object({
  model: z.enum(["PlayDialog"]).default("PlayDialog"),
  text: z.string(),
  voice: z.string().url(), // URL to voice manifest for first host
  voice2: z.string().url(), // URL to voice manifest for second host
  turnPrefix: z.string().default("Host 1:"),
  turnPrefix2: z.string().default("Host 2:"),
  outputFormat: z.enum(["mp3", "wav"]).default("mp3"),
});

// Response schemas
const generateResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "PROCESSING"]),
});

const statusResponseSchema = z.object({
  output: z.object({
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
    url: z.string().optional(),
    error: z.string().optional(),
  }),
});

// Type definitions
type Config = z.infer<typeof configSchema>;
type GeneratePodcastRequest = z.infer<typeof generatePodcastSchema>;
type StatusResponse = z.infer<typeof statusResponseSchema>;

export class PlayAIClient {
  private config: Config;
  private headers: HeadersInit;

  constructor(config: Config) {
    this.config = configSchema.parse(config);
    this.headers = {
      "X-USER-ID": this.config.userId,
      Authorization: this.config.secretKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Triggers podcast generation
   */
  async generatePodcast(request: GeneratePodcastRequest): Promise<string> {
    try {
      // Validate request
      const validRequest = generatePodcastSchema.parse(request);

      const response = await fetch(`${this.config.baseUrl}/tts/`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(validRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate podcast: ${response.statusText}`);
      }

      const data = generateResponseSchema.parse(await response.json());
      return data.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error generating podcast: ${error.message}`);
      }
      throw new Error(`Error generating podcast: ${String(error)}`);
    }
  }

  /**
   * Checks the status of a podcast generation job
   */
  async checkStatus(jobId: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/tts/${jobId}`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`);
      }

      return statusResponseSchema.parse(await response.json());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error checking status: ${error.message}`);
      }
      throw new Error(`Error checking status: ${String(error)}`);
    }
  }

  /**
   * Polls for job completion
   */
  async waitForCompletion(
    jobId: string,
    options: {
      maxAttempts?: number;
      delayMs?: number;
    } = {},
  ): Promise<string> {
    const { maxAttempts = 30, delayMs = 2000 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.checkStatus(jobId);

      switch (status.output.status) {
        case "COMPLETED":
          if (!status.output.url) {
            throw new Error("Job completed but no URL provided");
          }
          return status.output.url;

        case "FAILED":
          throw new Error(
            `Job failed: ${status.output.error || "Unknown error"}`,
          );

        case "PENDING":
        case "PROCESSING":
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          attempts++;
          break;
      }
    }

    throw new Error(`Job timed out after ${maxAttempts} attempts`);
  }

  /**
   * Helper method to generate podcast and wait for completion
   */
  async generateAndWaitForPodcast(
    request: GeneratePodcastRequest,
    pollOptions?: { maxAttempts?: number; delayMs?: number },
  ): Promise<string> {
    const jobId = await this.generatePodcast(request);
    return this.waitForCompletion(jobId, pollOptions);
  }
}

// Usage example:
/*
const client = new PlayAIClient({
  userId: process.env.PLAYDIALOG_USER_ID!,
  secretKey: process.env.PLAYDIALOG_SECRET_KEY!,
});

const audioUrl = await client.generateAndWaitForPodcast({
  text: "Host 1: Welcome...\nHost 2: Thanks...",
  voice: "s3://voice-cloning-zero-shot/...",
  voice2: "s3://voice-cloning-zero-shot/...",
});
*/
