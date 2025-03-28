import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { SERVER_CONFIG } from "../utils/constants.js";

export const setupMiddleware = app => {
  // Basic middleware
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("combined"));
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit(SERVER_CONFIG.RATE_LIMIT);
  app.use(limiter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });
};
