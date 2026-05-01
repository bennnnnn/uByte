import type { TutorialStep } from "../types";
import { steps as arraysAndSlicesSteps } from "./arrays-and-slices";
import { steps as httpBasicsSteps } from "./http-basics";
import { steps as interfacesSteps } from "./interfaces";
import { steps as jsonEncodingSteps } from "./json-encoding";
import { steps as loopsSteps } from "./loops";
import { steps as mapsSteps } from "./maps";
import { steps as methodsSteps } from "./methods";
import { steps as packagesAndModulesSteps } from "./packages-and-modules";
import { steps as pointersSteps } from "./pointers";
import { steps as printFormattingSteps } from "./print-formatting";
import { steps as selectStatementSteps } from "./select-statement";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const rustSteps: Record<string, TutorialStep[]> = {
  "arrays-and-slices": arraysAndSlicesSteps,
  "http-basics": httpBasicsSteps,
  "interfaces": interfacesSteps,
  "json-encoding": jsonEncodingSteps,
  "loops": loopsSteps,
  "maps": mapsSteps,
  "methods": methodsSteps,
  "packages-and-modules": packagesAndModulesSteps,
  "pointers": pointersSteps,
  "print-formatting": printFormattingSteps,
  "select-statement": selectStatementSteps,
  "variables-and-types": variablesAndTypesSteps,
};
