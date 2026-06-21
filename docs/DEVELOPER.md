# Developer Guide

Guide for developers contributing to SportsCaster.

## Project Structure

```
sportscaster/
├── client/                          # React frontend
│   ├── src/
│   │   ├── App.jsx                 # Main app with routes
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global styles
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── ProtectedRoute.jsx  # Auth route wrapper
│   │   │   ├── TemplateEditor.jsx  # Visual template editor
│   │   │   ├── CanvasEditor.jsx    # Drag-drop canvas
│   │   │   ├── PropertyPanel.jsx   # Element properties
│   │   │   ├── AnimationTimeline.jsx # Animation editor
│   │   │   ├── PreviewPanel.jsx    # Live preview
│   │   │   ├── SceneManager.jsx    # Scene management UI
│   │   │   ├── LiveControlPanel.jsx # Live broadcast control
│   │   │   └── TemplateLibrary.jsx # Template browser
│   │   ├── pages/                  # Route pages
│   │   │   ├── Home.jsx            # Dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── CreateMatch.jsx     # Match creation
│   │   │   ├── ControlPanel.jsx    # Match scoring control
│   │   │   ├── Overlay.jsx         # Broadcast overlay view
│   │   │   ├── Scoreboard.jsx      # Standalone scoreboard
│   │   │   ├── Teams.jsx           # Team management
│   │   │   ├── PointsTable.jsx     # Points table view
│   │   │   └── NotFound.jsx        # 404 page
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.jsx         # Authentication hook
│   │   │   ├── useSocket.js        # WebSocket hook
│   │   │   ├── useTheme.jsx        # Theme management
│   │   │   └── useToast.jsx        # Toast notifications
│   │   └── data/                   # Static data
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Node.js backend
│   ├── src/
│   │   ├── index.js                # Express + Socket.IO server
│   │   ├── cricketEngine.js        # Cricket scoring logic
│   │   ├── cricketEngine.test.js   # Cricket engine tests
│   │   ├── matchStore.js           # Match/team persistence
│   │   ├── authStore.js            # User/template/scene persistence
│   │   ├── socketHandlers.js       # WebSocket event handlers
│   │   ├── auth.js                 # Token auth middleware
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT auth middleware
│   │   ├── routes/                 # Express routes
│   │   │   ├── users.js            # User registration/login
│   │   │   ├── templates.js        # Template CRUD
│   │   │   ├── scenes.js           # Scene CRUD
│   │   │   ├── playlists.js        # Playlist CRUD
│   │   │   ├── live.js             # Live control
│   │   │   ├── projects.js         # Project management
│   │   │   └── previews.js         # Preview generation
│   │   ├── templateEngine/         # Template processing
│   │   │   ├── schema.js           # Template JSON schema
│   │   │   ├── validator.js        # Template validation
│   │   │   ├── parser.js           # Template parsing
│   │   │   ├── renderer.js         # Template rendering
│   │   │   ├── variables.js        # Variable binding
│   │   │   ├── animations.js       # Animation processing
│   │   │   └── index.js            # Engine entry point
│   │   ├── sceneManager/           # Scene management
│   │   │   ├── sceneModel.js       # Scene data model
│   │   │   ├── composer.js         # Scene composition
│   │   │   ├── exporter.js         # Scene export
│   │   │   ├── layerManager.js     # Layer operations
│   │   │   ├── stateManager.js     # Scene state
│   │   │   ├── transitions.js      # Scene transitions
│   │   │   └── index.js            # Manager entry point
│   │   ├── animations/             # Animation system
│   │   │   ├── presets.js          # Animation presets
│   │   │   ├── transitions.js      # Transition presets
│   │   │   ├── generator.js        # CSS animation generator
│   │   │   ├── composer.js         # Animation composition
│   │   │   ├── preview.js          # Preview generation
│   │   │   └── index.js            # Animation entry point
│   │   ├── templates/              # Built-in templates
│   │   │   ├── cricket/            # Cricket templates
│   │   │   ├── football/           # Football templates
│   │   │   ├── tennis/             # Tennis templates
│   │   │   ├── basketball/         # Basketball templates
│   │   │   └── common/             # Shared templates
│   │   └── database/               # Database migrations
│   │       ├── schema.sql          # PostgreSQL schema
│   │       ├── migrations/         # Migration files
│   │       └── index.js            # DB connection
│   ├── data/                       # JSON file storage
│   │   ├── store.json              # Matches and teams
│   │   └── authStore.json          # Users, templates, scenes
│   ├── .env                        # Environment variables
│   └── package.json
│
├── docs/                           # Documentation
├── Dockerfile                      # Docker build
├── docker-compose.yml              # Docker Compose config
└── README.md                       # Project README
```

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| React Router | 7.x | Client-side routing |
| Vite | 6.x | Build tool and dev server |
| Socket.IO Client | 4.x | Real-time communication |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.x | HTTP server |
| Socket.IO | 4.x | WebSocket server |
| nanoid | 5.x | ID generation |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 3.x | Password hashing |

### Styling

- Custom CSS design system
- Glass morphism effects
- Dark/Luxe theme
- Google Fonts: Inter, Outfit, Teko, Rajdhani

---

## Development Setup

### Prerequisites

- Node.js 20+ (recommend using nvm)
- npm 9+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sportscaster

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running in Development

```bash
# Terminal 1: Start server
cd server
npm run dev
# Server runs on http://localhost:3001 with auto-reload

# Terminal 2: Start client
cd client
npm run dev
# Client runs on http://localhost:5173 with HMR
```

The client dev server proxies API and WebSocket requests to the server.

### Environment Variables

Create `server/.env`:

```env
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
# ADMIN_TOKEN=your-admin-token
```

---

## Code Style

### JavaScript

- ES Modules (`import`/`export`)
- Use `const` and `let`, never `var`
- Prefer arrow functions for callbacks
- Use template literals for string interpolation
- Follow existing naming conventions (camelCase for variables/functions)

### React

- Functional components only
- Use hooks for state and side effects
- Keep components small and focused
- Extract reusable logic into custom hooks

### CSS

- Use CSS custom properties (variables) for theming
- Follow BEM-like naming convention
- Keep styles scoped to components

---

## Testing

### Running Tests

```bash
# Run all server tests
cd server
npm test

# Run specific test file
node --test src/cricketEngine.test.js
```

### Writing Tests

Tests use Node.js built-in test runner (`node:test`):

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createMatchState } from './cricketEngine.js';

describe('Cricket Engine', () => {
  it('should create a match state', () => {
    const match = createMatchState({
      matchId: 'test_123',
      teamA: 'Team A',
      teamB: 'Team B'
    });
    assert.strictEqual(match.status, 'NOT_STARTED');
    assert.strictEqual(match.teams.a.name, 'Team A');
  });
});
```

### Test Coverage

Focus tests on:
- Cricket engine logic (pure functions)
- Template validation
- Scene validation
- API endpoint responses

---

## Contributing Guidelines

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes

### Commit Messages

Use conventional commits:

```
feat: add new template type
fix: resolve score update race condition
docs: update API documentation
refactor: extract cricket engine functions
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add/update tests if applicable
4. Ensure all tests pass (`npm test`)
5. Update documentation if needed
6. Submit a pull request

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass
- [ ] No console errors or warnings
- [ ] Documentation updated (if applicable)
- [ ] No sensitive data committed

---

## Database Schema

### PostgreSQL Schema (Planned)

The project includes a PostgreSQL schema for future database migration:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Templates Table
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  sport VARCHAR(50),
  definition JSONB NOT NULL,
  preview_url VARCHAR(500),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Scenes Table
```sql
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layers JSONB NOT NULL DEFAULT '[]',
  transitions JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Current Storage

Currently using JSON file storage:

- `server/data/store.json` — Matches and teams
- `server/data/authStore.json` — Users, templates, scenes, playlists, live state

Data is persisted with 500ms debounce to avoid excessive disk writes.

---

## Architecture Decisions

### Why JSON File Storage?

For the initial version, JSON file storage was chosen for:
- Zero database setup required
- Easy development and testing
- Portable deployment
- Sufficient for single-server deployments

### Why Socket.IO?

Socket.IO provides:
- Automatic reconnection
- Room-based broadcasting (match rooms)
- Fallback to HTTP long-polling
- Built-in event handling

### Why Pure Functions for Cricket Engine?

The cricket engine uses pure functions for:
- Easy testing (no mocks needed)
- Predictable state updates
- Undo support (state snapshots)
- No side effects

---

## Debugging

### Server Logs

The server logs important events:

```
📁 Serving production build from /path/to/client/dist
📂 Loaded 5 matches, 3 teams from disk
⚡ Client connected: abc123
Match created: m_abc123 — Team A vs Team B
```

### Client Debugging

Open browser DevTools:

1. **Console** — Check for JavaScript errors
2. **Network** — Monitor API and WebSocket requests
3. **Application** — Inspect local storage and state

### WebSocket Debugging

Socket.IO includes a debug mode:

```bash
# Server
DEBUG=socket.io* npm run dev

# Client (browser console)
localStorage.debug = 'socket.io-client:*';
```

---

## Performance Considerations

### Client

- Use React.memo for expensive components
- Debounce rapid updates (score updates)
- Lazy load routes with React.lazy
- Optimize bundle size with Vite

### Server

- Debounce disk writes (500ms)
- Limit undo stack size (100 entries)
- Use rooms for targeted broadcasting
- Clean up disconnected clients

---

## Editor Component Architecture

### Component Hierarchy

```
TemplateEditor
├── CanvasEditor          # Main canvas with grid, rulers, guides
│   ├── ElementRenderer   # Renders each element type
│   ├── SelectionManager  # Handles multi-select, group select
│   ├── DragDropManager   # Handles drag and drop operations
│   └── GridOverlay       # Grid and snap functionality
├── PropertyInspector     # Property editing panel
│   ├── PositionProperties
│   ├── TypographyProperties
│   ├── ColorProperties
│   ├── EffectsProperties
│   └── BindingProperties
├── LayerPanel            # Layer management
│   ├── LayerList         # Sortable layer list
│   └── LayerControls     # Visibility, lock, opacity
├── TimelinePanel         # Animation timeline
│   ├── KeyframeEditor    # Edit animation keyframes
│   └── TimelineControls  # Play, pause, scrub
├── ElementToolbar        # Add elements toolbar
├── HistoryManager        # Undo/redo functionality
└── KeyboardShortcuts     # Keyboard shortcut handler
```

### State Management

The editor uses React context for state management:

```javascript
// EditorContext provides:
{
  template: Template,        // Current template being edited
  selectedElements: string[], // Selected element IDs
  clipboard: Element[],       // Copied elements
  history: HistoryState,      // Undo/redo stacks
  canvas: CanvasState,       // Zoom, pan, grid settings
  tools: ToolState           // Active tool, modes
}
```

### Element Model

```javascript
{
  id: string,              // Unique identifier
  type: 'text' | 'shape' | 'image' | 'score' | 'timer' | 'ticker',
  position: {
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    zIndex: number
  },
  style: {
    // Type-specific styles
    fontSize?: string,
    fontWeight?: string,
    color?: string,
    background?: string,
    borderRadius?: string,
    boxShadow?: string,
    // ... more properties
  },
  content?: string,        // Static content
  binding?: string,        // Dynamic data binding path
  animation?: {
    enter?: AnimationPreset,
    exit?: AnimationPreset,
    effect?: AnimationPreset
  },
  locked?: boolean,
  visible?: boolean,
  opacity?: number
}
```

---

## Property System

### Property Types

The Property Inspector supports 13 property types:

| Type | Component | Description |
|------|-----------|-------------|
| text | TextInput | Simple text input |
| number | NumberInput | Numeric input with min/max |
| color | ColorPicker | Color picker with palettes |
| select | SelectInput | Dropdown selection |
| boolean | ToggleInput | Toggle switch |
| font | FontPicker | Google Fonts selector |
| size | SizeInput | Width/Height with units |
| position | PositionInput | X/Y coordinate input |
| shadow | ShadowInput | Box shadow editor |
| border | BorderInput | Border editor |
| gradient | GradientInput | Gradient editor |
| binding | BindingInput | Data binding selector |
| animation | AnimationInput | Animation preset selector |

### Property Validation

Properties are validated before saving:

```javascript
const validators = {
  fontSize: (value) => /^\d+(\.\d+)?(px|rem|em)$/.test(value),
  color: (value) => /^#[0-9a-fA-F]{6}$/.test(value),
  number: (value, { min, max }) => value >= min && value <= max
};
```

### Custom Properties

Extend the property system with custom types:

```javascript
// Register custom property type
PropertyRegistry.register('myCustomType', {
  component: MyCustomComponent,
  validate: (value) => { ... },
  serialize: (value) => { ... },
  deserialize: (value) => { ... }
});
```

---

## Data Binding System

### Binding Architecture

```
Template Definition
    │
    ▼
Binding Parser
    │
    ▼
┌─────────────────────────────────────────┐
│           Binding Registry              │
├─────────────────────────────────────────┤
│  Match State    │  Team Data            │
│  ├── status     │  ├── name             │
│  ├── venue      │  ├── short            │
│  └── ...        │  └── colors           │
│                 │                       │
│  Innings Data   │  Player Data          │
│  ├── runs       │  ├── name             │
│  ├── wickets    │  ├── runs             │
│  └── overs      │  └── stats            │
└─────────────────────────────────────────┘
    │
    ▼
Live Data Resolver
    │
    ▼
Rendered Output
```

### Binding Syntax

```javascript
// Simple binding
"binding": "innings.runs"

// Nested binding
"binding": "striker.stats.batting average"

// Template string
"binding": "{{innings.runs}}/{{innings.wickets}}"

// Conditional
"condition": "isChasing"
```

### Available Bindings

The binding system provides 50+ fields across these categories:

1. **Match State** (6 fields) - status, venue, tournament, etc.
2. **Team Data** (8 fields) - names, colors, short names
3. **Innings Data** (10 fields) - runs, wickets, overs, rates
4. **Batter Data** (12 fields) - runs, balls, fours, sixes, SR
5. **Bowler Data** (8 fields) - overs, maidens, runs, wickets, economy
6. **Calculated Fields** (6+ fields) - run rate, required rate, etc.

### Custom Bindings

Add custom binding sources:

```javascript
// Register custom binding provider
BindingRegistry.register('myProvider', {
  resolve: (path, matchState) => {
    // Custom resolution logic
    return value;
  },
  schema: {
    // Available paths for autocomplete
    'myField': { type: 'string', description: 'My custom field' }
  }
});
```

---

## Export System

### Export Architecture

```
Export Request
    │
    ▼
┌─────────────────────────────────────────┐
│           Export Manager                │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │   HTML      │  │   Image     │      │
│  │   Exporter  │  │   Exporter  │      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Video     │  │   Batch     │      │
│  │   Exporter  │  │   Exporter  │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           Export Worker                 │
├─────────────────────────────────────────┤
│  1. Parse template/scene                │
│  2. Resolve bindings                    │
│  3. Generate HTML/CSS                   │
│  4. Apply animations                    │
│  5. Render to output format             │
│  6. Optimize/compress                   │
└─────────────────────────────────────────┘
    │
    ▼
Export Result
```

### Export Formats

#### HTML Export

Generates standalone HTML files:

```javascript
const htmlExporter = {
  formats: ['static', 'obs', 'vmix', 'wirecast', 'embed'],
  
  async export(template, options) {
    const html = await generateHTML(template, options);
    const optimized = await optimizeHTML(html, options);
    return {
      content: optimized,
      filename: `${template.name}.html`,
      mimeType: 'text/html'
    };
  }
};
```

#### Image Export

Generates static images:

```javascript
const imageExporter = {
  formats: ['png', 'jpeg', 'webp'],
  
  async export(template, options) {
    const html = await generateHTML(template, options);
    const image = await renderToImage(html, options);
    return {
      content: image.toString('base64'),
      filename: `${template.name}.${options.format}`,
      mimeType: `image/${options.format}`
    };
  }
};
```

#### Video Export

Generates animated videos:

```javascript
const videoExporter = {
  formats: ['mp4', 'webm', 'gif'],
  
  async export(template, options) {
    const html = await generateHTML(template, options);
    const video = await renderToVideo(html, options);
    return {
      content: video.toString('base64'),
      filename: `${template.name}.${options.format}`,
      mimeType: `video/${options.format}`
    };
  }
};
```

### Export Presets

Pre-configured export settings:

```javascript
const EXPORT_PRESETS = {
  obs: {
    format: 'html',
    htmlFormat: 'obs',
    width: 1920,
    height: 1080,
    background: 'transparent'
  },
  youtube: {
    format: 'image',
    imageFormat: 'png',
    quality: 80,
    width: 1920,
    height: 1080
  },
  social: {
    format: 'image',
    imageFormat: 'png',
    quality: 80,
    width: 1200,
    height: 630
  }
};
```

### Export Queue

Manages concurrent exports:

```javascript
class ExportQueue {
  constructor() {
    this.jobs = new Map();
    this.maxConcurrent = 3;
    this.processing = 0;
  }
  
  async addJob(job) {
    this.jobs.set(job.id, { ...job, status: 'pending' });
    await this.processNext();
  }
  
  async processNext() {
    if (this.processing >= this.maxConcurrent) return;
    const pending = [...this.jobs.values()].find(j => j.status === 'pending');
    if (!pending) return;
    
    this.processing++;
    pending.status = 'processing';
    
    try {
      const result = await processExport(pending);
      pending.status = 'completed';
      pending.result = result;
    } catch (error) {
      pending.status = 'failed';
      pending.error = error.message;
    } finally {
      this.processing--;
      await this.processNext();
    }
  }
}
```

---

## Future Enhancements

- [ ] PostgreSQL migration for production
- [ ] Redis for session management
- [ ] Multi-server support with Redis pub/sub
- [ ] Template marketplace
- [ ] Video overlay support
- [ ] Replay system
- [ ] Multi-language support
- [ ] Mobile native apps
