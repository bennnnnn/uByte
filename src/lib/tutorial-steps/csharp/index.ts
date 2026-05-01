import type { TutorialStep } from "../types";
import { steps as arraysAndSlicesSteps } from "./arrays-and-slices";
import { steps as concurrencySteps } from "./concurrency";
import { steps as errorHandlingSteps } from "./error-handling";
import { steps as fmtPackageSteps } from "./fmt-package";
import { steps as functionsSteps } from "./functions";
import { steps as jsonEncodingSteps } from "./json-encoding";
import { steps as mapsSteps } from "./maps";
import { steps as packagesAndModulesSteps } from "./packages-and-modules";
import { steps as pointersSteps } from "./pointers";
import { steps as selectStatementSteps } from "./select-statement";
import { steps as structsSteps } from "./structs";
import { steps as variablesAndTypesSteps } from "./variables-and-types";

export const csharpSteps: Record<string, TutorialStep[]> = {
  "arrays-and-slices": arraysAndSlicesSteps,
  "concurrency": concurrencySteps,
  "error-handling": errorHandlingSteps,
  "fmt-package": fmtPackageSteps,
  "functions": functionsSteps,
  "json-encoding": jsonEncodingSteps,
  "maps": mapsSteps,
  "packages-and-modules": packagesAndModulesSteps,
  "pointers": pointersSteps,
  "select-statement": selectStatementSteps,
  "structs": structsSteps,
  "variables-and-types": variablesAndTypesSteps,
};
