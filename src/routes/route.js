import { Router } from "express";
import { CreateManager, CreateDriver, CreateShopOwner } from '../controllers/auth/create/createUserController.js';
import { UpdateManager, UpdateDriver, UpdateShopOwner } from '../controllers/auth/update/updateUserController.js';
import { authenticateManager, authenticateDriver, authenticateShopOwner } from '../middleware/middleware.js';
import { CreateProduct } from '../controllers/manager/product/create/createProduct.js';
import { getDriver, getManager, getShopOwner } from "../controllers/auth/get/getUserController.js";
import { UpdateProduct } from "../controllers/manager/product/update/updateProduct.js";
import { GetProduct } from "../controllers/manager/product/get/getProduct.js";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        message: "Health check successful",
        timestamp: Date.now()
    });
});
//User Creation
router.post("/create-manager", CreateManager);
router.post("/create-driver", CreateDriver);
router.post("/create-shopowner", CreateShopOwner);
//User Update (Protected Route)
router.put("/update-manager/:id", authenticateManager, UpdateManager);
router.put("/update-driver/:id", authenticateDriver, UpdateDriver);
router.put("/update-shopowner/:id", authenticateShopOwner, UpdateShopOwner);
//Get User Details (Protected Route)
router.get("/get-manager/:id", authenticateManager, getManager);
router.get("/get-driver/:id", authenticateDriver, getDriver);
router.get("/get-shopowner/:id", authenticateShopOwner, getShopOwner);
//Product Creation (Protected Route)
router.post("/create-product", authenticateManager, CreateProduct);
router.put("/update-product/:id", authenticateManager, UpdateProduct);
router.get("/get-product/:id", authenticateManager, GetProduct);

export default router;