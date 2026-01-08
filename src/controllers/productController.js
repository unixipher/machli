import { drizzle } from '../drizzle/index.js';
import { product } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';

export const createProduct = async (req, res) => {
    console.log('[createProduct] Function entry');
    const { title, description, price, metadata, quantity } = req.body;
    console.log('[createProduct] Request body:', { title, description, price, hasMetadata: !!metadata, quantity });
    console.log('[createProduct] Hub manager ID:', req.manager?.id);
    try {
        if (!title || !description || price === undefined || quantity === undefined) {
            console.log('[createProduct] Validation failed: Missing required fields');
            return error('title, description, price, and quantity are required', res, 400);
        }

        console.log('[createProduct] Inserting new product');
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
        console.log('[createProduct] Product created, ID:', newProduct.id);

        console.log('[createProduct] Sending success response');
        res.status(201).json({
            success: true,
            data: newProduct
        });
    } catch (err) {
        console.error('[createProduct] Error:', err.message, err.stack);
        error(err.message || err.toString(), res);
    }
}
