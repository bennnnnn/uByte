import type { TutorialStep } from "../types";
import { steps as selectStatementSteps } from "./select-statement";
import { steps as testingBasicsSteps } from "./testing-basics";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const pythonSteps: Record<string, TutorialStep[]> = {
  "select-statement": selectStatementSteps,
  "testing-basics": testingBasicsSteps,
  "variables-and-types": variablesAndTypesSteps,
};
