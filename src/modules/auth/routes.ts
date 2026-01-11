import { db } from "#infrastructure/database/index.js";
import {
  IndividualProfileRepository,
  OtpRepository,
  UserRepository,
} from "#repositories/index.js";
import { Router } from "express";

import { AuthController, VerificationController } from "./controllers/index.js";
import { AuthService, VerificationService } from "./services/index.js";

const router = Router();

// Initialize repositories
const userRepository = new UserRepository(db);
const individualProfileRepository = new IndividualProfileRepository(db);
const otpRepository = new OtpRepository(db);

// Initialize services
const verificationService = new VerificationService(
  otpRepository,
  userRepository
);
const authService = new AuthService(
  userRepository,
  individualProfileRepository,
  verificationService
);

// Initialize controllers
const authController = new AuthController(authService);
const verificationController = new VerificationController(verificationService);

// Auth routes
router.post("/register/individual", authController.registerIndividual);

// Verification routes
router.post(
  "/verification/request",
  verificationController.requestVerification
);
router.post("/verification/verify", verificationController.verifyAccount);

export default router;
