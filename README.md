# Codino

> A narrative-driven coding education game for children aged 7-8

Codino is an educational game that teaches fundamental programming concepts through personalized storytelling. Children write real code in a simple mini-language while following their own adventure story, powered by AI-generated challenges.

## Features

- **Personal Story-Driven Learning** - Every playthrough is unique based on the child's own story
- **Real Text-Based Programming** - Not drag-and-drop blocks, but actual code with syntax
- **Bilingual Support** - Full Italian/English support with instant language switching
- **AI-Powered Challenges** - Claude generates personalized coding problems based on the story
- **Visual Execution** - Animated line-by-line code execution with variable tracking
- **Child-Friendly Errors** - Helpful, encouraging error messages designed for young learners
- **Progressive Difficulty** - 10 levels covering variables, math, loops, and conditionals
- **Star Ratings** - AI-evaluated code quality feedback
- **No Backend Required** - Pure frontend app, user provides their own Anthropic API key

## Screenshots

> Note: Screenshots to be added after UI polish is complete. The game features:
> - A winding map visualization showing progress through 10 levels
> - A split-screen code editor with problem description and syntax-highlighted editor
> - Animated execution showing variables updating in real-time
> - Celebration screens with star ratings and narrative bridges

## Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
  - Free tier includes $5 credit
  - Typical cost per game: ~$0.10-0.20
  - Keys stay in browser localStorage (never sent to our servers)

## Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/alessio/codino.git
   cd codino
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment** (optional for development)

   Create a `.env.local` file in the project root:
   ```bash
   # Optional: Add your API key here for testing
   # Note: Production users will enter their own key in the Settings screen
   VITE_ANTHROPIC_API_KEY=your-api-key-here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### For Production Use

Visit the deployed app at: [https://alessio.github.io/codino/](https://alessio.github.io/codino/)

You'll need your own Anthropic API key (enter in Settings).

## Configuration

### API Key Setup

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Click the Settings icon in Codino
3. Paste your API key in the password field
4. Click "Test Connection" to verify
5. Your key is stored in browser localStorage only

### Language Selection

Use the language toggle (🇮🇹/🇬🇧) in the navigation bar to switch between Italian and English. Everything updates instantly:
- UI text
- Keywords (RIPETI ↔ REPEAT)
- AI-generated content

## Running the Project

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run unit tests with Vitest
npm test

# Run unit tests in watch mode
npm run test

# Run unit tests with UI
npm run test:ui

# Run end-to-end tests with Playwright
npm run test:e2e

# Build the Lezer grammar (after modifying grammar file)
npm run build:grammar
```

### Running Tests

**Unit Tests:**
```bash
npm test
```

Tests cover:
- Codino language parser
- Interpreter execution
- State management
- API validation

**E2E Tests:**
```bash
npm run test:e2e
```

Tests cover:
- Complete user flows (onboarding, level completion)
- Error handling
- Settings and API key management

## Deployment

### GitHub Pages (Automatic)

The project deploys automatically to GitHub Pages on every push to `main`:

1. Push to `main` branch
2. GitHub Actions builds and tests
3. Deploys to `gh-pages` branch
4. Live at `https://<username>.github.io/codino/`

### Manual Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the static files
# Deploy dist/ to any static hosting service (Vercel, Netlify, etc.)
```

## Project Structure

```
codino/
├── src/
│   ├── features/          # Feature modules
│   │   ├── map/          # Winding path visualization
│   │   ├── editor/       # Code editor with execution
│   │   ├── execution/    # Animation and feedback
│   │   ├── story/        # Onboarding flow
│   │   └── settings/     # API key and preferences
│   ├── core/             # Core business logic
│   │   ├── language/     # Lezer parser + interpreter
│   │   ├── api/          # Claude API client
│   │   └── codemirror/   # Editor configuration
│   ├── store/            # Zustand state management
│   ├── components/       # Reusable UI components
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── tests/                # Unit and E2E tests
│   ├── unit/            # Vitest unit tests
│   └── e2e/             # Playwright E2E tests
├── specs/               # Design specifications (source of truth)
│   ├── project.md       # Project overview and architecture
│   └── <capability>.md  # One file per capability area
├── docs/                # Documentation
│   ├── USER_GUIDE.md    # End-user documentation
│   └── CONTRIBUTING.md  # Developer guide
└── public/              # Static assets

```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

### Code Editor
- **CodeMirror 6** - Professional code editor
- **Lezer** - Custom grammar for Codino language
- Syntax highlighting and autocomplete

### State Management
- **Zustand** - Lightweight state management
- **localStorage** - Persistence (no backend)

### AI Integration
- **Anthropic Claude API** - Direct client-side calls
- Used for: map generation, problem generation, hints, code rating

### Testing
- **Vitest** - Unit tests
- **Playwright** - E2E tests
- **React Testing Library** - Component tests

## The Codino Language

Codino is a simple bilingual programming language designed for 7-8 year olds.

### Example (Italian)
```codino
mele = 5
pere = 3
totale = mele + pere
SCRIVI totale

RIPETI 3 VOLTE
  SCRIVI "Ciao!"
FINE

SE totale > 7
  SCRIVI "Tante!"
ALTRIMENTI
  SCRIVI "Poche"
FINE
```

### Example (English)
```codino
apples = 5
pears = 3
total = apples + pears
WRITE total

REPEAT 3 TIMES
  WRITE "Hello!"
END

IF total > 7
  WRITE "Many!"
ELSE
  WRITE "Few"
END
```

See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for complete language reference.

## Contributing

We welcome contributions! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Read [specs/](specs/) to understand the project's design decisions and architecture
2. Check open issues or propose new features
3. Write tests for new features
4. Follow the existing code style
5. Submit a pull request

## License

ISC License - see package.json for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/alessio/codino/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alessio/codino/discussions)

## Credits

Built with:
- Claude AI by Anthropic (for challenge generation)
- CodeMirror (code editor)
- Lezer (parser generator)
- React ecosystem

## Privacy & Safety

- **No data collection** - Everything runs in the browser
- **No cloud saves** - Progress stored in localStorage only
- **API keys never leave your browser** - Direct calls to Anthropic
- **Child-safe content** - AI prompts include safety guardrails

---

Made with love for young coders ✨
