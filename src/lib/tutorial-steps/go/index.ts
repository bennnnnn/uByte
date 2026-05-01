import type { TutorialStep } from "../types";
import { steps as miniProjectAgeSteps } from "./mini-project-age";

export const goSteps: Record<string, TutorialStep[]> = {
  "mini-project-age": miniProjectAgeSteps,
};
