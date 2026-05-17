import type { TutorialStep } from "../types";
import { steps as ioFormattingSteps } from "./io-formatting";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const cppSteps: Record<string, TutorialStep[]> = {
  "io-formatting": ioFormattingSteps,
  "variables-and-types": variablesAndTypesSteps,
};
