import { describe, expect, it } from "vitest";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "../password-policy";

describe("password policy", () => {
  it("accepts passwords with 6+ chars, uppercase, lowercase, and number", () => {
    expect(isValidPassword("Abc123")).toBe(true);
    expect(isValidPassword("StrongPass9")).toBe(true);
  });

  it("rejects passwords missing uppercase, lowercase, or number", () => {
    expect(isValidPassword("abc123")).toBe(false);
    expect(isValidPassword("ABC123")).toBe(false);
    expect(isValidPassword("Abcdef")).toBe(false);
    expect(isValidPassword("123456")).toBe(false);
  });

  it("rejects passwords shorter than 6 characters", () => {
    expect(isValidPassword("Ab12")).toBe(false);
  });

  it("exports the expected user-facing message", () => {
    expect(PASSWORD_POLICY_MESSAGE).toContain("at least 6 characters");
    expect(PASSWORD_POLICY_MESSAGE).toContain("1 uppercase");
    expect(PASSWORD_POLICY_MESSAGE).toContain("1 lowercase");
    expect(PASSWORD_POLICY_MESSAGE).toContain("1 number");
  });
});
