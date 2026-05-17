import type { TutorialStep } from "../types";
import { steps as printFormattingSteps } from "./print-formatting";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const javaSteps: Record<string, TutorialStep[]> = {
  "print-formatting": printFormattingSteps,
  "variables-and-types": variablesAndTypesSteps,
};
