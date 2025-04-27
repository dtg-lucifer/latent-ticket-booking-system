/**
 * The entry point for the server
 * @maintainer dtg-lucifer
 * @repo https://github.com/dtg-lucifer/latent-ticket-booking-system
 */

import dotenv from "dotenv";
import { Server } from "./server";

dotenv.config();

const API_VERSION = "/api/v1";

// @INFO custom server initialization
const server = new Server({
  port: Number(process.env.PORT) || 8080,
  apiVersion: API_VERSION,
});

export const __CACHE = server.store;

server.start();
