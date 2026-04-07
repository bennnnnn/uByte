# uByte Tutorial Content Style Guide

## Voice & Tone

Write like a senior dev friend explaining something over coffee — not a textbook, not a YouTube hype channel. Warm, direct, occasionally funny, always respectful of the reader's intelligence.

**Do:** "Think of a variable as a labeled box. You write 'age' on the outside, put 25 inside. Later you can peek inside or swap the 25 for 26."
**Don't:** "A variable is a named storage location in memory that holds a value of a specific type."
**Don't:** "OMG VARIABLES ARE SO COOL LET'S GOOO 🔥🔥🔥"

## The Golden Rules

### 1. Every concept gets an analogy FIRST

Before showing syntax, give the reader a mental model they already understand.

- **Pointers** → "A pointer is like a Post-it note with a storage unit number. The note isn't the stuff — it's the address where the stuff lives."
- **Interfaces** → "An interface is like a job description. It doesn't care who you are — just whether you can do the work."
- **Goroutines** → "Imagine you're cooking dinner. You put rice on the stove, then start chopping vegetables while it cooks. That's concurrency — doing useful work while waiting."
- **Maps** → "A map is like a contacts app. You look someone up by name (the key) and get their phone number (the value)."
- **Structs** → "A struct is a custom form you design. A 'Person' form has fields for name, age, and email. You fill out one form per person."
- **Error handling** → "Go doesn't have exceptions that explode like grenades. Instead, functions politely hand you an error value: 'Here's your result, and by the way, here's what went wrong (if anything).'"

### 2. Each step builds ONE concept

Never introduce two new things in one step. If a step uses variables AND loops, the reader should already know variables from a previous step.

**Step progression for a tutorial:**
1. Show the concept working (just run it)
2. Modify something small (change a value)
3. Add something (extend the code)
4. Explain the why (how it works under the hood)
5. Break something on purpose (learn from errors)
6. Build something from scratch (prove you get it)

### 3. Instructions are 2-4 sentences max

The instruction panel is small. Get to the point.

**Do:**
```
`:=` is the shortcut for creating a variable in Go.

Left side = the name. Right side = the value. Go figures out the type automatically.

Create a variable called `city` with your city name and print it.
```

**Don't:**
```
In Go, the `:=` operator is known as the short variable declaration operator. It was introduced to provide a more concise syntax for declaring and initializing variables within function bodies. Unlike the `var` keyword, which requires explicit type specification or relies on type inference when an initializer is provided, the `:=` operator always performs type inference based on the right-hand side expression...
```

### 4. Success messages are encouraging + educational

After the reader passes a step, the success message should:
- Acknowledge what they did ("You just built a working web server in 8 lines.")
- Connect it to the bigger picture ("Every API you'll ever build starts like this.")
- Tease what's next ("Next up: handling different URL paths.")

**Do:** "You just used a pointer to change a value from outside a function. This is exactly how Go avoids copying huge structs around — pass the address, not the whole thing."

**Don't:** "Correct! You used a pointer."

### 5. Use humor — but don't force it

Humor works when it's natural and makes a concept stick. It fails when it's random or tries too hard.

**Good humor (makes the concept memorable):**
- "Go is case-sensitive — `Println` works, `println` doesn't. It's like texting your boss: capitalization matters."
- "A nil pointer is like an empty parking spot number. The spot exists, but there's no car there. If you try to drive it... crash."
- "Without the `import` line, `fmt.Println` doesn't exist. It's like trying to use an app you never installed."

**Bad humor (distracting):**
- "Variables are like my ex — they can change at any time! 😂"
- "Pointers go brrrrr"

### 6. Error steps are learning opportunities

Include at least 1-2 "bug hunt" steps per tutorial. Present broken code and ask the reader to fix it. This teaches debugging — the most important real-world skill.

```json
{
  "title": "Bug hunt 🔍",
  "instruction": "This code has a sneaky bug. Run it, read the error, fix it.\n\nGo's error messages are actually helpful — they tell you the line number and what went wrong.",
  "hint": "Look at line 6. The variable name doesn't match.",
  "starter": "...",
  "expectedOutput": ["..."]
}
```

### 7. Final step = build something real

Every tutorial should end with a "put it all together" step where the reader writes code from minimal scaffolding. This proves mastery and feels rewarding.

```json
{
  "title": "Build a mini address book 📒",
  "instruction": "Use everything you learned — maps, loops, and fmt — to build a small address book.\n\nStore 3 people with their phone numbers, then print each one.",
  "starter": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\n}",
  "expectedOutput": [],
  "codeChecks": [...]
}
```

## Content Structure Per Language

### Getting Started (Tutorial 1)
- Start with WHY this language matters (real companies, real products)
- First step: just press Run (zero friction)
- Teach: print, run, read errors, write from scratch
- End with: "You're officially a [language] programmer"

### Variables (Tutorial 2)
- Analogy: labeled boxes
- Progression: create → read → update → multiple → zero values → debug → build

### Control Flow (Tutorial 3-4)
- Analogy: "if/else is like a fork in the road"
- Analogy: "switch is like a restaurant menu — pick one option"
- Include real-world examples (age checks, grade calculators)

### Loops (Tutorial 5)
- Analogy: "a loop is like a playlist on repeat"
- Start with counting, then iterate over collections
- Include the classic off-by-one bug as a debug step

### Collections (Tutorial 6-7)
- Arrays/Slices: "a row of lockers, each with a number"
- Maps: "a phone book / contacts app"
- Include practical examples (word counting, inventory)

### Functions (Tutorial 8)
- Analogy: "a function is a recipe — name, ingredients (params), result (return)"
- Build up: no params → with params → with return → multiple returns

### Advanced topics (Tutorial 9+)
- Pointers, structs, interfaces, concurrency, etc.
- Each gets its own dedicated analogy
- More complex build steps at the end

## Formatting Rules

### Instruction text
- Use `backticks` for code references inline
- Use \\n\\n for paragraph breaks (renders as line breaks in the UI)
- Bold with ** for emphasis (renders in the instruction panel)
- Keep to 2-4 sentences per instruction

### Starter code
- Always compilable/runnable (even if the output is wrong for bug-hunt steps)
- Include comments in starter code only when they help orientation
- Use realistic variable names (not `x`, `y`, `foo`, `bar`)

### Expected output
- Use `expectedOutput: []` when the step uses `codeChecks` instead
- Use exact strings when the output must match precisely
- For bug-hunt steps, use the CORRECTED output as expectedOutput

### Code checks
- Use `codeChecks` when output varies (e.g., "print your name")
- `required: true` = the pattern MUST appear
- `required: false` = the pattern must NOT appear (anti-pattern check)
- Keep regex patterns simple and well-tested

### Hints
- Start with the gentlest nudge ("Look at line 3")
- Never give away the full answer
- Reference the specific line or concept that's wrong

## Emoji Usage

Use sparingly in titles only. One emoji per title max. Good uses:
- 🔍 for debug/bug-hunt steps
- ✍️ for "write from scratch" steps
- 🎉 for final/celebration steps
- 🐹🐍🟨☕🦀⚙️💜🔷🗄️ for language-specific headers

Never use emoji in instruction text or success messages.

## Incremental Difficulty Curve

Each tutorial should feel like climbing a gentle hill, not a cliff:

```
Step 1-2:  "Just run this" / "Change one thing"     (confidence builder)
Step 3-4:  "Add something" / "Try two things"        (skill building)
Step 5-6:  "Here's why" / "What happens when..."     (understanding)
Step 7-8:  "Fix the bug" / "Spot the mistake"        (debugging)
Step 9-10: "Build it yourself" / "Put it all together" (mastery proof)
```

The reader should never feel lost. If they do, the previous step didn't teach enough.
