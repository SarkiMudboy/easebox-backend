import { authRoutes } from "#modules/auth/index.js";
import { Router } from "express";

const router = Router();

// Module routes
router.use("/auth", authRoutes);

// Future module routes will be added here:
// router.use("/users", userRoutes);
// router.use("/riders", riderRoutes);
// router.use("/companies", companyRoutes);
// router.use("/orders", orderRoutes);
// router.use("/deliveries", deliveryRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/pricing", pricingRoutes);

export default router;
