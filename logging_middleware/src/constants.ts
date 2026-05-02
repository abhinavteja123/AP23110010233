// allowed values for the log API
// keeping these as plain arrays so we can easily check with .includes()

export const API_BASE = "http://20.207.122.201/evaluation-service";

export const stacks = ["backend", "frontend"] as const;
export const levels = ["debug", "info", "warn", "error", "fatal"] as const;

// backend-only packages
export const backendPkgs = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
] as const;

// frontend-only packages
export const frontendPkgs = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
] as const;

// shared packages (work for both)
export const sharedPkgs = ["auth", "config", "middleware", "utils"] as const;

export type Stack = typeof stacks[number];
export type Level = typeof levels[number];
export type Package =
  | typeof backendPkgs[number]
  | typeof frontendPkgs[number]
  | typeof sharedPkgs[number];
