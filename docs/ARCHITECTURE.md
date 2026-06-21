# Architecture Document

Technical overview of the SportsCaster system design.

## System Overview

SportsCaster is a web-based broadcast graphics system designed for real-time sports scoring and overlay management. It follows a client-server architecture with WebSocket-based real-time communication.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Operator   │  │  Producer   │  │   OBS/NDI   │  │  Mobile   │ │
│  │   Browser    │  │   Browser   │  │   Browser   │  │  Browser  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                 │               │       │
│         └─────────────────┼─────────────────┼───────────────┘       │
│                           │                 │                       │
│                    HTTP + WebSocket          │                       │
└───────────────────────────┼─────────────────┼───────────────────────┘
                            │                 │
┌───────────────────────────┼─────────────────┼───────────────────────┐
│                       SERVER                                        │
│  ┌────────────────────────┴─────────────────┴──────────────────┐   │
│  │                    Express + Socket.IO                      │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   REST API   │  │   WebSocket  │  │   Auth       │     │   │
│  │  │   Routes     │  │   Handlers   │  │   Middleware  │     │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │   │
│  │         │                 │                 │               │   │
│  │  ┌──────┴─────────────────┴─────────────────┴──────────┐   │   │
│  │  │                   Core Services                     │   │   │
│  │  ├──────────────────────────────────────────────────────┤   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │   │
│  │  │  │   Cricket    │  │   Template   │  │   Scene   │ │   │   │
│  │  │  │   Engine     │  │   Engine     │  │  Manager  │ │   │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────┘ │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │   │
│  │  │  │   Animation  │  │   Match      │  │   Auth    │ │   │   │
│  │  │  │   System     │  │   Store      │  │   Store   │ │   │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────┘ │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              Persistence Layer                       │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │   │
│  │  │  │  store.json  │  │authStore.json│  │ PostgreSQL│ │   │   │
│  │  │  │  (Matches,   │  │ (Users,      │  │ (Future)  │ │   │   │
│  │  │  │   Teams)     │  │  Templates,  │  │           │ │   │   │
│  │  │  │              │  │  Scenes)     │  │           │ │   │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────┘ │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Client Components

```
App
├── ThemeProvider          # Dark/Light theme context
├── AuthProvider           # Authentication context
├── ToastProvider          # Toast notification context
├── BrowserRouter          # Client-side routing
│   ├── Navbar             # Navigation bar
│   └── Routes
│       ├── Home           # Dashboard
│       ├── Login          # Authentication
│       ├── Register       # User registration
│       ├── CreateMatch    # Match creation form
│       ├── ControlPanel   # Match scoring control
│       ├── Overlay        # Broadcast overlay view
│       ├── Scoreboard     # Standalone scoreboard
│       ├── Teams          # Team management
│       ├── PointsTable    # Tournament standings
│       ├── TemplateEditor # Visual template editor
│       │   ├── CanvasEditor    # Drag-drop canvas with grid, rulers, guides
│       │   ├── PropertyInspector # Element properties (13 types)
│       │   ├── LayerPanel      # Layer management
│       │   ├── TimelinePanel   # Animation timeline
│       │   ├── ElementToolbar  # Element creation tools
│       │   ├── HistoryManager  # Undo/redo functionality
│       │   └── KeyboardShortcuts # Keyboard shortcut handler
│       ├── SceneManager   # Scene management
│       ├── LiveControlPanel # Live broadcast control
│       └── TemplateLibrary # Template browser with import/export, versioning, sharing
```

### Server Components

```
Server (Express + Socket.IO)
├── Routes
│   ├── /api/users         # User authentication
│   ├── /api/matches       # Match CRUD
│   ├── /api/teams         # Team management
│   ├── /api/templates     # Template CRUD
│   ├── /api/scenes        # Scene CRUD
│   ├── /api/playlists     # Playlist management
│   ├── /api/live          # Live control
│   ├── /api/projects      # Project management
│   ├── /api/preview       # Preview generation
│   └── /api/exports       # Export endpoints (HTML, Image, Video, Batch)
├── Socket Handlers
│   ├── Match Events       # Real-time scoring
│   ├── Scene Events       # Scene management
│   ├── Live Events        # Live control
│   └── Collaboration      # Multi-user collaboration
├── Core Services
│   ├── Cricket Engine     # Scoring logic
│   ├── Template Engine    # Template processing
│   ├── Scene Manager      # Scene composition
│   ├── Animation System   # Animation generation
│   ├── Export Worker      # Export processing (HTML, Image, Video)
│   └── Version Manager    # Template versioning
└── Stores
    ├── Match Store        # Match/team persistence
    └── Auth Store         # User/template/scene persistence
```

---

## Data Flow

### Match Scoring Flow

```
Operator Action (Score Update)
    │
    ▼
Socket.IO Client ──────► Socket Handler
    │                         │
    │                         ▼
    │                    Cricket Engine
    │                         │
    │                         ▼
    │                    Match Store ──────► JSON File
    │                         │
    │                         ▼
    │                    Broadcast to Room
    │                         │
    ▼                         ▼
Overlay Client ◄──────── WebSocket
    │
    ▼
Template Renderer
    │
    ▼
DOM Update (Overlay)
```

### Template Rendering Flow

```
Template Definition (JSON)
    │
    ▼
Template Engine
    ├── Parse Elements
    ├── Validate Schema
    ├── Apply Bindings (Match State)
    ├── Generate CSS
    └── Compose HTML
         │
         ▼
    Rendered Overlay
```

### Scene Composition Flow

```
Scene Definition
    │
    ▼
Scene Manager
    ├── Load Layers
    ├── Apply Templates
    ├── Set Positions
    ├── Apply Visibility
    ├── Apply Opacity
    └── Generate Transitions
         │
         ▼
    Composed Scene
         │
         ▼
    Live Output
```

---

## Real-Time Communication

### WebSocket Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Operator   │     │   Producer   │     │   Overlay    │
│   Client     │     │   Client     │     │   Client     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                     Socket.IO Server
                            │
                    ┌───────┴───────┐
                    │    Rooms      │
                    │  (match IDs)  │
                    └───────────────┘
```

### Room-Based Broadcasting

1. **Match Room** — Each match has a room (`match:{matchId}`)
2. **Project Room** — Collaboration rooms (`project:{projectId}`)
3. **Broadcast** — Live state updates to all connected clients

### Event Types

| Event | Scope | Description |
|-------|-------|-------------|
| `match:state` | Room | Full match state update |
| `score:update` | Room | Ball-by-ball scoring |
| `overlay:command` | Room | Overlay control |
| `live:state-update` | Global | Live broadcast state |
| `scene:updated` | Global | Scene changes |

---

## Security Considerations

### Authentication

- JWT-based authentication with configurable expiration
- Role-based access control (admin, producer, operator)
- Project-level permissions (admin, editor, viewer)
- Legacy admin token support for backward compatibility

### Authorization Levels

```
Admin ──────────► Full system access
    │
Producer ───────► Template/scene management, live control
    │
Operator ───────► Match scoring, basic overlay control
    │
Viewer ─────────► Read-only access
```

### Data Protection

- Passwords hashed with bcrypt
- JWT tokens signed with configurable secret
- CORS configured for allowed origins only
- No sensitive data in client-side storage

### WebSocket Security

- Room-based access control
- Authentication required for mutations
- Input validation on all events
- Rate limiting recommended for production

---

## Scalability

### Current Limitations

- Single-server architecture
- JSON file storage
- In-memory state management
- No horizontal scaling

### Scaling Strategies

#### Vertical Scaling

- Increase server resources (CPU, RAM)
- Use SSD storage for faster I/O
- Enable Node.js clustering

#### Horizontal Scaling (Future)

```
┌─────────────┐
│    Load     │
│   Balancer  │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌─────┐   ┌─────┐
│ S1  │   │ S2  │
└──┬──┘   └──┬──┘
   │         │
   └────┬────┘
        │
   ┌────┴────┐
   │  Redis  │
   │  Pub/Sub│
   └─────────┘
```

Required changes:
- Redis for shared state and pub/sub
- PostgreSQL for persistent storage
- Session management across servers
- Sticky sessions or shared state

### Performance Optimization

#### Client-Side

- React.memo for expensive components
- Debounced updates for rapid changes
- Lazy loading for routes
- Virtual scrolling for large lists

#### Server-Side

- Debounced disk writes (500ms)
- In-memory caching for frequent reads
- Connection pooling (future PostgreSQL)
- Compression middleware

---

## Database Design

### Current: JSON File Storage

```
server/data/
├── store.json          # Matches, Teams
└── authStore.json      # Users, Templates, Scenes, Playlists, Live State
```

**Pros:**
- Zero setup
- Easy backup (copy files)
- Portable

**Cons:**
- No concurrent access safety
- Limited query capabilities
- Single-server only
- No ACID guarantees

### Future: PostgreSQL Schema

```sql
-- Core tables
users           -- User accounts
templates       -- Template definitions (JSONB)
scenes          -- Scene compositions (JSONB)
playlists       -- Scene sequences
live_state      -- Current broadcast state
projects        -- Workspace containers
project_members -- Project access control

-- Indexes
idx_templates_category  -- Filter by category
idx_templates_sport     -- Filter by sport
idx_scenes_created_by   -- Filter by creator
```

**Benefits:**
- ACID compliance
- Concurrent access
- Complex queries
- Multi-server support
- Full-text search

---

## Template Engine Architecture

```
Template JSON
    │
    ▼
┌───────────────┐
│    Parser     │
│  (Validate)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Validator   │
│  (Schema)     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Variables   │
│  (Bindings)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Animations   │
│  (CSS Gen)    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Renderer    │
│  (HTML/CSS)   │
└───────┬───────┘
        │
        ▼
   Output HTML
```

---

## Animation System

### Animation Pipeline

```
Preset Definition
    │
    ▼
┌───────────────┐
│   Generator   │
│ (Keyframes)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Composer    │
│ (Sequences)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Preview    │
│ (HTML Output) │
└───────┬───────┘
        │
        ▼
   CSS Animation
```

### Animation Types

1. **Element Animations** — Individual element enter/exit
2. **Scene Transitions** — Scene-to-scene transitions
3. **Stagger Sequences** — Delayed multi-element reveals
4. **Timeline Compositions** — Complex multi-step animations

---

## Error Handling

### Client-Side

```
Network Error ──────► Toast Notification
                         │
WebSocket Error ────► Reconnection Logic
                         │
Validation Error ───► Inline Error Display
```

### Server-Side

```
Request ──────────► Validation ──────────► Handler
                         │                    │
                         ▼                    ▼
                    400 Bad Request      500 Internal Error
                                            │
                                            ▼
                                       Error Logging
```

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": ["Additional context"]
}
```

---

## Testing Strategy

### Unit Tests

- Cricket engine (pure functions)
- Template validation
- Scene validation
- Animation generation

### Integration Tests

- API endpoint responses
- WebSocket event handling
- Authentication flows

### Manual Testing

- Overlay rendering in OBS
- Real-time scoring updates
- Multi-client synchronization

---

## Future Architecture

### Phase 1: Database Migration ✅

- PostgreSQL for persistent storage
- Redis for session management
- Migration scripts for existing data

### Phase 2: Multi-Server Support ✅

- Redis pub/sub for cross-server messaging
- Load balancer configuration
- Shared state management

### Phase 3: Visual Editor ✅

- Visual template editor with drag-and-drop
- Canvas with grid, rulers, smart guides
- Layer management panel
- Animation timeline with keyframes
- Property inspector with 13 property types
- Export system (HTML, Image, Video)
- Template versioning and sharing
- Keyboard shortcuts system

### Phase 4: Advanced Features

- Video overlay support
- Replay system
- Multi-language support
- API rate limiting
- Webhook integrations

### Phase 5: Cloud Deployment

- Docker orchestration
- CI/CD pipeline
- Monitoring and alerting
- Auto-scaling configuration
