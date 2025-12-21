import { z } from 'zod';

export const ordermetadataschema = z.object({
    locations: z.array(z.object({
        latitude: z.number(),
        longitude: z.number(),
        timestamp: z.date().optional()
    })).optional()
});