# Codino - User Guide

Welcome to Codino! This guide will help you get started with the game and learn the Codino programming language.

## What is Codino?

Codino is a game that teaches you how to write real computer code. You create your own adventure story, and then solve coding challenges based on your story. As you progress through 10 levels, you'll learn fundamental programming concepts like variables, math, loops, and conditions.

## Getting Started

### 1. First Time Setup

When you first open Codino, you'll need:

1. **Choose Your Language**: Click 🇮🇹 for Italian or 🇬🇧 for English
2. **Get an API Key**:
   - Click the Settings icon (⚙️)
   - Visit [Anthropic Console](https://console.anthropic.com/) to get a free API key
   - Paste your key and click "Test Connection"
   - Don't worry - your key stays in your browser and is never shared

3. **Create Your Story**:
   - Write a short story (2-3 sentences) about an adventure
   - Examples:
     - "A brave knight searches for treasure in a magical castle"
     - "A space explorer visits distant planets to find new friends"
     - "A young wizard learns spells to help animals in the forest"
   - Click "Start Adventure"

4. **Wait for Map Generation**:
   - The AI reads your story
   - Creates a winding path with 10 levels
   - Each level has choices (represented as branches with emojis)

### 2. Playing a Level

1. **Click a Branch** on the map to choose your element
2. **Read the Problem** - The AI creates a coding challenge based on your story
3. **Write Your Code** in the editor
4. **Click "RUN"** to see your code execute
5. **Watch the Animation** - See your code run line by line
6. **Get Feedback**:
   - ✅ **Success**: Get stars and continue
   - ❌ **Error**: Get helpful hints and try again

### 3. Understanding Results

**Star Ratings** (1-3 stars):
- ⭐ - Your code works but could be better
- ⭐⭐ - Good code with clear logic
- ⭐⭐⭐ - Excellent code that's clean and efficient

Stars don't block progress - you always move forward after completing a level!

## The Codino Language

### Bilingual Keywords

Codino supports both Italian and English keywords. Use the language toggle to switch!

| Italian | English | What it does |
|---------|---------|--------------|
| `SCRIVI` | `WRITE` | Print something |
| `RIPETI` | `REPEAT` | Start a loop |
| `VOLTE` | `TIMES` | Loop count |
| `SE` | `IF` | Check a condition |
| `ALTRIMENTI` | `ELSE` | Alternative path |
| `FINE` | `END` | End a block |
| `DA` | `FROM` | Range loop start marker |
| `A` | `TO` | Range loop end marker |
| `PARI` | `EVEN` | Even-number check |
| `DISPARI` | `ODD` | Odd-number check |

### Variables

Store values in variables (no need to declare them first):

**Italian:**
```codino
mele = 5
nome = "Mario"
```

**English:**
```codino
apples = 5
name = "Mario"
```

Variable names can be any word except reserved keywords.

**Reserved words**: uppercase keywords like `WRITE`, `IF`, `EVEN`, `FROM`, and the letter `x` are reserved and cannot be used as variable names. Their lowercase versions (`write`, `if`, `even`, `from`, `a`, `to`) are valid variable names if you want them.

### Math Operators

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| `+` | Addition | `3 + 2` | 5 |
| `-` | Subtraction | `5 - 2` | 3 |
| `x` or `*` | Multiplication | `3 x 4` | 12 |
| `:` or `/` | Division | `10 : 2` | 5 |

**Tip**: You can use either `x` or `*` for multiplication, and `:` or `/` for division!

### Print Statements

Display values or text:

**Italian:**
```codino
SCRIVI "Ciao!"
SCRIVI 42
SCRIVI mele + pere
```

**English:**
```codino
WRITE "Hello!"
WRITE 42
WRITE apples + pears
```

You can print:
- Text in quotes: `"Hello"`
- Numbers: `42`
- Variables: `apples`
- Math expressions: `apples + pears`

### Print several things on one line

Separate values with commas. They print together, joined by single spaces:

**Italian:**
```codino
mele = 5
SCRIVI "Mele:", mele
```

**English:**
```codino
apples = 5
WRITE "Apples:", apples
```

**Output:**
```
Mele: 5
```

You can list more than two parts:
```codino
WRITE "You have", coins, "coins"
```

### Loops

Repeat code multiple times:

**Italian:**
```codino
RIPETI 5 VOLTE
  SCRIVI "Ciao!"
FINE
```

**English:**
```codino
REPEAT 5 TIMES
  WRITE "Hello!"
END
```

This prints "Ciao!" (or "Hello!") 5 times.

**Important**: Always end loops with `FINE` or `END`!

### Counted loops

Sometimes you want to count from a number to another number. Use the counted-loop form — the variable `i` (or any name you choose) counts up for you:

**Italian:**
```codino
RIPETI i DA 1 A 5
  SCRIVI i
FINE
```

**English:**
```codino
REPEAT i FROM 1 TO 5
  WRITE i
END
```

**Output:**
```
1
2
3
4
5
```

The start and end can also be variables:
```codino
apples = 4
REPEAT i FROM 1 TO apples
  WRITE i
END
```

### Conditions

Make decisions in your code:

**Italian:**
```codino
SE mele > 3
  SCRIVI "Tante mele!"
ALTRIMENTI
  SCRIVI "Poche mele"
FINE
```

**English:**
```codino
IF apples > 3
  WRITE "Many apples!"
ELSE
  WRITE "Few apples"
END
```

**Comparison operators**:
- `>` - Greater than
- `<` - Less than
- `=` - Equal to

**Note**: Use `=` for both assignment and comparison. Codino knows the difference!

### Even and odd

Ask whether a number is even or odd:

**Italian:**
```codino
SE mele PARI
  SCRIVI "Numero pari!"
FINE
```

**English:**
```codino
IF apples EVEN
  WRITE "Even number!"
END
```

`DISPARI` (Italian) / `ODD` (English) work the same way for odd numbers.

### Combining Concepts

You can nest loops and conditions:

**Italian:**
```codino
counter = 0
RIPETI 10 VOLTE
  counter = counter + 1
  SE counter > 5
    SCRIVI counter
  FINE
FINE
```

**English:**
```codino
counter = 0
REPEAT 10 TIMES
  counter = counter + 1
  IF counter > 5
    WRITE counter
  END
END
```

This prints numbers 6 through 10.

## Complete Examples

### Example 1: Basic Math (Italian)

```codino
draghi = 3
cavalieri = 5
totale = draghi + cavalieri
SCRIVI "Ci sono"
SCRIVI totale
SCRIVI "personaggi!"
```

**Output:**
```
Ci sono
8
personaggi!
```

### Example 2: Loop and Condition (English)

```codino
stars = 0
REPEAT 5 TIMES
  stars = stars + 1
  IF stars = 3
    WRITE "Halfway there!"
  END
END
WRITE "Collected all stars!"
```

**Output:**
```
Halfway there!
Collected all stars!
```

### Example 3: Combined (Italian)

```codino
monete = 0
RIPETI 3 VOLTE
  monete = monete + 10
  SE monete > 20
    SCRIVI "Sei ricco!"
  ALTRIMENTI
    SCRIVI "Continua a cercare"
  FINE
FINE
SCRIVI "Totale monete:"
SCRIVI monete
```

**Output:**
```
Continua a cercare
Continua a cercare
Sei ricco!
Totale monete:
30
```

## Tips for Success

### Writing Good Code

1. **Use Clear Variable Names**:
   - ✅ Good: `apples`, `total_score`, `counter`
   - ❌ Avoid: `a`, `x`, `thing`

2. **Keep It Simple**:
   - Start with the simplest solution
   - Don't overcomplicate

3. **Test Step by Step**:
   - Write a little code
   - Run it to see if it works
   - Add more code

4. **Read Error Messages**:
   - Errors help you learn!
   - They tell you what went wrong

### Understanding Errors

**Syntax Errors** (before running):
- "You wrote RIPETTI — did you mean RIPETI?"
- "Your RIPETI needs a FINE at the end!"
- "The letter 'x' is reserved. Use another name!"

**Runtime Errors** (while running):
- "You can't divide by zero!"
- "I don't know 'total'. Did you create it?"
- "I can't add text and a number!"

**Logic Errors** (wrong output):
- Your code runs but gives wrong answer
- The AI will help explain what went wrong

### Getting Help

If you're stuck:

1. **Read the Problem Carefully**: What does it ask for?
2. **Check Your Output**: Does it match the expected result?
3. **Click "Get Help"**: The AI tutor gives hints without spoiling the answer
4. **Try Small Changes**: Adjust one thing at a time

## Game Progress

### The Map

- **Green Nodes**: Completed levels
- **Blue Branches**: Available choices (click to select)
- **Gray Nodes**: Locked (complete previous levels first)
- **Progress Bar**: Shows "Level X of 10"

### Your Progress is Saved!

Everything is automatically saved in your browser:
- Your story
- Completed levels
- Star ratings
- Current progress

**Note**: Progress is saved in this browser only. If you clear browser data, you'll lose progress.

## Settings

### Language Toggle

Switch between Italian and English anytime:
- Click 🇮🇹 or 🇬🇧 in the navigation bar
- Everything updates: UI, keywords, AI responses
- Your progress is not affected

### API Key

Your Anthropic API key:
- Stored in your browser only
- Never sent anywhere except Anthropic
- Required for AI features (problems, hints, ratings)

**Managing Your Key**:
- View/change in Settings (⚙️)
- Test connection to verify it works
- Keep it private - never share!

### Clear Progress

Reset the game and start over:
- Click "Clear Progress" in Settings
- Confirms before deleting
- Keeps your API key and language preference

## For Parents and Educators

### Educational Value

Codino teaches:
- **Computational Thinking**: Breaking problems into steps
- **Variables**: Storing and manipulating data
- **Arithmetic**: Math operations in code
- **Loops**: Repetition and iteration
- **Conditionals**: Logic and decision-making
- **Debugging**: Finding and fixing errors

### Age Appropriateness

Designed for 7-8 year olds:
- Simple, clear language
- Friendly error messages
- Encouraging feedback
- Age-appropriate story themes

### Monitoring Progress

You can check:
- Which levels are completed (green nodes on map)
- Star ratings (Settings → view progress)
- What concepts they're learning (level curriculum)

### Cost Management

Typical costs (using Anthropic API):
- ~$0.10-0.20 per complete playthrough (10 levels)
- Free tier includes $5 credit (25-50 games)
- Monitor usage in Anthropic Console

### Privacy & Safety

- **No data collection**: Everything stays in the browser
- **No accounts**: Anonymous usage
- **Content safety**: AI prompts include child-safety guardrails
- **Offline capability**: Code execution works offline (AI features need internet)

## Troubleshooting

### "Can't reach the AI right now"

**Problem**: API call failed
**Solutions**:
- Check internet connection
- Verify API key in Settings
- Try "Test Connection" in Settings
- Wait a minute and try again

### "This API key doesn't work"

**Problem**: Invalid API key
**Solutions**:
- Check for typos when entering key
- Get new key from Anthropic Console
- Ensure key starts with "sk-ant-"

### "Your output doesn't match the expected result"

**Problem**: Code runs but gives wrong answer
**Solutions**:
- Compare your output to expected output
- Check your math
- Review variable names
- Click "Get Help" for hints

### My progress disappeared

**Problem**: localStorage was cleared
**Solutions**:
- Unfortunately, progress can't be recovered
- Start a new game
- Keep browser data for next time
- Future: Export progress feature

### Code editor won't type

**Problem**: Editor not responding
**Solutions**:
- Refresh the page
- Check browser console for errors
- Try a different browser
- Report bug if persists

## Frequently Asked Questions

### Can I play on a phone?

Not recommended. Codino requires typing code, which works best on:
- Desktop computer
- Laptop
- Tablet with external keyboard

### Can I switch languages mid-game?

Yes! Use the language toggle anytime. Your progress is preserved.

### Do I need to finish in one sitting?

No. Progress auto-saves after each level. Come back anytime!

### Can I replay levels?

In v1.0, levels are "one-shot" - you move forward after completion. This preserves the narrative flow.

### What happens if I get stuck?

- Use "Get Help" for hints
- Take a break and come back
- Ask a parent or teacher
- Remember: errors are learning opportunities!

### Is my data safe?

Yes:
- Everything stays in your browser
- API key never shared
- No accounts or cloud storage
- Privacy-first design

### Can I share my story with friends?

Not yet! This feature may come in future versions.

## Level Curriculum

Here's what you'll learn at each level:

| Level | Concept | Keywords |
|-------|---------|----------|
| 1 | Variables & Print | `SCRIVI`/`WRITE`, `=`, multi-arg `WRITE` |
| 2 | Math — add/subtract | `+`, `-` |
| 3 | Math — multiply/divide | `x`/`*`, `:`/`/` |
| 4 | Simple loops | `RIPETI N VOLTE`/`REPEAT N TIMES` |
| 5 | Counted loops | `RIPETI i DA a A b`/`REPEAT i FROM a TO b` |
| 6 | Conditions — comparison | `SE`/`IF`, `>`, `<`, `=`, `ALTRIMENTI`/`ELSE` |
| 7 | Conditions — parity | `PARI`/`EVEN`, `DISPARI`/`ODD` |
| 8 | Loops + Conditions — comparison in loop | combined |
| 9 | Loops + Conditions — parity in loop | combined |
| 10 | Final challenge | all concepts together |

## Next Steps

Ready to start coding? Here's your journey:

1. ✅ Read this guide
2. ✅ Set up your API key
3. 🎯 Create your story
4. 🎯 Complete Level 1
5. 🎯 Keep going through all 10 levels!

**Remember**: Coding is about learning by doing. Make mistakes, experiment, and have fun!

---

Happy coding! 🚀
