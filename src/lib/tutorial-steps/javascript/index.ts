import type { TutorialStep } from "../types";
import { steps as testingBasicsSteps } from "./testing-basics";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const javascriptSteps: Record<string, TutorialStep[]> = {
  "testing-basics": testingBasicsSteps,
  "variables-and-types": variablesAndTypesSteps,
};
