# Changelog

All notable changes to SportsCaster will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-15

### Added

#### Core Features
- Real-time cricket scoring engine with ball-by-ball updates
- WebSocket-based instant state synchronization
- 7 broadcast-ready overlay templates
- Visual template editor with drag-and-drop canvas
- Scene management with multi-layer compositions
- Live broadcast control panel
- Team management with custom colors
- Points table with NRR calculation
- CSV export for match scorecards

#### Templates
- Scoreboard — Bottom strip with team logos, scores, batter/bowler stats
- Milestone Flash — Auto-triggered for FOUR/SIX/WICKET
- Batter Card — Detailed single batter statistics
- Bowler Card — Detailed single bowler statistics
- Over Summary — Over-by-over breakdown
- Center Scorecard — Full match statistics
- Pre-Match Card — Team lineups display

#### Animation System
- 25+ professional animation presets
- Entry/exit animations with stagger support
- Scene transition effects (fade, slide, wipe, etc.)
- Timeline-based animation composition

#### Multi-Sport Support
- Cricket templates and scoring engine
- Football templates (scoreboard, substitution)
- Tennis templates (scoreboard, set score, serve indicator)
- Basketball templates (scoreboard)

#### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, producer, operator)
- Project-level permissions
- Legacy admin token support

#### Scene Management
- Multi-layer scene compositions
- Layer visibility, locking, and opacity control
- Scene duplication and export
- Preview generation

#### Live Control
- Real-time overlay switching
- Layer-level data updates
- Transition effects between scenes
- Broadcast output URLs

#### Developer Experience
- Hot module replacement (Vite)
- Auto-reloading server (Node.js --watch)
- Comprehensive test suite
- JSON file persistence with debounced writes

#### UI/UX
- Dark/Light theme toggle
- Glass morphism design system
- Mobile-responsive control panel
- Toast notifications
- Protected routes

#### Deployment
- Docker support with multi-stage build
- Docker Compose configuration
- Production build scripts
- Environment variable configuration

### Technical Details

#### Frontend
- React 19
- React Router v7
- Vite 6
- Socket.IO Client 4.x

#### Backend
- Node.js 20+
- Express 4.x
- Socket.IO 4.x
- nanoid 5.x
- jsonwebtoken 9.x
- bcryptjs 3.x

#### Cricket Engine
- Normal runs (0-6)
- Wide balls, No balls, Byes, Leg Byes
- Wickets with new batter entry
- Strike rotation (odd runs, end-of-over swap)
- Over completion (6 legal balls)
- Maiden over tracking
- Innings completion detection
- Match result calculation
- Run rate (CRR) and Required Run Rate (RRR)
- Undo support (100 actions)

#### Template Engine
- JSON schema validation
- Dynamic data binding
- Conditional element display
- CSS animation generation
- Template string interpolation

#### Animation Presets
- Entry: slide-in (4 directions), fade-in, scale-in, flip-in, rotate-in, blur-in, wipe, split
- Exit: slide-out (4 directions), fade-out, scale-out, flip-out, rotate-out, blur-out
- Effects: glow-pulse, shimmer, typewriter, count-up, bounce-in, swing, zoom

---

## [2.0.0] - 2026-06-21

### Added
- Visual template editor with drag-and-drop
- Canvas with grid, rulers, smart guides
- Layer management panel
- Animation timeline with keyframes
- Property inspector with 13 property types
- Advanced color picker with palettes
- Font picker with Google Fonts
- Data binding system with 50+ fields
- Style presets (30+)
- Element presets (10 broadcast combos)
- Template library with categories
- Template import/export
- Template versioning
- Template sharing
- Export manager (HTML, Image, Video)
- Export presets (OBS, vMix, YouTube, etc.)
- Export queue with progress tracking
- Keyboard shortcuts system
- Undo/redo history

### Improved
- Global navigation bar
- Authentication system
- Toast notifications
- Error handling

---

## [4.0.0] - 2026-06-21

### Added

#### Spark AI Bot
- **Natural Language Understanding** - Pattern-based intent classifier with 30+ intents
- **Action Execution** - Bot can perform actions on behalf of users
- **Context Tracking** - Remembers where user is in the app
- **Conversation Memory** - Stores last 50 messages per user
- **Step-by-Step Guides** - Walkthrough complex workflows
- **Proactive Suggestions** - Offers help when user seems stuck
- **Quick Actions** - One-click common tasks
- **Knowledge Base** - 12 page descriptions, 6 workflow guides, FAQ
- **Response Types** - Text, cards, step-by-step, quick actions
- **Rate Limiting** - 30 messages per minute per user

#### Enhanced Design System
- **Design Tokens** - CSS custom properties for colors, spacing, typography
- **Glass Morphism 2.0** - Enhanced blur, borders, shadows
- **Micro-Interactions** - Hover scale, glow, lift, ripple effects
- **Animated Backgrounds** - Gradient shifts, noise texture, grid patterns
- **Status Indicators** - Live pulse, recording dot, signal bars
- **Navigation** - Animated underlines, glass sidebar, breadcrumbs
- **Skeleton Loading** - Shimmer animation for loading states
- **Stagger Animations** - Children animate in sequence

#### 3D Graphics & Particles
- **Three.js Integration** - 3D rendering with React Three Fiber
- **Spark Logo** - 3D animated lightning bolt with metallic material
- **Particle Background** - Floating particles with mouse interaction
- **Score Celebrations** - Burst particles on 4/6/wicket events
- **3D Data Visualization** - Bar charts and rotating globe
- **Scene Preview 3D** - Tilt/perspective view of templates
- **Particle System** - Reusable emitter with physics

#### Analytics Dashboard
- **Usage Tracking** - Page views, feature usage, user journeys
- **Performance Monitor** - API response times, memory, CPU, health score
- **KPI Cards** - Animated counters with sparklines
- **Charts** - Line chart, bar chart, heatmap (CSS-based)
- **Activity Feed** - Real-time event stream
- **User Leaderboard** - Most active users

#### Sound Design
- **Sound Manager** - Web Audio API oscillator-based synthesis
- **9 Sound Effects** - Click, success, error, notification, score, wicket, transition, start, stop
- **Volume Control** - Adjustable with mute persistence
- **Reduced Motion** - Auto-mute when user prefers

#### New Pages
- `/analytics` - Analytics dashboard

#### New Components
- SparkBot, ChatMessage, BotCard, StepGuide, QuickActions, ProactiveSuggestion, SparkOverlay
- SparkLogo, ParticleBackground, ScoreParticles, DataVisualization, ScenePreview3D
- KPICard, BarChart, LineChart, HeatMap, ActivityFeed

#### New API Endpoints
- `/api/bot/*` - Bot message, suggestions, actions, history
- `/api/analytics/*` - Dashboard, metrics, usage, performance

---

## [3.0.0] - 2026-06-21

### Added

#### Multi-Output Streaming Engine
- RTMP streaming output (YouTube, Twitch, custom)
- WebRTC browser viewing with SFU-like relay (up to 100 viewers)
- NDI simulation for future native integration
- Multi-output support (simultaneous RTMP + WebRTC + NDI)
- Stream health monitoring (bitrate, fps, dropped frames)
- Automatic reconnection with exponential backoff
- Stream health history (5-minute rolling window)
- Alert system for stream issues

#### Production Switcher
- Professional PGM/PST (Program/Preview) workflow
- Multi-view grid with tally lights (red=PGM, green=PST)
- 12+ transition types (cut, crossfade, slide, wipe, zoom, blur, flip, rotate)
- T-bar manual transition control
- Macro recording and playback
- Configurable layouts (2x1, 2x2, 3x1, 3x2, 4x2)
- Audio level meters per input
- Up to 12 inputs (scenes, cameras, media, NDI)

#### Data Integrations
- RSS/Atom feed parser with polling
- Webhook receiver with HMAC validation
- Social media feed display (Twitter, Instagram, YouTube mock)
- Live score ticker (cricket, football, basketball)
- Data transformation pipeline for overlay format
- Real-time data feed dashboard

#### Multi-User Collaboration
- Real-time cursor presence with colored avatars
- Role-based access control (admin, editor, viewer)
- Activity log with 500-entry FIFO buffer
- Conflict detection and resolution (last-write-wins)
- User presence tracking with 12-color palette
- 30-second heartbeat for disconnect detection
- Element locking for collaborative editing

#### Audio & Recording
- 8-channel audio mixer with volume, mute, solo, pan
- Audio visualizer (spectrum bars, waveform)
- Audio effects (compressor, limiter, equalizer, noise gate)
- Recording manager (MP4, WebM, MKV)
- Recording scheduler with recurring support
- Quality presets (Ultra 4K, High 1080p, Medium 720p, Low 480p, Mobile 360p)
- Custom quality presets
- Recording history with download/delete

#### New Frontend Pages
- `/streaming` - Streaming dashboard with health monitoring
- `/switcher` - Production switcher UI
- `/integrations` - Data integrations hub

#### New Frontend Components
- StreamingHealth, MultiViewer, TBar, MacroPanel
- CollaborationPanel, CursorOverlay, ActivityFeed, PermissionBadge
- RecordingControls, AudioMixer, AudioVisualizer, QualitySettings, RecordingHistory
- DataFeedCard, LiveScoreTicker, SocialFeedDisplay

#### New API Endpoints
- `/api/streaming` - Stream management (CRUD, start, stop, health)
- `/api/switcher` - Switcher controls (switch, preview, transitions, macros)
- `/api/integrations` - Data feeds, scores, social, webhooks
- `/api/recording` - Recording start/stop/pause, scheduling, quality
- `/api/audio` - Audio mixer, levels, effects
- `/api/collaboration` - Users, roles, activity, conflicts
- `/api/webhooks` - Dynamic webhook endpoints

#### New Socket Events
- `stream:*` - Stream status, health, viewers
- `switcher:*` - Switch, preview, transitions, macros
- `data:*` - Feed updates, scores, social
- `recording:*` - Recording status, timer
- `audio:*` - Levels, mute, solo
- `collab:*` - Presence, cursors, edits, conflicts

---

## [Unreleased]

### Planned

- PostgreSQL database migration
- Redis for session management and pub/sub
- Multi-server support
- Template marketplace
- Video overlay support
- Replay system
- Multi-language support
- Mobile native apps
- API rate limiting
- Webhook integrations
- CI/CD pipeline
- Monitoring and alerting
- Auto-scaling configuration

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 4.0.0 | 2026-06-21 | Spark AI Bot, enhanced design system, 3D graphics, analytics, sound |
| 3.0.0 | 2026-06-21 | Streaming engine, production switcher, data integrations, collaboration, audio/recording |
| 2.0.0 | 2026-06-21 | Visual template editor, export system, template management |
| 1.0.0 | 2026-01-15 | Initial release with full feature set |

---

## Upgrade Notes

### From 0.x to 1.0.0

This is the initial stable release. No migration needed.

### Data Format

Match and team data is stored in JSON files:
- `server/data/store.json` — Matches and teams
- `server/data/authStore.json` — Users, templates, scenes

Back up these files before upgrading.

---

## Known Issues

- Undo stack is not persisted (in-memory only)
- WebSocket reconnection may require page refresh in some browsers
- Large scenes with many layers may impact performance
- Template editor does not support undo/redo yet
- Export processing may timeout for complex templates

---

## [7.0.0] - 2026-06-22

### Added

#### Production Hardening
- Rate limiting middleware (global: 100/min, auth: 10/min, API: 30/min)
- Audit logger for all mutation requests with 5MB log rotation
- Input sanitizer (strips `<script>` tags, `javascript:` protocols, HTML entities)
- Security headers (X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy, etc.)

#### AI Template Generator
- Natural language template generation from text descriptions
- 50 pre-built template presets across 6 categories (scoreboards, lower-thirds, timers, stats, tickers, player cards)
- Smart suggestions and autocomplete for template descriptions
- API endpoints: POST /api/ai/generate, GET /api/ai/presets, POST /api/ai/suggest, POST /api/ai/autocomplete

#### 3D Graphics Enhancement
- Three.js-powered 3D scoreboard component with animated scores and glass materials
- Interactive 3D scene builder with drag-and-drop elements and camera controls
- 4 transition effects (cube rotation, sphere morph, particle dissolve, page flip)
- 10 preset 3D scenes for cricket, football, and basketball
- API endpoints: GET /api/scenes3d/presets, POST /api/scenes3d/render, POST /api/scenes3d/export

#### Advanced Analytics
- Real-time metrics engine with anomaly detection
- Usage analytics (page views, feature usage, template popularity)
- Performance monitoring (response times, slow endpoints, memory usage)
- SVG chart components (LineChart, BarChart, PieChart, HeatMap, TrendCard, SparkLine)
- Advanced analytics dashboard with auto-refresh
- 11 new API endpoints for analytics data

#### Internationalization (i18n)
- 4 languages: English, Spanish, Hindi, Arabic
- RTL support for Arabic
- Language switcher component with flag indicators
- 150+ translation keys covering all UI text
- localStorage persistence of language preference

#### Accessibility
- Skip-to-content link for keyboard navigation
- Screen reader components (VisuallyHidden, AriaLabel, LiveRegion)
- Focus trap for modals
- Keyboard navigation hook (arrow keys, Enter, Escape)
- High contrast mode detection
- Visible focus indicators

### Fixed
- All 12 E2E test bugs (BUG-001 through BUG-012) resolved and verified

---

## Support

For issues and feature requests, please refer to the project repository.

---

## License

MIT License - see [LICENSE](LICENSE) for details.
