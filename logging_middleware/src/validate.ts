import {
  stacks,
  levels,
  backendPkgs,
  frontendPkgs,
  sharedPkgs,
} from "./constants.js";

// quick check before we hit the API - saves a network call if input is wrong
export function checkInput(stack: string, level: string, pkg: string, message: string) {
  if (!stacks.includes(stack as any)) {
    throw new Error(`bad stack: ${stack}`);
  }

  if (!levels.includes(level as any)) {
    throw new Error(`bad level: ${level}`);
  }

  // pick the right package list based on stack
  const validPkgs =
    stack === "backend"
      ? [...backendPkgs, ...sharedPkgs]
      : [...frontendPkgs, ...sharedPkgs];

  if (!validPkgs.includes(pkg as any)) {
    throw new Error(`bad package "${pkg}" for ${stack}`);
  }

  if (!message || message.trim() === "") {
    throw new Error("message cannot be empty");
  }
}
