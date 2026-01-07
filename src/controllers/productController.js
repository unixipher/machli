import { drizzle } from '../drizzle/index.js';
import { product } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';

export const createProduct = async (req, res) => {
    const { title, description, price, metadata, quantity } = req.body;
    try {
        if (!title || !description || price === undefined || quantity === undefined) {
            return error('title, description, price, and quantity are required', res, 400);
        }

        const [newProduct] = await drizzle
            .insert(product)
            .values({
                title,
                description,
                price,
                hubmanagerId: req.manager.id,
                metadata: metadata || null,
                quantity
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newProduct
        });
    } catch (err) {
        console.error('Error creating product:', err);
        error(err.message || err.toString(), res);
    }
}
