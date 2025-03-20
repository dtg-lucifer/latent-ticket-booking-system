import { expect, it, suite } from "vitest";
import { ApiHelpers } from "../api.helpers";
import { StatusCodes } from "http-status-codes";

const BACKEND_URL = "http://localhost:8998/api/v1";

suite("Health Check", () => {
  it("should return a successful health check response", async () => {
    const response = await ApiHelpers.healthCheck(BACKEND_URL);

    // Check the response status and data
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.data).toHaveProperty("status", "success");
  });
});
