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

## Support

For issues and feature requests, please refer to the project repository.

---

## License

MIT License - see [LICENSE](LICENSE) for details.
