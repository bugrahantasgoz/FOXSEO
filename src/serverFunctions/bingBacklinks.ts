import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BingBacklinksService } from "@/server/features/backlinks/services/BingBacklinksService";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const getBingBacklinksOverview = createServerFn({ method: "GET" })
  .middleware(requireProjectContext)
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ context }) =>
    BingBacklinksService.getOverview(context.project),
  );

export const getBingLinksToUrl = createServerFn({ method: "GET" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      url: z.string().url().max(2048),
      page: z.number().int().min(0).max(1000).default(0),
    }),
  )
  .handler(async ({ data, context }) =>
    BingBacklinksService.getLinksToUrl(context.project, data.url, data.page),
  );
