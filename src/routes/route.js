import { Router } from "express";
import { authenticateManager, authenticateDriver, authenticateShopOwner } from '../middleware/middleware.js';
import { CreateDriver, CreateManager, CreateShopOwner, getDriver, getManager, getShopOwner, UpdateDriver, UpdateManager, UpdateShopOwner } from "../controllers/auth/authController.js";
import { CreateProduct, UpdateProduct, GetProduct } from "../controllers/product/productController.js";
import { CreateOrder, UpdateOrder, GetOrder, CancelOrder } from "../controllers/order/orderController.js";

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
//Order Management
router.post("/create-order", authenticateManager, CreateOrder);
router.put("/update-order/:id", authenticateDriver, UpdateOrder);
router.get("/get-order/:id", authenticateManager, GetOrder);
router.get("/get-order/:id", authenticateShopOwner, GetOrder);
router.delete("/cancel-order/:id", authenticateManager, CancelOrder);

export default router;