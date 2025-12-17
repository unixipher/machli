import { prisma } from './../../../../helper/prisma.js'
import { error } from '../../../../middleware/middleware.js';

export const UpdateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, metadata, quantity } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                price,
                metadata,
                quantity
            }
        });
        res.status(200).json(updatedProduct);
    } catch (err) {
        error(err, res);
    }
};