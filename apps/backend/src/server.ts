import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { log, loggerMiddleware } from "./middlewares/logger";
import { Cache } from "./lib/cache";
import { APIError } from "./utils/types";
import { errorHandler } from "./middlewares/error_handler";
import { CORS_ORIGINS } from "./config";
import { mainRouter } from "./routes/v1/_index";

type ServerConfig = {
  port: number;
  apiVersion: string;
};

export class Server {
  app: express.Application;
  router: express.Router;
  port: number;
  listenAddress: string;
  store: Cache;
  apiVersion: string;

  constructor(config: ServerConfig) {
    this.app = express();
    this.port = config.port || 8080;
    this.listenAddress = `http://localhost:${this.port}`; // Updated to use this.port
    this.store = new Cache();
    this.router = express.Router();
    this.apiVersion = config.apiVersion || "/api/v1";
  }

  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: CORS_ORIGINS,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      })
    );

    this.app.use(loggerMiddleware);
  }

  // @INFO: setup the main router
  setupRoutes() {
    this.router.use(mainRouter);

    this.app.use(this.apiVersion, this.router);
  }

  setupErrorHandlers() {
    this.app.use((req, res, next) => {
      const err = new APIError(
        `Not Found: ${req.method} ${req.originalUrl}`,
        StatusCodes.NOT_FOUND
      );
      err.logError();
      next(err);
    });
    this.app.use(errorHandler);
  }

  // @INFO: setup the error handler and other listeners
  setupListeners() {
    process.on("uncaughtException", (error) => {
      log.error("Uncaught Exception:", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
      log.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
  }

  // @TODO: setup the socket io server
  setupWSServer() {}

  start() {
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
    this.setupListeners();
    this.setupWSServer(); // @TODO
    this.app.listen(this.port, () => {
      log.warn(`Server is running at ${this.listenAddress}`);
    });
  }
}
