import type { ApiResponse } from "#shared/types/index.js";
import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import {
  VerificationError,
  VerificationService,
} from "../services/verification.service.js";
import {
  requestVerificationSchema,
  verifyOtpSchema,
} from "../validators/verification.validators.js";

export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  requestVerification = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type, userId } = requestVerificationSchema.parse(req.body);

      if (type === "email") {
        await this.verificationService.sendEmailVerification(userId);
      } else {
        await this.verificationService.sendPhoneVerification(userId);
      }

      res.status(200).json({
        message: `Verification ${type === "email" ? "email" : "SMS"} sent successfully`,
        success: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          const existingErrors = errors[path] ?? [];
          existingErrors.push(issue.message);
          errors[path] = existingErrors;
        });

        res.status(400).json({
          errors,
          message: "Validation failed",
          success: false,
        });
        return;
      }

      if (error instanceof VerificationError) {
        const statusMap: Record<string, number> = {
          ALREADY_VERIFIED: 400,
          EMAIL_SEND_FAILED: 500,
          NO_PHONE_NUMBER: 400,
          SMS_SEND_FAILED: 500,
          USER_NOT_FOUND: 404,
        };
        const statusCode = statusMap[error.code] ?? 400;

        res.status(statusCode).json({
          message: error.message,
          success: false,
        });
        return;
      }

      next(error);
    }
  };

  verifyAccount = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code, type, userId } = verifyOtpSchema.parse(req.body);

      await this.verificationService.verifyOtp(userId, code, type);

      res.status(200).json({
        message: `${type === "email" ? "Email" : "Phone"} verified successfully`,
        success: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          const existingErrors = errors[path] ?? [];
          existingErrors.push(issue.message);
          errors[path] = existingErrors;
        });

        res.status(400).json({
          errors,
          message: "Validation failed",
          success: false,
        });
        return;
      }

      if (error instanceof VerificationError) {
        res.status(400).json({
          message: error.message,
          success: false,
        });
        return;
      }

      next(error);
    }
  };
}
