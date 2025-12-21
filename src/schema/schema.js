const { z } = require('zod');

exports.ordermetadataschema = z.object({
    locations: z.array(z.object({
        latitude: z.number(),
        longitude: z.number(),
        timestamp: z.date().optional()
    })).optional()
});