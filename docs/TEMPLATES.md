# Template Guide

Complete guide for creating and customizing broadcast graphic templates.

## Template Schema

Templates are JSON objects that define the structure and appearance of broadcast graphics.

### Basic Structure

```json
{
  "id": "tpl_abc123",
  "name": "My Scoreboard",
  "version": "1.0.0",
  "category": "scoreboard",
  "sport": "cricket",
  "canvas": {
    "width": 1920,
    "height": 150,
    "background": "transparent"
  },
  "elements": [ ... ],
  "animations": {
    "enter": { ... },
    "exit": { ... }
  }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique template identifier |
| `name` | string | Human-readable template name |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `elements` | array | Array of element definitions |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Template category |
| `sport` | string | Target sport |
| `canvas` | object | Canvas dimensions and background |
| `animations` | object | Enter/exit animations |
| `isPublic` | boolean | Whether template is publicly visible |

---

## Template Categories

| Category | Description | Typical Size |
|----------|-------------|--------------|
| `lower-third` | Lower third graphics | 1920x200 |
| `full-screen` | Full screen graphics | 1920x1080 |
| `ticker` | Scrolling tickers | 1920x60 |
| `scoreboard` | Score displays | 1920x150 |
| `player-card` | Player statistics | 400x500 |

---

## Element Types

### Text Element

Displays text content with styling.

```json
{
  "id": "team-name",
  "type": "text",
  "position": {
    "x": 100,
    "y": 20,
    "width": 200,
    "height": 40,
    "zIndex": 1
  },
  "style": {
    "fontSize": "24px",
    "fontWeight": "700",
    "color": "#ffffff",
    "fontFamily": "Inter"
  },
  "content": "Team Name",
  "binding": "battingTeam.short"
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `content` | string | Static text content |
| `binding` | string | Dynamic data binding path |
| `style.fontSize` | string | Font size (CSS) |
| `style.fontWeight` | string | Font weight (100-900, bold, etc.) |
| `style.color` | string | Text color (CSS) |
| `style.fontFamily` | string | Font family |
| `style.textAlign` | string | Text alignment (left, center, right) |
| `style.textTransform` | string | Text transform (uppercase, lowercase) |

### Shape Element

Displays colored rectangles, backgrounds, or decorative elements.

```json
{
  "id": "score-box",
  "type": "shape",
  "position": {
    "x": 500,
    "y": 20,
    "width": 200,
    "height": 110
  },
  "style": {
    "background": "#c0392b",
    "borderRadius": "4px",
    "boxShadow": "0 2px 8px rgba(0,0,0,0.3)"
  }
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `style.background` | string | Background color or gradient |
| `style.borderRadius` | string | Border radius (CSS) |
| `style.boxShadow` | string | Box shadow (CSS) |
| `style.border` | string | Border (CSS) |
| `style.opacity` | number | Opacity (0-1) |

### Image Element

Displays an image.

```json
{
  "id": "team-logo",
  "type": "image",
  "position": {
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 100
  },
  "src": "/images/team-logo.png",
  "style": {
    "objectFit": "contain"
  }
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `src` | string | Image URL or path |
| `binding` | string | Dynamic image source |
| `style.objectFit` | string | Image fit (cover, contain, fill) |

### Score Element

Specialized element for displaying scores.

```json
{
  "id": "runs-display",
  "type": "score",
  "position": {
    "x": 520,
    "y": 30,
    "width": 80,
    "height": 60
  },
  "style": {
    "fontSize": "56px",
    "fontWeight": "800",
    "color": "#fff",
    "fontFamily": "Teko"
  },
  "binding": "innings.runs"
}
```

### Timer Element

Displays a running timer or clock.

```json
{
  "id": "match-timer",
  "type": "timer",
  "position": {
    "x": 1800,
    "y": 10,
    "width": 100,
    "height": 30
  },
  "style": {
    "fontSize": "18px",
    "color": "#fff"
  },
  "binding": "matchTime",
  "format": "HH:mm:ss"
}
```

### Ticker Element

Scrolling text ticker.

```json
{
  "id": "news-ticker",
  "type": "ticker",
  "position": {
    "x": 0,
    "y": 1020,
    "width": 1920,
    "height": 60
  },
  "style": {
    "background": "#1a1a2e",
    "color": "#fff",
    "fontSize": "20px"
  },
  "content": "Breaking: Team A wins the toss and elects to bat"
}
```

---

## Data Bindings

Data bindings allow elements to display dynamic data from the match state.

### Binding Syntax

```json
"binding": "path.to.value"
```

### Available Bindings

#### Match State

| Binding | Description |
|---------|-------------|
| `matchId` | Match identifier |
| `status` | Match status |
| `matchType` | Match type (T20, ODI, etc.) |
| `venue` | Match venue |
| `tournamentName` | Tournament name |
| `result` | Match result |

#### Team Data

| Binding | Description |
|---------|-------------|
| `battingTeam.name` | Batting team full name |
| `battingTeam.short` | Batting team short name |
| `battingTeam.primaryColor` | Primary team color |
| `battingTeam.secondaryColor` | Secondary team color |
| `bowlingTeam.name` | Bowling team full name |
| `bowlingTeam.short` | Bowling team short name |
| `bowlingTeam.primaryColor` | Primary team color |
| `bowlingTeam.secondaryColor` | Secondary team color |

#### Innings Data

| Binding | Description |
|---------|-------------|
| `innings.runs` | Current runs |
| `innings.wickets` | Current wickets |
| `innings.overs` | Completed overs |
| `innings.balls` | Balls in current over |
| `innings.runRate` | Current run rate |
| `innings.target` | Target score (when chasing) |
| `innings.requiredRunRate` | Required run rate |
| `innings.runsNeeded` | Runs needed to win |
| `innings.ballsRemaining` | Balls remaining |

#### Batter Data

| Binding | Description |
|---------|-------------|
| `striker.name` | Striker name |
| `striker.runs` | Striker runs |
| `striker.balls` | Striker balls faced |
| `striker.fours` | Striker fours |
| `striker.sixes` | Striker sixes |
| `striker.strikeRate` | Striker strike rate |
| `nonStriker.name` | Non-striker name |
| `nonStriker.runs` | Non-striker runs |
| `nonStriker.balls` | Non-striker balls faced |

#### Bowler Data

| Binding | Description |
|---------|-------------|
| `bowler.name` | Bowler name |
| `bowler.overs` | Overs bowled |
| `bowler.balls` | Balls in current over |
| `bowler.maidens` | Maiden overs |
| `bowler.runs` | Runs conceded |
| `bowler.wickets` | Wickets taken |
| `bowler.economy` | Economy rate |

### Template Strings

Use template syntax for complex bindings:

```json
{
  "binding": "{{bowler.wickets}}/{{bowler.runs}} ({{bowler.overs}}.{{bowler.balls}})"
}
```

```json
{
  "binding": "Need {{innings.runsNeeded}} from {{innings.ballsRemaining}} balls"
}
```

### Conditional Display

Use `condition` to show/hide elements based on state:

```json
{
  "id": "target-box",
  "type": "shape",
  "condition": "isChasing",
  "style": { "background": "#27ae60" }
}
```

**Available Conditions:**

| Condition | Description |
|-----------|-------------|
| `isChasing` | True when second innings and chasing |
| `isFirstInnings` | True during first innings |
| `isSecondInnings` | True during second innings |
| `isOut` | True when all out |
| `isAllOut` | True when 10 wickets fall |

---

## Animation Presets

### Entry Animations

| Preset | Description |
|--------|-------------|
| `slide-in-left` | Slide in from left |
| `slide-in-right` | Slide in from right |
| `slide-in-top` | Slide in from top |
| `slide-in-bottom` | Slide in from bottom |
| `fade-in` | Fade in |
| `fade-in-up` | Fade in with upward motion |
| `fade-in-down` | Fade in with downward motion |
| `scale-in` | Scale in from center |
| `scale-in-bounce` | Scale in with bounce effect |
| `scale-in-elastic` | Scale in with elastic effect |
| `flip-in-x` | Flip in on X axis |
| `flip-in-y` | Flip in on Y axis |
| `rotate-in` | Rotate in |
| `blur-in` | Blur in |
| `wipe-left` | Wipe reveal from left |
| `wipe-right` | Wipe reveal from right |
| `split-horizontal` | Split open horizontally |
| `split-vertical` | Split open vertically |
| `typewriter` | Typewriter effect |
| `bounce-in` | Bounce in |
| `zoom-in` | Zoom in |

### Exit Animations

| Preset | Description |
|--------|-------------|
| `slide-out-left` | Slide out to left |
| `slide-out-right` | Slide out to right |
| `slide-out-top` | Slide out to top |
| `slide-out-bottom` | Slide out to bottom |
| `fade-out` | Fade out |
| `scale-out` | Scale out |
| `flip-out-x` | Flip out on X axis |
| `flip-out-y` | Flip out on Y axis |
| `rotate-out` | Rotate out |
| `blur-out` | Blur out |
| `zoom-out` | Zoom out |

### Effect Animations

| Preset | Description |
|--------|-------------|
| `glow-pulse` | Pulsing glow effect |
| `shimmer` | Shimmer/sweep effect |
| `swing` | Swing animation |
| `count-up` | Number count up effect |

### Applying Animations

```json
{
  "animation": {
    "enter": "slide-in-bottom",
    "exit": "slide-out-bottom",
    "duration": 0.5,
    "stagger": 0.05
  }
}
```

---

## Scene Transitions

| Transition | Description | Default Duration |
|------------|-------------|------------------|
| `cut` | Instant switch | 0s |
| `fade` | Crossfade | 0.5s |
| `fade-slow` | Slow crossfade | 1.0s |
| `fade-fast` | Fast crossfade | 0.25s |
| `slide-left` | Slide from right | 0.6s |
| `slide-right` | Slide from left | 0.6s |
| `slide-up` | Slide from bottom | 0.6s |
| `slide-down` | Slide from top | 0.6s |
| `wipe-left` | Wipe from left | 0.5s |
| `wipe-right` | Wipe from right | 0.5s |
| `wipe-up` | Wipe from top | 0.5s |
| `wipe-down` | Wipe from bottom | 0.5s |

---

## Creating Custom Templates

### Step-by-Step Guide

1. **Plan the Layout**
   - Determine canvas size (typically 1920x1080 or smaller for overlays)
   - Sketch element positions
   - Identify dynamic data bindings

2. **Create the Template File**
   ```json
   {
     "id": "tpl_custom_001",
     "name": "Custom Scoreboard",
     "version": "1.0.0",
     "category": "scoreboard",
     "sport": "cricket",
     "canvas": { "width": 1920, "height": 150 }
   }
   ```

3. **Add Elements**
   - Start with background shapes
   - Add text elements with bindings
   - Layer elements using zIndex

4. **Style Elements**
   - Use consistent color scheme
   - Match team colors with bindings
   - Ensure readable font sizes

5. **Add Animations**
   - Set enter/exit animations
   - Configure stagger for multi-element reveals

6. **Test and Refine**
   - Use the Template Editor in SportsCaster
   - Test with live match data
   - Adjust positioning and timing

### Example: Simple Scorebug

```json
{
  "id": "tpl_scorebug_simple",
  "name": "Simple Scorebug",
  "version": "1.0.0",
  "category": "scoreboard",
  "sport": "cricket",
  "canvas": { "width": 1920, "height": 150 },
  "elements": [
    {
      "id": "bg",
      "type": "shape",
      "position": { "x": 0, "y": 0, "width": 1920, "height": 150 },
      "style": { "background": "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)" }
    },
    {
      "id": "team-color",
      "type": "shape",
      "position": { "x": 0, "y": 0, "width": 80, "height": 150 },
      "style": { "background": "{{battingTeam.primaryColor}}" }
    },
    {
      "id": "team-short",
      "type": "text",
      "position": { "x": 10, "y": 55, "width": 60, "height": 40 },
      "style": { "fontSize": "28px", "fontWeight": "800", "color": "#fff", "textAlign": "center" },
      "binding": "battingTeam.short"
    },
    {
      "id": "score",
      "type": "text",
      "position": { "x": 100, "y": 30, "width": 200, "height": 90 },
      "style": { "fontSize": "72px", "fontWeight": "800", "color": "#fff", "fontFamily": "Teko" },
      "binding": "{{innings.runs}}/{{innings.wickets}}"
    },
    {
      "id": "overs",
      "type": "text",
      "position": { "x": 100, "y": 110, "width": 200, "height": 30 },
      "style": { "fontSize": "20px", "color": "rgba(255,255,255,0.7)" },
      "binding": "{{innings.overs}}.{{innings.balls}} overs"
    }
  ],
  "animation": {
    "enter": "slide-in-bottom",
    "exit": "slide-out-bottom",
    "duration": 0.5
  }
}
```

---

## Built-in Templates

### Cricket

| Template | Category | Description |
|----------|----------|-------------|
| Scoreboard | scoreboard | Main score display with batter/bowler stats |
| Ball-by-Ball | ticker | Scoring progression ticker |
| Player Card | player-card | Individual batter/bowler stats |
| Partnership | scoreboard | Batting partnership display |
| Match Summary | full-screen | End-of-match summary |

### Football

| Template | Category | Description |
|----------|----------|-------------|
| Scoreboard | scoreboard | Match score with team logos |
| Substitution | lower-third | Player substitution graphic |

### Tennis

| Template | Category | Description |
|----------|----------|-------------|
| Scoreboard | scoreboard | Set/match score display |
| Set Score | scoreboard | Individual set breakdown |
| Serve Indicator | ticker | Service status indicator |

### Basketball

| Template | Category | Description |
|----------|----------|-------------|
| Scoreboard | scoreboard | Quarter/game score display |

---

## Using the Visual Editor

### Getting Started

1. Navigate to **Editor** in the sidebar
2. Click **New Template** to create from scratch
3. Or select an existing template from the Library

### Canvas Features

The visual editor provides a 1920x1080 canvas with:

- **Grid Overlay** — Toggle with `Ctrl+G` for precise alignment
- **Rulers** — Horizontal and vertical measurement guides
- **Smart Guides** — Automatic alignment when moving elements
- **Zoom** — `Ctrl+Scroll` to zoom in/out
- **Pan** — Hold `Space` and drag to pan

### Adding Elements

1. Click the **+** button in the toolbar
2. Select element type:
   - **Text** — Static or dynamic text
   - **Shape** — Rectangles, backgrounds
   - **Image** — Logos, photos
   - **Score** — Specialized score display
   - **Timer** — Clock/timer display
   - **Ticker** — Scrolling text

3. Click on the canvas to place
4. Drag to reposition, resize handles to resize

### Editing Properties

Select any element to edit its properties:

- **Position** — X, Y coordinates
- **Size** — Width, Height
- **Typography** — Font, Size, Weight, Color
- **Colors** — Fill, Stroke, Opacity
- **Effects** — Shadow, Border, Border Radius
- **Data Binding** — Connect to match data

### Managing Layers

The Layer panel shows all elements:

- **Reorder** — Drag layers up/down
- **Visibility** — Eye icon to show/hide
- **Lock** — Lock icon to prevent editing
- **Opacity** — Slider for transparency

### Animations

The Timeline panel manages animations:

1. Select an element
2. Click **Add Animation**
3. Choose type: Enter, Exit, or Effect
4. Set timing and easing
5. Preview with Play button

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate |
| `Ctrl+G` | Toggle grid |
| `Delete` | Delete selected |
| `Ctrl+A` | Select all |
| `Ctrl+Shift+G` | Group elements |

---

## Template Presets

### Scoreboard Presets

| Preset | Description | Typical Size |
|--------|-------------|--------------|
| Bottom Strip | Classic bottom-third scoreboard | 1920x150 |
| Top Strip | Top-third scoreboard | 1920x100 |
| Corner Bug | Small corner overlay | 300x100 |
| Full Width | Full-width bottom bar | 1920x200 |

### Player Card Presets

| Preset | Description | Typical Size |
|--------|-------------|--------------|
| Batter Card | Individual batter stats | 400x500 |
| Bowler Card | Individual bowler stats | 400x500 |
| Player Profile | Photo + stats combo | 500x600 |

### Graphics Presets

| Preset | Description | Typical Size |
|--------|-------------|--------------|
| Lower Third | Name/title graphic | 1920x120 |
| Full Screen | Complete match summary | 1920x1080 |
| Ticker | Scrolling news ticker | 1920x60 |
| Transition | Scene transition graphic | 1920x1080 |

---

## Element Presets

### Score Combos

Pre-built element combinations for common score displays:

```json
{
  "name": "Score Combo",
  "elements": [
    {
      "id": "bg",
      "type": "shape",
      "style": { "background": "#1a1a2e" }
    },
    {
      "id": "team-color",
      "type": "shape",
      "style": { "background": "{{battingTeam.primaryColor}}" }
    },
    {
      "id": "score",
      "type": "text",
      "binding": "{{innings.runs}}/{{innings.wickets}}"
    }
  ]
}
```

### Player Combos

Pre-built combinations for player displays:

- **Player with Photo** — Image + Name + Stats
- **Player Stats** — Multiple stat rows
- **Player Comparison** — Side-by-side stats

### Graphic Combos

Pre-built decorative elements:

- **Gradient Bar** — Gradient background with text
- **Icon Badge** — Icon with label
- **Data Table** — Structured data display

---

## Style Presets

### Broadcast Styles

Professional broadcast graphic styles:

| Style | Description | Use Case |
|-------|-------------|----------|
| Dark | Dark background, light text | Scoreboards |
| Light | Light background, dark text | Daytime events |
| Gradient | Gradient backgrounds | Modern look |
| Transparent | Semi-transparent backgrounds | Overlays |

### Sport Styles

Sport-specific styling:

| Style | Colors | Typography |
|-------|--------|------------|
| Cricket | Green, white, red | Bold, large scores |
| Football | Green, white | Clean, modern |
| Tennis | Blue, white | Elegant, minimal |
| Basketball | Orange, black | Bold, dynamic |

### Creating Custom Styles

Save your own style presets:

1. Design your template
2. Click **Save as Preset**
3. Name your preset
4. Select which properties to save:
   - Colors
   - Typography
   - Effects
   - Spacing

### Applying Styles

1. Select elements
2. Open Style panel
3. Choose from preset list
4. Click to apply

---

## Template Validation

Templates are validated against the schema before saving:

### Required Fields

- `id` — Must be a string
- `name` — Must be a non-empty string
- `version` — Must be a string
- `elements` — Must be an array

### Element Validation

Each element must have:
- `id` — Unique within the template
- `type` — One of: text, image, shape, score, timer, ticker
- `position` — Object with x, y, width, height

### Validation Errors

```json
{
  "error": "Invalid template",
  "details": [
    "Element 'team-name' missing required field: position",
    "Duplicate element id: 'score-box'"
  ]
}
```

---

## Best Practices

### Performance

- Limit the number of elements (aim for <50 per template)
- Use simple shapes over complex SVGs
- Minimize animation complexity for real-time use
- Pre-render static elements when possible

### Accessibility

- Use high-contrast colors
- Ensure text is readable at broadcast resolution
- Avoid flashing animations (use fade instead)

### Maintainability

- Use descriptive element IDs
- Group related elements logically
- Document custom bindings
- Version your templates

### Broadcast Quality

- Test at 1920x1080 resolution
- Ensure safe margins for overscan
- Use broadcast-safe colors
- Test with different team colors
