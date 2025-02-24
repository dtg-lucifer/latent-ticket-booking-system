import axios, { AxiosError, HttpStatusCode } from "axios";
import { describe, expect, it, suite } from "vitest";
import { post } from "./utils";

const BACKEND_URL = "http://localhost:8998/api/v1";

const PHONE_NUMBER_1 = "8910530975";
const PHONE_NUMBER_2 = "8240524636";

const NAME_1 = "Piush Bose";
const NAME_2 = "Keya Bose";

suite("User Routes", () => {
  describe("Auth: Signup Endpoint tests", () => {
    it("should validate user credentials", async () => {
      const response = await post(`${BACKEND_URL}/auth/signup`, {
        phoneNumber: PHONE_NUMBER_1,
      });

      expect(response.status).toBe(HttpStatusCode.Ok);
      expect(response.data.id).not.toBeNull();
    });

    it("should reject incorrect OTP", async () => {
      const response = await post(
        `${BACKEND_URL}/auth/signup/verify?n=${PHONE_NUMBER_1}`,
        { otp: 999999 }
      );

      expect(response.status).toBe(HttpStatusCode.Unauthorized);
    });

    it("should prevent double signup", async () => {
      const response = await post(`${BACKEND_URL}/auth/signup`, {
        phoneNumber: PHONE_NUMBER_1,
      });

      expect(response.status).toBe(HttpStatusCode.BadRequest);
    });
  });
});
