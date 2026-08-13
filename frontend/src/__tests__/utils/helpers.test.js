// src/__tests__/utils/helpers.test.js
import { describe, it, expect } from "vitest";
import {
  saveToken,
  getToken,
  removeToken,
  isAuthenticated,
  saveUser,
  getUser,
  getPasswordStrength,
} from "@/utils/helpers";

describe("helpers", () => {
  it("isAuthenticated is false when no token is stored", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("isAuthenticated is true after saveToken", () => {
    saveToken("jwt-test-token");
    expect(isAuthenticated()).toBe(true);
    expect(getToken()).toBe("jwt-test-token");
  });

  it("removeToken clears both token and user", () => {
    saveToken("jwt-test-token");
    saveUser({ email: "buyer@test.com" });
    removeToken();
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("getPasswordStrength classifies weak vs strong passwords", () => {
    expect(getPasswordStrength("abc").labelKey).toBe("passwordStrength.weak");
    expect(getPasswordStrength("StrongP@ss1").labelKey).toBe(
      "passwordStrength.strong"
    );
  });
});
