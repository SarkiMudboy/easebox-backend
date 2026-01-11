import { AuthController } from "#controllers/auth.controller.js";
import { db } from "#db/index.js";
import { IndividualProfileRepository } from "#repositories/individual-profile.repository.js";
import { OtpRepository } from "#repositories/otp.repository.js";
import { UserRepository } from "#repositories/user.repository.js";
import { AuthService } from "#services/auth.service.js";
import { VerificationService } from "#services/verification.service.js";
import { Router } from "express";

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository(db);
const individualProfileRepository = new IndividualProfileRepository(db);
const otpRepository = new OtpRepository(db);
const verificationService = new VerificationService(
  otpRepository,
  userRepository
);
const authService = new AuthService(
  userRepository,
  individualProfileRepository,
  verificationService
);
const authController = new AuthController(authService);

// Routes
router.post("/register/individual", authController.registerIndividual);

export default router;
