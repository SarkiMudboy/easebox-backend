import { VerificationController } from "#controllers/verification.controller.js";
import { db } from "#db/index.js";
import { OtpRepository } from "#repositories/otp.repository.js";
import { UserRepository } from "#repositories/user.repository.js";
import { VerificationService } from "#services/verification.service.js";
import { Router } from "express";

const router = Router();

// Initialize dependencies
const otpRepository = new OtpRepository(db);
const userRepository = new UserRepository(db);
const verificationService = new VerificationService(
  otpRepository,
  userRepository
);
const verificationController = new VerificationController(verificationService);

// Routes
router.post("/request", verificationController.requestVerification);
router.post("/verify", verificationController.verifyAccount);

export default router;
