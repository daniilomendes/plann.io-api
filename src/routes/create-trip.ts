import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          start_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { destination, start_at, ends_at } = request.body;

      if (dayjs(start_at).isBefore(new Date())) {
        throw new Error("Invalid trip start date.");
      }

      if (dayjs(ends_at).isBefore(start_at)) {
        throw new Error("Invalid trip end date.");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          start_at,
          ends_at,
        },
      });

      return {
        tripId: trip.id,
      };
    }
  );
}
