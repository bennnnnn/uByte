===============================================================
  SHADOWED .TS FILES REPORT
===============================================================
Workspace: /Users/binalfewmecuriaw/Desktop/uByte
Date: 2026-05-01

PRIORITY RULE: content/<lang>/<slug>.steps.json takes priority over
src/lib/tutorial-steps/<lang>/<slug>.ts fallback.

A .ts file is SHADOWED when its slug (as mapped in index.ts) has a
matching .steps.json file. These .ts files are dead code and can be
safely deleted.

===============================================================
GO
===============================================================
21 .steps.json | 21 .ts fallback files | 20 slugs registered

SHADOWED (can delete) — 19 files:
  src/lib/tutorial-steps/go/arrays.ts           (slug: arrays)
  src/lib/tutorial-steps/go/arrays-and-slices.ts (slug: slices)
  src/lib/tutorial-steps/go/concurrency.ts
  src/lib/tutorial-steps/go/control-flow.ts
  src/lib/tutorial-steps/go/error-handling.ts
  src/lib/tutorial-steps/go/fmt-package.ts
  src/lib/tutorial-steps/go/functions.ts
  src/lib/tutorial-steps/go/getting-started.ts
  src/lib/tutorial-steps/go/http-basics.ts
  src/lib/tutorial-steps/go/interfaces.ts
  src/lib/tutorial-steps/go/json-encoding.ts
  src/lib/tutorial-steps/go/loops.ts
  src/lib/tutorial-steps/go/maps.ts
  src/lib/tutorial-steps/go/methods.ts
  src/lib/tutorial-steps/go/packages-and-modules.ts
  src/lib/tutorial-steps/go/pointers.ts
  src/lib/tutorial-steps/go/select-statement.ts
  src/lib/tutorial-steps/go/structs.ts
  src/lib/tutorial-steps/go/testing-basics.ts

UNREFERENCED (can delete) — 1 file (not imported in index.ts):
  src/lib/tutorial-steps/go/variables-and-types.ts

STILL NEEDED — 1 file (slug has no .steps.json):
  src/lib/tutorial-steps/go/mini-project-age.ts

===============================================================
PYTHON
===============================================================
29 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 16 files:
  src/lib/tutorial-steps/python/arrays-and-slices.ts
  src/lib/tutorial-steps/python/concurrency.ts
  src/lib/tutorial-steps/python/control-flow.ts
  src/lib/tutorial-steps/python/error-handling.ts
  src/lib/tutorial-steps/python/functions.ts
  src/lib/tutorial-steps/python/getting-started.ts
  src/lib/tutorial-steps/python/http-basics.ts
  src/lib/tutorial-steps/python/interfaces.ts
  src/lib/tutorial-steps/python/json-encoding.ts
  src/lib/tutorial-steps/python/loops.ts
  src/lib/tutorial-steps/python/maps.ts
  src/lib/tutorial-steps/python/methods.ts
  src/lib/tutorial-steps/python/packages-and-modules.ts
  src/lib/tutorial-steps/python/pointers.ts
  src/lib/tutorial-steps/python/print-formatting.ts  (serves slug: fmt-package)
  src/lib/tutorial-steps/python/structs.ts

STILL NEEDED — 3 files (no matching .steps.json):
  src/lib/tutorial-steps/python/select-statement.ts
  src/lib/tutorial-steps/python/testing-basics.ts
  src/lib/tutorial-steps/python/variables-and-types.ts

===============================================================
JAVASCRIPT
===============================================================
22 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 17 files:
  src/lib/tutorial-steps/javascript/arrays-and-slices.ts
  src/lib/tutorial-steps/javascript/concurrency.ts
  src/lib/tutorial-steps/javascript/console-formatting.ts  (serves slug: fmt-package)
  src/lib/tutorial-steps/javascript/control-flow.ts
  src/lib/tutorial-steps/javascript/error-handling.ts
  src/lib/tutorial-steps/javascript/functions.ts
  src/lib/tutorial-steps/javascript/getting-started.ts
  src/lib/tutorial-steps/javascript/http-basics.ts
  src/lib/tutorial-steps/javascript/interfaces.ts
  src/lib/tutorial-steps/javascript/json-encoding.ts
  src/lib/tutorial-steps/javascript/loops.ts
  src/lib/tutorial-steps/javascript/maps.ts
  src/lib/tutorial-steps/javascript/methods.ts
  src/lib/tutorial-steps/javascript/packages-and-modules.ts
  src/lib/tutorial-steps/javascript/pointers.ts
  src/lib/tutorial-steps/javascript/select-statement.ts
  src/lib/tutorial-steps/javascript/structs.ts

STILL NEEDED — 2 files (no matching .steps.json):
  src/lib/tutorial-steps/javascript/testing-basics.ts
  src/lib/tutorial-steps/javascript/variables-and-types.ts

===============================================================
TYPESCRIPT
===============================================================
17 .steps.json | 0 .ts fallback files (only index.ts exists)

No files to shadow or keep. All steps come from .steps.json.

===============================================================
JAVA
===============================================================
22 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 18 files:
  src/lib/tutorial-steps/java/arrays-and-slices.ts
  src/lib/tutorial-steps/java/concurrency.ts
  src/lib/tutorial-steps/java/control-flow.ts
  src/lib/tutorial-steps/java/error-handling.ts
  src/lib/tutorial-steps/java/functions.ts
  src/lib/tutorial-steps/java/getting-started.ts
  src/lib/tutorial-steps/java/http-basics.ts
  src/lib/tutorial-steps/java/interfaces.ts
  src/lib/tutorial-steps/java/json-encoding.ts
  src/lib/tutorial-steps/java/loops.ts
  src/lib/tutorial-steps/java/maps.ts
  src/lib/tutorial-steps/java/methods.ts
  src/lib/tutorial-steps/java/packages-and-modules.ts
  src/lib/tutorial-steps/java/pointers.ts
  src/lib/tutorial-steps/java/print-formatting.ts  (serves slug: fmt-package)
  src/lib/tutorial-steps/java/select-statement.ts
  src/lib/tutorial-steps/java/structs.ts
  src/lib/tutorial-steps/java/testing-basics.ts

STILL NEEDED — 1 file (no matching .steps.json):
  src/lib/tutorial-steps/java/variables-and-types.ts

===============================================================
RUST
===============================================================
25 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 7 files:
  src/lib/tutorial-steps/rust/concurrency.ts
  src/lib/tutorial-steps/rust/control-flow.ts
  src/lib/tutorial-steps/rust/error-handling.ts
  src/lib/tutorial-steps/rust/functions.ts
  src/lib/tutorial-steps/rust/getting-started.ts
  src/lib/tutorial-steps/rust/structs.ts
  src/lib/tutorial-steps/rust/testing-basics.ts

STILL NEEDED — 12 files (no matching .steps.json):
  src/lib/tutorial-steps/rust/arrays-and-slices.ts
  src/lib/tutorial-steps/rust/http-basics.ts
  src/lib/tutorial-steps/rust/interfaces.ts
  src/lib/tutorial-steps/rust/json-encoding.ts
  src/lib/tutorial-steps/rust/loops.ts
  src/lib/tutorial-steps/rust/maps.ts
  src/lib/tutorial-steps/rust/methods.ts
  src/lib/tutorial-steps/rust/packages-and-modules.ts
  src/lib/tutorial-steps/rust/pointers.ts
  src/lib/tutorial-steps/rust/print-formatting.ts  (serves slug: fmt-package)
  src/lib/tutorial-steps/rust/select-statement.ts
  src/lib/tutorial-steps/rust/variables-and-types.ts

===============================================================
CPP
===============================================================
22 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 18 files:
  src/lib/tutorial-steps/cpp/arrays-and-slices.ts
  src/lib/tutorial-steps/cpp/concurrency.ts
  src/lib/tutorial-steps/cpp/control-flow.ts
  src/lib/tutorial-steps/cpp/error-handling.ts
  src/lib/tutorial-steps/cpp/functions.ts
  src/lib/tutorial-steps/cpp/getting-started.ts
  src/lib/tutorial-steps/cpp/http-basics.ts
  src/lib/tutorial-steps/cpp/interfaces.ts
  src/lib/tutorial-steps/cpp/io-formatting.ts  (serves slug: fmt-package)
  src/lib/tutorial-steps/cpp/json-encoding.ts
  src/lib/tutorial-steps/cpp/loops.ts
  src/lib/tutorial-steps/cpp/maps.ts
  src/lib/tutorial-steps/cpp/methods.ts
  src/lib/tutorial-steps/cpp/packages-and-modules.ts
  src/lib/tutorial-steps/cpp/pointers.ts
  src/lib/tutorial-steps/cpp/select-statement.ts
  src/lib/tutorial-steps/cpp/structs.ts
  src/lib/tutorial-steps/cpp/testing-basics.ts

STILL NEEDED — 1 file (no matching .steps.json):
  src/lib/tutorial-steps/cpp/variables-and-types.ts

===============================================================
CSHARP
===============================================================
25 .steps.json | 19 .ts fallback files | 19 slugs registered

SHADOWED (can delete) — 7 files:
  src/lib/tutorial-steps/csharp/control-flow.ts
  src/lib/tutorial-steps/csharp/getting-started.ts
  src/lib/tutorial-steps/csharp/http-basics.ts
  src/lib/tutorial-steps/csharp/interfaces.ts
  src/lib/tutorial-steps/csharp/loops.ts
  src/lib/tutorial-steps/csharp/methods.ts
  src/lib/tutorial-steps/csharp/testing-basics.ts

STILL NEEDED — 12 files (no matching .steps.json):
  src/lib/tutorial-steps/csharp/arrays-and-slices.ts
  src/lib/tutorial-steps/csharp/concurrency.ts
  src/lib/tutorial-steps/csharp/error-handling.ts
  src/lib/tutorial-steps/csharp/fmt-package.ts
  src/lib/tutorial-steps/csharp/functions.ts
  src/lib/tutorial-steps/csharp/json-encoding.ts
  src/lib/tutorial-steps/csharp/maps.ts
  src/lib/tutorial-steps/csharp/packages-and-modules.ts
  src/lib/tutorial-steps/csharp/pointers.ts
  src/lib/tutorial-steps/csharp/select-statement.ts
  src/lib/tutorial-steps/csharp/structs.ts
  src/lib/tutorial-steps/csharp/variables-and-types.ts

===============================================================
SQL
===============================================================
8 .steps.json | 0 .ts fallback files (only index.ts exists)

No files to shadow or keep. All steps come from .steps.json.

===============================================================
SUMMARY
===============================================================

TOTAL SHADOWED .ts FILES (can safely delete): 102
  go:        19 (+1 unreferenced = 20)
  python:    16
  javascript: 17
  typescript:  0
  java:      18
  rust:       7
  cpp:       18
  csharp:     7
  sql:        0

TOTAL STILL-NEEDED .ts FILES (no .steps.json): 33
  go:         1 (+ mini-project-age)
  python:     3
  javascript: 2
  typescript: 0
  java:       1
  rust:      12
  cpp:        1
  csharp:    12
  sql:        0

NOTE: The index.ts in each language directory must also be updated
to remove imports and map entries for deleted/shadowed files.
Leaving stale imports will cause build failures.

DIFFERENT-NAME MAPPINGS (ts file name != steps.json slug):
  go:           arrays-and-slices.ts serves slug "slices"
  python:       print-formatting.ts serves slug "fmt-package"
  javascript:   console-formatting.ts serves slug "fmt-package"
  java:         print-formatting.ts serves slug "fmt-package"
  rust:         print-formatting.ts serves slug "fmt-package"
  cpp:          io-formatting.ts serves slug "fmt-package"

UNREFERENCED FILES (not imported in any index.ts):
  go/variables-and-types.ts — completely dead code
