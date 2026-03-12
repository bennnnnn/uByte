import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as fmtPackage } from "./fmt-package";
import { steps as controlFlow } from "./control-flow";
import { steps as loops } from "./loops";
import { steps as arrays } from "./arrays";
import { steps as arraysAndSlices } from "./arrays-and-slices";
import { steps as maps } from "./maps";
import { steps as functions } from "./functions";
import { steps as pointers } from "./pointers";
import { steps as structs } from "./structs";
import { steps as methods } from "./methods";
import { steps as interfaces } from "./interfaces";
import { steps as errorHandling } from "./error-handling";
import { steps as packagesAndModules } from "./packages-and-modules";
import { steps as concurrency } from "./concurrency";
import { steps as testingBasics } from "./testing-basics";
import { steps as httpBasics } from "./http-basics";
import { steps as jsonEncoding } from "./json-encoding";
import { steps as selectStatement } from "./select-statement";

export const goSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  // "variables" and "data-types" steps load from content/go/*.steps.json (no TS fallback needed)
  "fmt-package": fmtPackage,
  "control-flow": controlFlow,
  loops: loops,
  // "arrays" and "slices" are the actual tutorial slugs (separate MDX files).
  // "arrays-and-slices" is kept only as a legacy key so existing references don't break.
  arrays: arrays,
  slices: arraysAndSlices,
  maps: maps,
  functions: functions,
  pointers: pointers,
  structs: structs,
  methods: methods,
  interfaces: interfaces,
  "error-handling": errorHandling,
  "packages-and-modules": packagesAndModules,
  concurrency: concurrency,
  "testing-basics": testingBasics,
  "http-basics": httpBasics,
  "json-encoding": jsonEncoding,
  "select-statement": selectStatement,
};
