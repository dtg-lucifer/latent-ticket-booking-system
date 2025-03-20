import { post } from "./utils";
import { expect } from "vitest";
import { StatusCodes } from "http-status-codes";

/**
 * API test utility functions that provide common test patterns
 */
export const ApiHelpers = {
  /**
   * Creates a basic user for testing via signup endpoint
   * Returns the request ID and user data for subsequent tests
   */
  async createTestUser(
    baseUrl: string,
    userData: { number: string; name: string; email: string }
  ) {
    const response = await post(`${baseUrl}/auth/signup`, userData);

    if (response.status === StatusCodes.BAD_REQUEST) {
      // User likely already exists
      return {
        exists: true,
        requestId: null,
        userData: null,
      };
    }

    expect(response.status).toBe(StatusCodes.ACCEPTED);
    expect(response.data).toHaveProperty("requestId");

    return {
      exists: false,
      requestId: response.data.requestId,
      userData: response.data.user,
      message: response.data.message,
    };
  },

  /**
   * Performs login for an existing user
   * Returns the request ID for subsequent verification
   */
  async loginTestUser(
    baseUrl: string,
    userData: { number: string; name: string; email: string }
  ) {
    const response = await post(`${baseUrl}/auth/login`, userData);

    if (response.status === StatusCodes.BAD_REQUEST) {
      // User may not exist or not be verified
      return {
        success: false,
        requestId: null,
        error: response.data.error,
        message: response.data.message,
      };
    }

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.data).toHaveProperty("requestId");

    return {
      success: true,
      requestId: response.data.requestId,
      error: null,
      message: response.data.message,
    };
  },

  /**
   * Validates validation error responses
   */
  validateErrorResponse(
    response: any,
    expectedStatus = StatusCodes.BAD_REQUEST
  ) {
    expect(response.status).toBe(expectedStatus);
    if (expectedStatus === StatusCodes.BAD_REQUEST) {
      expect(response.data).toHaveProperty("msg", "Validation Error");
    }
  },
};
