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