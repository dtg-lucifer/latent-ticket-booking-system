/**
 * @description This file contains the types used in the application.
 * @maintainer dtg-lucifer
 */

import { User } from "@prisma/client";

/**
 * @description Safe user schema so that no sensitive data is exposed
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  number: string;
  verified: boolean;
}

/**
 * @description Response type for auth related services
 */
export interface AuthResponse {
  verified: boolean;
  done: boolean;
  requestId: string;
  user: User | null;
  token: string | null;
}
