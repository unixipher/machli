import { Router } from "express";
import * as authController from "../controllers/authController.js";
import * as orderController from "../controllers/orderController.js";
import * as productController from "../controllers/productController.js";
import * as vehicleController from "../controllers/vehicleController.js";
import { authenticateIntermediateHubManager, authenticateMainHubManager, authenticateMainDriverManager, authenticateIntermediateDriverManager } from "../middleware/middleware.js";
const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        message: "Health check successful",
        timestamp: Date.now()
    });
});

// Authentication Routes
router.post("/auth/request-otp", authController.requestOTP)
router.post("/auth/verify-otp", authController.verifyOTP)

// Profile Creation Routes (requires verified OTP)
router.post("/createHubManager", authController.createHubManager)
router.post("/createDriverManager", authController.createDriverManager)

// Public Routes
router.get("/getAllHubManagers", authController.getAllHubManagers)

//Intermediate Hub Manager Routes
router.post("/createShop", authenticateIntermediateHubManager, orderController.createShop)
router.post("/createVehicleForIntermediateHubManager", authenticateIntermediateHubManager, vehicleController.createVehicle)
router.get("/getIntermediateHubManagerProfileInfo", authenticateIntermediateHubManager, authController.getHubManagerProfileInfo)
router.post("/createOrder", authenticateIntermediateHubManager, orderController.createOrder)
router.get("/getAllShopsUnderIntermediateHubManager", authenticateIntermediateHubManager, orderController.getAllShopsUnderIntermediateHubManager)
router.get("/getAllDriverManagerUnderIntermediateHubManager", authenticateIntermediateHubManager, orderController.getAllDriverManagerUnderIntermediateHubManager)
router.get("/getAllOrdersForIntermediateHubManager", authenticateIntermediateHubManager, orderController.getAllOrdersForIntermediateHubManager)
router.get("/getAllProductsUnderIntermediateHubManager", authenticateIntermediateHubManager, orderController.getAllProductsUnderIntermediateHubManager)
router.get("/getAllVehicleUnderIntermediateHubManager", authenticateIntermediateHubManager, orderController.getAllVehicleUnderIntermediateHubManager)
router.put("/updateOrderForIntermediateHubManager", authenticateIntermediateHubManager, orderController.updateOrderForIntermediateHubManager)
router.post("/createProduct", authenticateIntermediateHubManager, productController.createProduct)
router.post("/allocateVehicletoOrderViaIntermediateHubManager", authenticateIntermediateHubManager, vehicleController.allocateVehicletoOrder)
router.post("/allocateDriverManagertoVehicleViaIntermediateHubManager", authenticateIntermediateHubManager, vehicleController.allocateDriverManagertoVehicle)

//Main Hub Manager Routes
router.get("/getAllOrdersForMainHubManager", authenticateMainHubManager, orderController.getAllOrdersForMainHubManager)
router.get("/getMainHubManagerProfileInfo", authenticateMainHubManager, authController.getHubManagerProfileInfo)
router.post("/createVehicleForMainHubManager", authenticateMainHubManager, vehicleController.createVehicle)
router.get("/getAllDriverManagerUnderMainHubManager", authenticateMainHubManager, orderController.getAllDriverManagerUnderMainHubManager)
router.get("/getAllIntermediateHubManagerUnderMainHubManager", authenticateMainHubManager, orderController.getAllIntermediateHubManagerUnderMainHubManager)
router.get("/getAllVehicleUnderMainHubManager", authenticateMainHubManager, orderController.getAllVehicleUnderMainHubManager)
router.put("/updateOrderForMainHubManager", authenticateMainHubManager, orderController.updateOrderForMainHubManager)
router.post("/allocateVehicletoOrderViaMainHubManager", authenticateMainHubManager, vehicleController.allocateVehicletoOrder)
router.post("/allocateDriverManagertoVehicleViaMainHubManager", authenticateMainHubManager, vehicleController.allocateDriverManagertoVehicle)


//Main Driver Manager Routes
router.get("/getOrdersForMainDriverManager", authenticateMainDriverManager, orderController.getOrdersForMainDriverManager)
//Intermediate Driver Manager Routes
router.get("/getOrdersForIntermediateDriverManager", authenticateIntermediateDriverManager, orderController.getOrdersForIntermediateDriverManager)
export default router;