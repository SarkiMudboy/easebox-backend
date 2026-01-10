import { AuthController } from "#controllers/auth.controller.js";
import { db } from "#db/index.js";
import { UserRepository } from "#repositories/user.repository.js";
import { AuthService } from "#services/auth.service.js";
import { Router } from "express";

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Routes
router.post("/register/individual", authController.registerIndividual);

export default router;

