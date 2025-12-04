import db from '../helper/db.js';
import { manager, driver } from '../db/schema.js';
import { error } from '../middleware/middleware.js';

export const createManager = async (req, res) => {
    try {
        const { name, phone, token } = req.body
        const newManager = await db.insert(manager).values({
            name,
            phone,
            token
        }).returning();
        res.status(201).json(newManager[0]);
    } catch (err) {
        error(err, res);
    }
};
export const CreateDriver = async (req, res) => {
    try {
        const { name, phone, token } = req.body
        const newDriver = await db.insert(driver).values({
            name,
            phone,
            token
        }).returning();
        res.status(201).json(newDriver[0]);
    } catch (err) {
        error(err, res);
    }
};