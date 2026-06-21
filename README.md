# SportsCaster

Professional live sports broadcast graphics tool — a web-based WASP3D alternative for creating and controlling broadcast overlays in real-time.

## Vision

SportsCaster aims to democratize professional broadcast graphics by providing a web-native, real-time solution for sports tournaments at every level. From local cricket tournaments to multi-sport events, SportsCaster delivers IPL-quality overlays with zero hardware dependencies.

## Features

### Real-Time Scoring
- Ball-by-ball cricket scoring synced instantly via WebSockets
- Automatic milestone detection (FOUR, SIX, WICKET)
- Run rate (CRR) and required run rate (RRR) calculations
- Undo support with up to 100 actions per match

### Broadcast Templates
- **Scoreboard** — Bottom strip with team logos, scores, batter/bowler stats, ball-by-ball
- **Milestone Flash** — Auto-triggered for FOUR/SIX/WICKET, auto-dismisses after 3s
- **Batter Card** — Detailed single batter stats
- **Bowler Card** — Detailed single bowler stats
- **Over Summary** — Over-by-over breakdown
- **Center Scorecard** — Full batting+bowling tables centered on screen
- **Pre-Match Card** — Displayed before innings starts
- Multi-sport templates: Cricket, Football, Tennis, Basketball

### Visual Template Editor
- Canvas editor with grid, rulers, and smart guides
- Drag-and-drop element positioning
- Layer management panel with visibility, locking, opacity
- Animation timeline with keyframe editing
- Property inspector with 13 property types
- Advanced color picker with palettes
- Font picker with Google Fonts integration
- Data binding system with 50+ fields
- Style presets (30+)
- Element presets (10 broadcast combos)
- Template library with categories
- Template import/export
- Template versioning
- Template sharing

### Export System
- Export manager (HTML, Image, Video)
- Export presets (OBS, vMix, YouTube, etc.)
- Export queue with progress tracking
- Batch export support

### Multi-Output Streaming
- RTMP streaming (YouTube, Twitch, custom servers)
- WebRTC browser viewing (up to 100 viewers)
- NDI simulation for future integration
- Simultaneous multi-output support
- Stream health monitoring with alerts
- Automatic reconnection

### Production Switcher
- Professional PGM/PST workflow (like ATEM switchers)
- Multi-view grid with tally lights
- 12+ transition types (cut, dissolve, slide, wipe, zoom)
- T-bar manual transition control
- Macro recording and playback
- Up to 12 inputs

### Data Integrations
- RSS/Atom feed parsing
- Webhook receiver with HMAC validation
- Social media display (Twitter, Instagram, YouTube)
- Live score ticker (cricket, football, basketball)
- Data transformation pipeline

### Multi-User Collaboration
- Real-time cursor presence
- Role-based access (admin, editor, viewer)
- Activity logging
- Conflict detection and resolution
- Element locking

### Audio & Recording
- 8-channel audio mixer
- Audio visualizer (spectrum, waveform)
- Recording (MP4, WebM, MKV)
- Recording scheduler
- Quality presets (4K to 360p)

### Scene Management
- Multi-layer scene compositions
- Layer visibility, locking, and opacity control
- Scene transitions (fade, slide, wipe, etc.)
- Scene duplication and export

### Live Control
- Real-time overlay switching via WebSocket
- Layer-level data updates
- Transition effects between scenes
- Preview and broadcast output URLs

### Animation System
- 25+ professional animation presets
- Entry/exit animations with stagger support
- Transition effects between scenes
- Timeline-based composition

### Team & Match Management
- Register teams with custom colors
- Points table with NRR calculation
- CSV export for match scorecards
- Match metadata editing before innings start

### User Experience
- Dark/Light theme toggle
- Mobile-friendly responsive control panel
- Keyboard shortcuts system
- Undo/redo history
- Protected routes with role-based access

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (React)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  Home    │ │ Control  │ │ Overlay  │ │    Template Editor   │  │
│  │  Page    │ │  Panel   │ │  View    │ │  (Canvas/Properties) │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Streaming│ │Production│ │   Data   │ │      Audio &         │  │
│  │Dashboard │ │ Switcher │ │Integratn │ │     Recording        │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Collab   │ │  Scenes  │ │ Template │ │     Export           │  │
│  │  Panel   │ │  Manager │ │ Library  │ │     Manager          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP + WebSocket
┌───────────────────────────┴─────────────────────────────────────────┐
│                   Server (Express + Socket.IO)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  Match   │ │Template  │ │  Scene   │ │      Streaming       │  │
│  │  Store   │ │  Engine  │ │ Manager  │ │   (RTMP/WebRTC/NDI)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Cricket  │ │Animation │ │ Switcher │ │    Data Integratns   │  │
│  │  Engine  │ │  System  │ │  Engine  │ │ (RSS/Webhook/Social) │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Collab   │ │  Audio   │ │Recording │ │       Export         │  │
│  │ Manager  │ │  Mixer   │ │ Manager  │ │       Worker         │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              JSON File Store / PostgreSQL                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+ (recommended: use nvm)
- npm 9+

### Development

```bash
# Clone the repository
git clone <repository-url>
cd sportscaster

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Start server (port 3001)
cd server && npm run dev

# In another terminal, start client (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build client
cd client && npm run build

# Start server (serves built client)
cd server && npm start
```

### Docker

```bash
docker-compose up --build
```

Server runs on `http://localhost:3001`.

## Environment Variables

Create `server/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `ADMIN_TOKEN` | (none) | If set, requires `x-admin-token` header for mutations |
| `JWT_SECRET` | dev-secret | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration time |

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/matches` | List all matches |
| `POST` | `/api/matches` | Create a match |
| `GET` | `/api/matches/:id` | Get match details |
| `PUT` | `/api/matches/:id` | Update match metadata |
| `DELETE` | `/api/matches/:id` | Delete a match |
| `GET` | `/api/matches/:id/export/csv` | Export match as CSV |
| `GET` | `/api/teams` | List all teams |
| `POST` | `/api/teams` | Register a team |
| `GET` | `/api/teams/:id` | Get team details |
| `PUT` | `/api/teams/:id` | Update a team |
| `DELETE` | `/api/teams/:id` | Delete a team |
| `GET` | `/api/points` | Get points table |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/users/register` | Register a user |
| `POST` | `/api/users/login` | Login |
| `GET` | `/api/templates` | List templates |
| `POST` | `/api/templates` | Create template |
| `GET` | `/api/scenes` | List scenes |
| `POST` | `/api/scenes` | Create scene |
| `GET` | `/api/live` | Get live state |
| `POST` | `/api/live/scene` | Switch live scene |
| `POST` | `/api/exports/html` | Export as HTML |
| `POST` | `/api/exports/image` | Export as image |
| `POST` | `/api/exports/video` | Export as video |
| `POST` | `/api/exports/batch` | Batch export |
| `GET` | `/api/exports/status/:jobId` | Check export status |
| `GET` | `/api/exports/download/:jobId` | Download export |
| `GET` | `/api/streaming` | List streaming outputs |
| `POST` | `/api/streaming` | Add streaming output |
| `POST` | `/api/streaming/:id/start` | Start streaming |
| `POST` | `/api/streaming/:id/stop` | Stop streaming |
| `GET` | `/api/streaming/health` | Get stream health |
| `GET` | `/api/switcher` | Get switcher state |
| `POST` | `/api/switcher/switch` | Switch input |
| `POST` | `/api/switcher/transition` | Execute transition |
| `GET` | `/api/integrations` | List data feeds |
| `POST` | `/api/integrations` | Add data feed |
| `GET` | `/api/integrations/scores` | Get live scores |
| `GET` | `/api/recording/status` | Get recording status |
| `POST` | `/api/recording/start` | Start recording |
| `POST` | `/api/recording/stop` | Stop recording |
| `GET` | `/api/audio/channels` | List audio channels |
| `PUT` | `/api/audio/channels/:id/volume` | Set channel volume |
| `GET` | `/api/collaboration/:projectId/users` | List project users |
| `POST` | `/api/collaboration/:projectId/join` | Join project |

For detailed API documentation, see [docs/API.md](docs/API.md).

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `match:join` | Client → Server | Join a match room |
| `match:state` | Server → Client | Full match state update |
| `innings:start` | Client → Server | Start an innings |
| `score:update` | Client → Server | Apply a ball |
| `score:undo` | Client → Server | Undo last action |
| `bowler:change` | Client → Server | Change current bowler |
| `overlay:command` | Both | Control overlay templates |
| `scene:create` | Client → Server | Create a scene |
| `live:scene-switch` | Client → Server | Switch live scene |
| `stream:start` | Client → Server | Start streaming |
| `stream:status` | Server → Client | Stream status update |
| `switcher:switch` | Client → Server | Switch input |
| `switcher:transition` | Client → Server | Execute transition |
| `data:scores-update` | Server → Client | Live scores update |
| `recording:start` | Server → Client | Recording started |
| `audio:levels` | Server → Client | Audio levels update |
| `collab:cursor-moved` | Server → Room | Cursor position broadcast |
| `collab:user-joined` | Server → Room | User joined project |

## Documentation

- [API Reference](docs/API.md) — Complete REST and WebSocket API documentation
- [User Guide](docs/USER_GUIDE.md) — End-user documentation for operators
- [Developer Guide](docs/DEVELOPER.md) — Contributing and development setup
- [Deployment Guide](docs/DEPLOYMENT.md) — Production deployment instructions
- [Template Guide](docs/TEMPLATES.md) — Creating and customizing templates
- [Architecture](docs/ARCHITECTURE.md) — System design and technical overview
- [Phase 3 Summary](docs/PHASE3_SUMMARY.md) — Visual editor features and architecture
- [Changelog](CHANGELOG.md) — Version history and release notes

## Tech Stack

- **Frontend:** React 19, React Router v7, Vite 6, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, nanoid
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Styling:** Custom CSS design system (glass morphism, dark luxe theme)
- **Fonts:** Inter, Outfit, Teko, Rajdhani (Google Fonts)

## Running Tests

```bash
cd server && npm test
```

## License

MIT
