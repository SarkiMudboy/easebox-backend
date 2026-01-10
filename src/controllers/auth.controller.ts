import type { ApiResponse, AuthResponse } from "#types/index.js";
import type { NextFunction, Request, Response } from "express";

import { AuthError, AuthService } from "#services/auth.service.js";
import { registerIndividualSchema } from "#validators/auth.validators.js";
import { z } from "zod";

export class AuthController {
  constructor(private authService: AuthService) {}

  registerIndividual = async (
    req: Request,
    res: Response<ApiResponse<AuthResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request body
      const validatedData = registerIndividualSchema.parse(req.body);

      // Register user
      const result = await this.authService.registerIndividual({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: validatedData.password,
        phone: validatedData.phone ?? undefined,
        termsAccepted: validatedData.termsAccepted,
      });

      res.status(201).json({
        data: result,
        message: "Registration successful",
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

      if (error instanceof AuthError) {
        const statusCode = error.code === "EMAIL_EXISTS" ? 409 : 400;
        res.status(statusCode).json({
          message: error.message,
          success: false,
        });
        return;
      }

      next(error);
    }
  };
}
