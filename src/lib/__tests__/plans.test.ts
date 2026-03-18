import { describe, it, expect } from "vitest";
import {
  hasPaidAccess,
  isTrialPlan,
  isActiveSubscriber,
  MONTHLY_PRICE_CENTS,
  YEARLY_PRICE_CENTS,
  MONTHLY_EQUIVALENT_CENTS,
  YEARLY_IF_MONTHLY_CENTS,
  YEARLY_SAVINGS_CENTS,
  YEARLY_DISCOUNT_PERCENT,
  FREE_TUTORIAL_LIMIT,
} from "../plans";

describe("hasPaidAccess", () => {
  it("grants access to yearly plan", () => {
    expect(hasPaidAccess("yearly")).toBe(true);
  });
  it("grants access to monthly plan", () => {
    expect(hasPaidAccess("monthly")).toBe(true);
  });
  it("grants access to legacy pro plan", () => {
    expect(hasPaidAccess("pro")).toBe(true);
  });
  it("grants access to canceling plan (still within billing period)", () => {
    expect(hasPaidAccess("canceling")).toBe(true);
  });
  it("grants access to monthly trial", () => {
    expect(hasPaidAccess("trial")).toBe(true);
  });
  it("grants access to yearly trial", () => {
    expect(hasPaidAccess("trial_yearly")).toBe(true);
  });
  it("denies access to free plan", () => {
    expect(hasPaidAccess("free")).toBe(false);
  });
  it("denies access to undefined", () => {
    expect(hasPaidAccess(undefined)).toBe(false);
  });
  it("denies access to null", () => {
    expect(hasPaidAccess(null)).toBe(false);
  });
  it("denies access to empty string", () => {
    expect(hasPaidAccess("")).toBe(false);
  });
  it("denies access to unknown plan strings", () => {
    expect(hasPaidAccess("enterprise")).toBe(false);
    expect(hasPaidAccess("admin")).toBe(false);
  });
});

describe("isTrialPlan", () => {
  it("identifies monthly trial", () => {
    expect(isTrialPlan("trial")).toBe(true);
  });
  it("identifies yearly trial", () => {
    expect(isTrialPlan("trial_yearly")).toBe(true);
  });
  it("does not identify paid plans as trial", () => {
    expect(isTrialPlan("monthly")).toBe(false);
    expect(isTrialPlan("yearly")).toBe(false);
    expect(isTrialPlan("pro")).toBe(false);
  });
  it("does not identify free as trial", () => {
    expect(isTrialPlan("free")).toBe(false);
    expect(isTrialPlan(undefined)).toBe(false);
  });
});

describe("isActiveSubscriber", () => {
  it("identifies active yearly subscriber", () => {
    expect(isActiveSubscriber("yearly")).toBe(true);
  });
  it("identifies active monthly subscriber", () => {
    expect(isActiveSubscriber("monthly")).toBe(true);
  });
  it("identifies legacy pro subscriber", () => {
    expect(isActiveSubscriber("pro")).toBe(true);
  });
  it("does not identify trial as active subscriber", () => {
    expect(isActiveSubscriber("trial")).toBe(false);
    expect(isActiveSubscriber("trial_yearly")).toBe(false);
  });
  it("does not identify canceling as active subscriber", () => {
    expect(isActiveSubscriber("canceling")).toBe(false);
  });
  it("does not identify free as active subscriber", () => {
    expect(isActiveSubscriber("free")).toBe(false);
    expect(isActiveSubscriber(undefined)).toBe(false);
  });
});

describe("pricing constants", () => {
  it("monthly price is $9.99", () => {
    expect(MONTHLY_PRICE_CENTS).toBe(999);
  });
  it("yearly price is $49.99", () => {
    expect(YEARLY_PRICE_CENTS).toBe(4999);
  });
  it("monthly equivalent rounds to $4.17", () => {
    expect(MONTHLY_EQUIVALENT_CENTS).toBe(Math.round(4999 / 12));
  });
  it("yearly savings is correct", () => {
    expect(YEARLY_SAVINGS_CENTS).toBe(YEARLY_IF_MONTHLY_CENTS - YEARLY_PRICE_CENTS);
  });
  it("yearly if monthly equals 12x monthly", () => {
    expect(YEARLY_IF_MONTHLY_CENTS).toBe(MONTHLY_PRICE_CENTS * 12);
  });
  it("yearly discount percent is between 40-60%", () => {
    expect(YEARLY_DISCOUNT_PERCENT).toBeGreaterThan(40);
    expect(YEARLY_DISCOUNT_PERCENT).toBeLessThan(60);
  });
  it("free tutorial limit is positive", () => {
    expect(FREE_TUTORIAL_LIMIT).toBeGreaterThan(0);
  });
});
