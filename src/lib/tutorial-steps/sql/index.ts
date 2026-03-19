/**
 * SQL tutorial step definitions.
 * Steps are loaded from content/sql/<slug>.steps.json at runtime.
 * This file is a fallback only.
 */
import type { TutorialStep } from "../types";

export const sqlSteps: Record<string, TutorialStep[]> = {
  "getting-started": [
    {
      title: "Your first SQL query",
      instruction: "SQL (Structured Query Language) is used to query and manipulate databases. `SELECT` retrieves data.\n\nRun this.",
      starter: "SELECT 'Hello, SQL!' AS message;",
      expectedOutput: ["Hello, SQL!"],
      successMessage: "Every SQL statement ends with `;`. `AS` gives the result column a name.",
    },
  ],
};
