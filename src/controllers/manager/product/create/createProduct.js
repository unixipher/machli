import { prisma } from './../../../../helper/prisma.js'
import { error } from '../../../../middleware/middleware.js';

export const CreateProduct = async (req, res) => {
    try {
        const { title, description, price, metadata, quantity } = req.body;
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                metadata,
                quantity
            }
        });
        res.status(201).json(newProduct);
    } catch (err) {
        error(err, res);
    }
};