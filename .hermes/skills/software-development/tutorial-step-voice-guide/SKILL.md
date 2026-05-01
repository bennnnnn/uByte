---
name: tutorial-step-voice-guide
description: When writing or rewriting tutorial step files (TutorialStep[]), use the "talking-computer" voice where the program/code speaks directly to the user in first person.
---

# Tutorial Step Voice Guide

## Voice Pattern

Every instruction must sound like the **program itself is talking to the user**. Personify the computer/code:

- `fmt.Println()` = "I'm the computer's megaphone — whatever you put between the quotes, I shout to the screen"
- `if` = "I'm the `if` statement — I check if something is true. If it is, I run the code inside my curly braces"
- `for` = "I'm the `for` loop — I repeat things"
- `:=` = variables as "sticky notes"
- `import` = "I bring in helpers from Go's standard library"
- Arrays = "I'm a fixed shelf with N slots"
- Slices = "I can grow — like a shelf the library adds new sections to"
- Maps = "I'm a lookup table — give me a key and I'll give you back the value"
- Functions = "I take inputs, do work, and return a result"
- Structs = "I group related fields together like a library catalog card"
- Pointers = "I store the address, not the value — I point to where the book lives"
- Interfaces = "I define what a type CAN do, not what it IS"
- JSON = "I turn your Go structs into text any program can read"
- HTTP handlers = "I'm the library's front desk — when someone visits my URL, I answer"
- Tests = "I check that my code does what I expect"
- Goroutines = "I run in the background alongside everything else"
- select = "I wait on multiple channel operations and run whichever is ready first"
- Errors = "When something goes wrong, I tell you what happened instead of crashing"

## Structure Requirements

Each step (TutorialStep) must have:
- `title` — short, descriptive
- `instruction` — uses talking-computer voice, references the library story context
- `starter` — template literal with `package main`, `import "fmt"`, `\\t` indentation, and a **plain English comment** telling the user what to write
- `expectedOutput` — array of case-insensitive substring matches
- `hint` — concise and specific

## Connected Narrative

All Go tutorials tell one connected story: **building a library management system**.
Each lesson builds on the previous. The order is:
1. Getting Started (print, variables)
2. The fmt Package (formatting)
3. Control Flow (if, switch)
4. Loops (for, range)
5. Arrays (fixed collections)
6. Slices (dynamic collections)
7. Maps (lookup tables)
8. Functions (reusable helpers)
9. Structs (data modeling)
10. Pointers (memory addresses)
11. Methods (type behavior)
12. Error Handling
13. Interfaces (abstractions)
14. Packages & Modules
15. JSON (serialization)
16. HTTP (web API)
17. Testing
18. Concurrency
19. Select & Channels
20. Mini Project (capstone)
