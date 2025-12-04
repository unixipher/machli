import { Router } from "express";
import { createManager, CreateDriver } from '../controllers/usercontroller.js';

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        message: "Health check successful",
        timestamp: Date.now()
    });
});
router.post("/create-manager", createManager);
router.post("/create-driver", CreateDriver);

export default router;