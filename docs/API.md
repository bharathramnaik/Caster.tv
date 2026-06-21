# API Reference

Complete REST and WebSocket API documentation for SportsCaster.

## Base URL

```
http://localhost:3001
```

## Authentication

SportsCaster supports two authentication methods:

### JWT Bearer Token

```bash
Authorization: Bearer <token>
```

### Legacy Admin Token

```bash
x-admin-token: <token>
```

If `ADMIN_TOKEN` is not set in the environment, authentication is bypassed for backward compatibility.

---

## REST API Endpoints

### Health Check

#### `GET /api/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "uptime": 12345.678
}
```

---

### Users

#### `POST /api/users/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword",
  "role": "operator"
}
```

**Roles:** `admin`, `producer`, `operator`

**Response:** `201 Created`
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "operator",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

#### `POST /api/users/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "operator"
  }
}
```

#### `GET /api/users/me`

Get current authenticated user. Requires authentication.

**Response:** `200 OK`
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "operator"
}
```

---

### Matches

#### `POST /api/matches`

Create a new match. Requires authentication.

**Request Body:**
```json
{
  "teamA": "Mumbai Indians",
  "teamB": "Chennai Super Kings",
  "teamAShort": "MI",
  "teamBShort": "CSK",
  "teamAColors": { "primary": "#004BA0", "secondary": "#D1AB3E" },
  "teamBColors": { "primary": "#FCCA06", "secondary": "#0081E9" },
  "maxOvers": 20,
  "matchType": "T20",
  "venue": "Wankhede Stadium",
  "tournamentName": "IPL 2026",
  "tossWinner": "a",
  "tossDecision": "bat"
}
```

**Response:** `200 OK`
```json
{
  "matchId": "m_abc12345",
  "status": "NOT_STARTED",
  "matchType": "T20",
  "maxOvers": 20,
  "teams": {
    "a": { "name": "Mumbai Indians", "short": "MI", "colors": { "primary": "#004BA0", "secondary": "#D1AB3E" } },
    "b": { "name": "Chennai Super Kings", "short": "CSK", "colors": { "primary": "#FCCA06", "secondary": "#0081E9" } }
  },
  "innings": [],
  "currentInnings": -1,
  "result": null
}
```

#### `GET /api/matches`

List all matches.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (NOT_STARTED, IN_PROGRESS, COMPLETED) |

**Response:** `200 OK`
```json
[
  {
    "matchId": "m_abc12345",
    "status": "IN_PROGRESS",
    "teams": { ... },
    "innings": [ ... ]
  }
]
```

#### `GET /api/matches/:matchId`

Get match details.

**Response:** `200 OK` or `404 Not Found`

#### `PUT /api/matches/:matchId`

Update match metadata. Requires authentication. Only allowed before innings start.

**Request Body:**
```json
{
  "venue": "New Stadium",
  "tournamentName": "IPL 2026",
  "tossWinner": "b",
  "tossDecision": "bowl"
}
```

**Response:** `200 OK` or `404 Not Found`

#### `DELETE /api/matches/:matchId`

Delete a match. Requires authentication.

**Response:** `200 OK`
```json
{ "ok": true }
```

#### `GET /api/matches/:matchId/export/csv`

Export match scorecard as CSV.

**Response:** `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="match-m_abc12345.csv"
```

CSV format includes:
- Match metadata (tournament, teams, venue, result)
- Batting scorecard per innings
- Bowling figures per innings
- Fall of wickets

---

### Teams

#### `POST /api/teams`

Register a new team. Requires authentication.

**Request Body:**
```json
{
  "name": "Mumbai Indians",
  "short": "MI",
  "primaryColor": "#004BA0",
  "secondaryColor": "#D1AB3E"
}
```

**Response:** `200 OK`
```json
{
  "teamId": "t_abc123",
  "name": "Mumbai Indians",
  "short": "MI",
  "primaryColor": "#004BA0",
  "secondaryColor": "#D1AB3E",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

#### `GET /api/teams`

List all teams.

**Response:** `200 OK`
```json
[
  {
    "teamId": "t_abc123",
    "name": "Mumbai Indians",
    "short": "MI",
    "primaryColor": "#004BA0",
    "secondaryColor": "#D1AB3E"
  }
]
```

#### `GET /api/teams/:teamId`

Get team details. Returns `404 Not Found` if not found.

#### `PUT /api/teams/:teamId`

Update a team. Requires authentication.

**Request Body:** Partial team object with fields to update.

#### `DELETE /api/teams/:teamId`

Delete a team. Requires authentication.

---

### Points Table

#### `GET /api/points`

Get calculated points table from completed matches.

**Response:** `200 OK`
```json
[
  {
    "team": "Mumbai Indians",
    "short": "MI",
    "colors": { "primary": "#004BA0", "secondary": "#D1AB3E" },
    "played": 5,
    "won": 4,
    "lost": 1,
    "tied": 0,
    "nr": 0,
    "points": 8,
    "nrr": 1.234
  }
]
```

Sorted by points (descending), then NRR (descending).

---

### Templates

#### `GET /api/templates`

List templates with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `sport` | string | Filter by sport |
| `search` | string | Search by name |
| `isPublic` | boolean | Filter by public/private |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |

**Response:** `200 OK`
```json
{
  "templates": [ ... ],
  "total": 25,
  "page": 1,
  "limit": 50
}
```

#### `GET /api/templates/categories`

List available template categories.

**Response:** `200 OK`
```json
["lower-third", "full-screen", "ticker", "scoreboard", "player-card"]
```

#### `GET /api/templates/:id`

Get template by ID.

#### `POST /api/templates`

Create a new template. Requires authentication.

**Request Body:**
```json
{
  "name": "Custom Scoreboard",
  "category": "scoreboard",
  "sport": "cricket",
  "isPublic": true,
  "elements": [ ... ],
  "canvas": { "width": 1920, "height": 1080 },
  "animations": { "enter": { ... }, "exit": { ... } }
}
```

**Response:** `201 Created`

#### `PUT /api/templates/:id`

Update a template. Requires authentication. Only the creator or admin can update.

#### `DELETE /api/templates/:id`

Delete a template. Requires authentication.

#### `POST /api/templates/:id/duplicate`

Duplicate a template. Requires authentication.

**Request Body:**
```json
{
  "name": "Custom Scoreboard (Copy)"
}
```

---

### Scenes

#### `GET /api/scenes`

List scenes with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |

#### `GET /api/scenes/:id`

Get scene by ID.

#### `POST /api/scenes`

Create a new scene. Requires authentication.

**Request Body:**
```json
{
  "name": "Scorebug Scene",
  "description": "Main scorebug overlay",
  "layers": [
    {
      "templateId": "tpl_abc123",
      "position": { "x": 0, "y": 930, "width": 1920, "height": 150 },
      "visible": true,
      "data": { "innings": { "runs": 145 } }
    }
  ],
  "transitions": {
    "enter": { "type": "fade", "duration": 0.3 },
    "exit": { "type": "fade", "duration": 0.3 }
  },
  "canvas": { "width": 1920, "height": 1080, "background": "transparent" }
}
```

**Response:** `201 Created`

#### `PUT /api/scenes/:id`

Update a scene. Requires authentication.

#### `DELETE /api/scenes/:id`

Delete a scene. Requires authentication.

#### `POST /api/scenes/:id/duplicate`

Duplicate a scene. Requires authentication.

#### `POST /api/scenes/:id/preview`

Generate preview HTML for a scene. Requires authentication.

**Response:** `200 OK`
```json
{
  "html": "<!DOCTYPE html>..."
}
```

#### `POST /api/scenes/:id/export`

Export scene in various formats. Requires authentication.

**Request Body:**
```json
{
  "format": "obs"
}
```

**Formats:** `html`, `obs`, `ndi`, `streaming`, `json`

---

### Export Manager

#### `POST /api/exports/html`

Export template or scene as HTML. Requires authentication.

**Request Body:**
```json
{
  "sourceData": { ... },
  "sourceType": "template",
  "htmlFormat": "static",
  "width": 1920,
  "height": 1080,
  "background": "transparent",
  "title": "Export"
}
```

**HTML Formats:** `static`, `obs`, `vmix`, `wirecast`, `embed`

**Response:** `200 OK`
```json
{
  "jobId": "job_abc123",
  "content": "<!DOCTYPE html>...",
  "filename": "export.html",
  "mimeType": "text/html",
  "downloadUrl": "/api/exports/download/job_abc123"
}
```

#### `POST /api/exports/image`

Export template or scene as image. Requires authentication.

**Request Body:**
```json
{
  "sourceData": { ... },
  "sourceType": "template",
  "imageFormat": "png",
  "quality": 80,
  "width": 1920,
  "height": 1080,
  "transparent": true
}
```

**Image Formats:** `png`, `jpeg`, `webp`

**Response:** `200 OK`
```json
{
  "jobId": "job_abc123",
  "content": "base64...",
  "filename": "export.png",
  "mimeType": "image/png",
  "downloadUrl": "/api/exports/download/job_abc123"
}
```

#### `POST /api/exports/video`

Export template or scene as video. Requires authentication.

**Request Body:**
```json
{
  "sourceData": { ... },
  "sourceType": "template",
  "videoFormat": "mp4",
  "quality": 80,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "duration": 5,
  "loop": false
}
```

**Video Formats:** `mp4`, `webm`, `gif`

**Response:** `200 OK`
```json
{
  "jobId": "job_abc123",
  "content": "base64...",
  "filename": "export.mp4",
  "mimeType": "video/mp4",
  "downloadUrl": "/api/exports/download/job_abc123"
}
```

#### `POST /api/exports/batch`

Batch export multiple templates/scenes. Requires authentication.

**Request Body:**
```json
{
  "exports": [
    { "type": "html", "sourceData": { ... }, "sourceType": "template" },
    { "type": "image", "sourceData": { ... }, "sourceType": "template" }
  ]
}
```

**Response:** `200 OK`
```json
{
  "batchJobId": "batch_abc123",
  "results": [
    { "jobId": "job_1", "status": "completed", "content": "..." },
    { "jobId": "job_2", "status": "completed", "content": "..." }
  ]
}
```

#### `GET /api/exports/status/:jobId`

Check export job status. Requires authentication.

**Response:** `200 OK`
```json
{
  "id": "job_abc123",
  "type": "html",
  "status": "completed",
  "progress": 100,
  "error": null,
  "createdAt": "2026-06-21T10:00:00Z",
  "updatedAt": "2026-06-21T10:00:01Z"
}
```

**Status Values:** `pending`, `processing`, `completed`, `failed`

#### `GET /api/exports/download/:jobId`

Download exported file. Requires authentication.

**Response:** `200 OK`
- Content-Type: File MIME type
- Content-Disposition: attachment
- Body: File content

---

### Live Control

#### `GET /api/live`

Get current live broadcast state. Requires authentication.

**Response:** `200 OK`
```json
{
  "id": "current",
  "sceneId": "scene_abc123",
  "activeLayers": ["layer_1", "layer_2"],
  "graphicsState": { "layer_1": { "runs": 145 } },
  "scene": { ... }
}
```

#### `POST /api/live/scene`

Switch the live scene. Requires authentication.

**Request Body:**
```json
{
  "sceneId": "scene_abc123"
}
```

#### `POST /api/live/transition`

Trigger a scene transition. Requires authentication.

**Request Body:**
```json
{
  "sceneId": "scene_abc123",
  "transitionType": "fade",
  "duration": 0.5
}
```

#### `POST /api/live/layer/:id/visibility`

Toggle layer visibility. Requires authentication.

**Request Body:**
```json
{
  "sceneId": "scene_abc123"
}
```

#### `POST /api/live/layer/:id/data`

Update layer data. Requires authentication.

**Request Body:**
```json
{
  "sceneId": "scene_abc123",
  "data": {
    "runs": 150,
    "wickets": 3
  }
}
```

#### `GET /api/live/preview`

Get preview HTML for the current live scene. Requires authentication.

#### `GET /api/live/output`

Get broadcast output configuration. Requires authentication.

**Response:** `200 OK`
```json
{
  "previewUrl": "http://localhost:3001/api/live/preview",
  "websocketUrl": "http://localhost:3001",
  "sceneId": "scene_abc123",
  "resolution": { "width": 1920, "height": 1080 }
}
```

---

### Playlists

#### `GET /api/playlists`

List playlists.

#### `POST /api/playlists`

Create a playlist. Requires authentication.

#### `GET /api/playlists/:id`

Get playlist by ID.

#### `PUT /api/playlists/:id`

Update a playlist. Requires authentication.

#### `DELETE /api/playlists/:id`

Delete a playlist. Requires authentication.

---

### Projects

#### `GET /api/projects`

List projects accessible to the authenticated user.

#### `POST /api/projects`

Create a project. Requires authentication.

#### `GET /api/projects/:id`

Get project by ID. Requires project access.

#### `PUT /api/projects/:id`

Update a project. Requires project editor or admin role.

#### `DELETE /api/projects/:id`

Delete a project. Requires project admin role.

---

## Socket.IO Events

Connect to the server:

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
```

### Match Events

#### `match:join`

Join a match room to receive live updates.

**Payload:** `matchId` (string)

```javascript
socket.emit('match:join', 'm_abc12345');
```

**Response Events:**
- `match:state` — Full match state
- `match:error` — Error if match not found

#### `match:leave`

Leave a match room.

**Payload:** `matchId` (string)

#### `innings:start`

Start a new innings.

**Payload:**
```json
{
  "matchId": "m_abc12345",
  "battingTeam": "a",
  "batter1": "Rohit Sharma",
  "batter2": "Ishan Kishan",
  "bowler": "Deepak Chahar"
}
```

**Response Events:**
- `match:state` — Updated match state (broadcast to all in room)

#### `score:update`

Apply a ball (runs, extras, wicket).

**Payload:**
```json
{
  "matchId": "m_abc12345",
  "type": "normal",
  "runs": 4,
  "newBatter": null,
  "wicketType": null
}
```

**Ball Types:**
| Type | Description |
|------|-------------|
| `normal` | Regular delivery |
| `wide` | Wide ball (+1 run) |
| `noBall` | No ball (+1 run) |
| `bye` | Bye (+runs) |
| `legBye` | Leg bye (+runs) |
| `wicket` | Wicket |

**Wicket Types:**
`bowled`, `caught`, `lbw`, `runOut`, `stumped`, `hitWicket`

**Response Events:**
- `match:state` — Updated match state
- `overlay:command` — Auto-emitted for milestones:
  - `{ command: 'milestone', payload: { type: 'FOUR' } }`
  - `{ command: 'milestone', payload: { type: 'SIX' } }`
  - `{ command: 'milestone', payload: { type: 'WICKET' } }`

#### `score:undo`

Undo the last action.

**Payload:**
```json
{
  "matchId": "m_abc12345"
}
```

**Response Events:**
- `match:state` — Previous match state
- `match:error` — If nothing to undo

#### `bowler:change`

Change the current bowler.

**Payload:**
```json
{
  "matchId": "m_abc12345",
  "bowlerName": "Jasprit Bumrah"
}
```

#### `innings:end`

End the current innings manually.

**Payload:**
```json
{
  "matchId": "m_abc12345"
}
```

#### `match:update`

Update match metadata (only before innings start).

**Payload:**
```json
{
  "matchId": "m_abc12345",
  "updates": {
    "venue": "New Stadium",
    "tournamentName": "IPL 2026"
  }
}
```

#### `overlay:command`

Control overlay templates.

**Payload:**
```json
{
  "matchId": "m_abc12345",
  "command": "milestone",
  "payload": { "type": "FOUR" }
}
```

**Commands:**
| Command | Payload | Description |
|---------|---------|-------------|
| `milestone` | `{ type: 'FOUR' \| 'SIX' \| 'WICKET' }` | Show milestone flash |
| `scoreboard` | `{ action: 'show' \| 'hide' }` | Toggle scoreboard |
| `batter-card` | `{ show: true, batter: {...} }` | Show batter card |
| `bowler-card` | `{ show: true, bowler: {...} }` | Show bowler card |
| `over-summary` | `{ overs: [...] }` | Show over summary |

### Scene Events

#### `scene:create`

Create a scene via WebSocket.

**Payload:**
```json
{
  "name": "My Scene",
  "layers": [ ... ],
  "transitions": { ... },
  "canvas": { "width": 1920, "height": 1080 },
  "userId": "usr_abc123"
}
```

**Response Events:**
- `scene:created` — Created scene object
- `scene:list-update` — `{ action: 'create', sceneId: '...' }`

#### `scene:update`

Update a scene via WebSocket.

**Payload:**
```json
{
  "sceneId": "scene_abc123",
  "updates": { "name": "Updated Name" }
}
```

#### `scene:delete`

Delete a scene via WebSocket.

**Payload:**
```json
{
  "sceneId": "scene_abc123"
}
```

### Live Control Events

#### `live:scene-switch`

Switch the live scene.

**Payload:**
```json
{
  "sceneId": "scene_abc123"
}
```

**Response Events:**
- `live:state-update` — Updated live state

#### `live:layer-update`

Update a layer in the current live scene.

**Payload:**
```json
{
  "sceneId": "scene_abc123",
  "layerId": "layer_abc123",
  "updates": {
    "visible": true,
    "opacity": 0.8,
    "data": { "runs": 150 }
  }
}
```

#### `live:transition`

Trigger a transition effect.

**Payload:**
```json
{
  "sceneId": "scene_abc123",
  "transitionType": "fade",
  "duration": 0.5
}
```

### Collaboration Events

#### `user:join-project`

Join a project room for collaboration.

**Payload:**
```json
{
  "projectId": "proj_abc123",
  "userId": "usr_abc123"
}
```

**Response Events:**
- `user:joined` — `{ userId, socketId, timestamp }`

#### `user:leave-project`

Leave a project room.

#### `cursor:move`

Broadcast cursor position to other collaborators.

**Payload:**
```json
{
  "projectId": "proj_abc123",
  "userId": "usr_abc123",
  "x": 100,
  "y": 200,
  "targetId": "element_abc123"
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `Bad Request` | Invalid request body or parameters |
| 401 | `Unauthorized` | Authentication required or invalid token |
| 403 | `Forbidden` | Insufficient permissions |
| 404 | `Not Found` | Resource not found |
| 500 | `Internal Server Error` | Server error |

### Error Response Format

```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

### Socket.IO Error Events

| Event | Description |
|-------|-------------|
| `match:error` | Match-related error |
| `scene:error` | Scene-related error |
| `live:error` | Live control error |
