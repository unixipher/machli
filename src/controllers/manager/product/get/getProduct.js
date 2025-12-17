import { prisma } from './../../../../helper/prisma.js'
import { error } from '../../../../middleware/middleware.js';

export const GetProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Product not found'
            });
        }
        res.status(200).json(product);
    } catch (err) {
        error(err, res);
    }
};