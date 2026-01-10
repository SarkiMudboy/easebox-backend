import { errorHandler } from "#middleware/error.middleware.js";
import routes from "#routes/index.js";
import express from "express";

const app = express();
const port = process.env.PORT ?? "3000";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1", routes);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
