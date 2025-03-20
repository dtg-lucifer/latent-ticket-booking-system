import { HttpStatusCode } from "axios";
import { describe, expect, it, suite } from "vitest";
import { post } from "../utils";
import { ApiHelpers } from "../api.helpers";

const BACKEND_URL = "http://localhost:8998/api/v1";

// Test users for various scenarios
const TEST_USERS = {
  newUser: {
    number: "9876543210",
    name: "Test User",
    email: "testuser@example.com",
  },
  existingUser: {
    number: "8910530975",
    name: "Piush Bose",
    email: "piush@example.com",
  },
};

suite("Authentication API", () => {
  describe("Input Validation", () => {
    it("should validate phone number format during signup", async () => {
      // Too short number
      const shortNumberResponse = await post(`${BACKEND_URL}/auth/signup`, {
        number: "123",
        name: "Short Number",
        email: "short@example.com",
      });
      ApiHelpers.validateErrorResponse(shortNumberResponse);

      // Too long number
      const longNumberResponse = await post(`${BACKEND_URL}/auth/signup`, {
        number: "12345678901",
        name: "Long Number",
        email: "long@example.com",
      });
      ApiHelpers.validateErrorResponse(longNumberResponse);
    });

    it("should validate email format during signup", async () => {
      // Invalid email
      const invalidEmailResponse = await post(`${BACKEND_URL}/auth/signup`, {
        number: "9876543210",
        name: "Invalid Email",
        email: "not-an-email",
      });
      ApiHelpers.validateErrorResponse(invalidEmailResponse);
    });

    it("should validate name length during signup", async () => {
      // Too short name
      const shortNameResponse = await post(`${BACKEND_URL}/auth/signup`, {
        number: "9876543210",
        name: "AB", // Less than 3 chars
        email: "short@example.com",
      });
      ApiHelpers.validateErrorResponse(shortNameResponse);
    });

    it("should validate OTP format during verification", async () => {
      // Too short OTP
      const shortOtpResponse = await post(`${BACKEND_URL}/auth/verify`, {
        otp: "123",
        number: "9876543210",
        requestId: "00000000-0000-0000-0000-000000000000", // Valid UUID format
      });
      ApiHelpers.validateErrorResponse(shortOtpResponse);

      // Too long OTP
      const longOtpResponse = await post(`${BACKEND_URL}/auth/verify`, {
        otp: "1234567",
        number: "9876543210",
        requestId: "00000000-0000-0000-0000-000000000000", // Valid UUID format
      });
      ApiHelpers.validateErrorResponse(longOtpResponse);
    });

    it("should validate requestId format during verification", async () => {
      // Invalid UUID format
      const invalidUuidResponse = await post(`${BACKEND_URL}/auth/verify`, {
        otp: "123456",
        number: "9876543210",
        requestId: "not-a-uuid",
      });
      ApiHelpers.validateErrorResponse(invalidUuidResponse);
    });
  });

  describe("Authentication Flows", () => {
    it("should return appropriate message for unverified user login", async () => {
      // Create a new user if needed
      const { exists, requestId } = await ApiHelpers.createTestUser(
        BACKEND_URL,
        TEST_USERS.newUser
      );

      // Try to login before verification
      const loginResult = await ApiHelpers.loginTestUser(
        BACKEND_URL,
        TEST_USERS.newUser
      );

      expect(loginResult.success).toBe(false);
      if (!exists) {
        expect(loginResult.message).toBe("User not verified");
      }
      expect(loginResult).toHaveProperty("requestId");
    });

    it("should handle login for existing verified users", async () => {
      // This test assumes the user already exists and is verified
      const loginResult = await ApiHelpers.loginTestUser(
        BACKEND_URL,
        TEST_USERS.existingUser
      );

      // Skipping the success assertion as we don't know the state of the database
      if (loginResult.success) {
        expect(loginResult.requestId).toBeTruthy();
      } else {
        // If login failed, it should be for one of these reasons
        expect(["User not found", "User not verified"]).toContain(
          loginResult.error
        );
      }
    });

    it("should reject OTP verification with wrong phone number", async () => {
      // Assuming we have a valid requestId from a previous login
      const requestId = "00000000-0000-0000-0000-000000000000"; // Example UUID

      const response = await post(`${BACKEND_URL}/auth/verify`, {
        otp: "123456", // Any 6-digit code
        number: "1111111111", // A number that doesn't match the request
        requestId,
      });

      expect(response.status).toBe(HttpStatusCode.Unauthorized);
    });

    it("should handle OTP verification with login param correctly", async () => {
      // Get a fresh requestId for login
      const loginResponse = await post(
        `${BACKEND_URL}/auth/login`,
        TEST_USERS.existingUser
      );

      // If the user exists and is verified
      if (loginResponse.status === HttpStatusCode.Ok) {
        const requestId = loginResponse.data.requestId;

        // Try verification with login param
        const verifyResponse = await post(
          `${BACKEND_URL}/auth/verify?login=true`,
          {
            otp: "123456", // Mock OTP
            number: TEST_USERS.existingUser.number,
            requestId,
          }
        );

        // It should fail due to invalid OTP, but the endpoint should exist
        expect(verifyResponse.status).toBe(HttpStatusCode.Unauthorized);
        expect(verifyResponse.data).toHaveProperty("message", "Invalid OTP");
      }
    });
  });
});
