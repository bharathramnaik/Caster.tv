# User Guide

Complete guide for using SportsCaster as a broadcast operator.

## Getting Started

### First Time Setup

1. Open SportsCaster in your browser (default: `http://localhost:5173`)
2. Register an account or login with existing credentials
3. Register your teams with custom colors
4. Create a match between two teams
5. Start scoring and controlling overlays

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features, user management |
| **Producer** | Create/edit templates, scenes, control live broadcast |
| **Operator** | Score matches, basic overlay control |

---

## Creating Teams

1. Navigate to **Teams** from the sidebar
2. Click **Register Team**
3. Fill in:
   - **Team Name** — Full team name (e.g., "Mumbai Indians")
   - **Short Name** — 2-3 letter abbreviation (e.g., "MI")
   - **Primary Color** — Main team color (used for backgrounds)
   - **Secondary Color** — Accent color (used for text/highlights)
4. Click **Save**

Teams are used in match overlays with their custom colors applied dynamically.

---

## Creating a Match

1. Click **New Match** from the home page
2. Configure match settings:
   - **Team A** / **Team B** — Select from registered teams
   - **Match Type** — T20, ODI, Test, Custom
   - **Max Overs** — Number of overs per innings
   - **Venue** — Match location
   - **Tournament Name** — Competition name
   - **Toss Winner** — Which team won the toss
   - **Toss Decision** — Bat or Bowl first
3. Click **Create Match**

---

## Scoring a Match

### Starting an Innings

1. Open the **Control Panel** for your match (`/control/:matchId`)
2. Click **Start Innings**
3. Enter:
   - **Batting Team** — Select team
   - **Striker** — First batter name
   - **Non-Striker** — Second batter name
   - **Bowler** — Opening bowler name
4. Click **Start**

### Scoring Balls

Use the control panel buttons to score:

| Button | Action |
|--------|--------|
| **0-6** | Normal runs scored |
| **WD** | Wide ball (+1 run, no ball added) |
| **NB** | No ball (+1 run, no ball added) |
| **B** | Bye (+ runs, no ball added) |
| **LB** | Leg bye (+ runs, no ball added) |
| **W** | Wicket (enter new batter name) |

### Automatic Features

- **Strike Rotation** — Strike rotates on odd runs and end of over
- **Over Completion** — Automatically detected after 6 legal balls
- **Maiden Over** — Tracked when no runs scored off legal deliveries
- **Run Rate** — Calculated in real-time (CRR)
- **Required Run Rate** — Calculated when chasing a target

### Undo

Click **Undo** or press `Ctrl+Z` to revert the last action. Up to 100 actions can be undone.

### Changing Bowlers

Click **Change Bowler** to switch the current bowler at the start of a new over.

### Ending an Innings

Click **End Innings** when:
- All 10 wickets fall
- All overs are completed
- Target is chased
- Team declares (in Test matches)

---

## Managing Overlays

### Overlay Templates

SportsCaster provides 7 broadcast-ready templates:

1. **Scoreboard** — Bottom strip with live scores, batter/bowler stats
2. **Milestone Flash** — Auto-triggered for boundaries and wickets
3. **Batter Card** — Detailed batter statistics
4. **Bowler Card** — Detailed bowler statistics
5. **Over Summary** — Over-by-over breakdown
6. **Center Scorecard** — Full match statistics
7. **Pre-Match Card** — Team lineups before innings

### Using with OBS

1. Open OBS Studio
2. Add a new **Browser Source**
3. Set the URL to your SportsCaster overlay URL:
   ```
   http://localhost:3001/overlay/:matchId
   ```
4. Set width: `1920`, height: `1080`
5. Check **Shutdown source when not visible** for performance

### Overlay Commands

From the control panel, you can:

- **Show/Hide Scoreboard** — Toggle the main scoreboard
- **Show Milestone** — Manually trigger a milestone flash
- **Show Batter Card** — Display detailed batter stats
- **Show Bowler Card** — Display detailed bowler stats
- **Show Over Summary** — Display over breakdown

---

## Scene Management

### Creating Scenes

1. Navigate to **Scenes** from the sidebar
2. Click **New Scene**
3. Add layers by selecting templates
4. Configure each layer:
   - Position (x, y, width, height)
   - Visibility
   - Opacity
   - Data bindings
5. Set scene transitions
6. Save the scene

### Scene Layers

Each layer represents a template placed on the canvas:

- **Template** — The graphic template to use
- **Position** — Where to place it on the 1920x1080 canvas
- **Visibility** — Show or hide the layer
- **Opacity** — Transparency level (0-1)
- **Lock** — Prevent accidental edits
- **Data** — Custom data to bind to template elements

### Scene Transitions

Configure how scenes enter and exit:

| Transition | Description |
|------------|-------------|
| `fade` | Smooth crossfade |
| `slide-left` | Slide in from right |
| `slide-right` | Slide in from left |
| `wipe-left` | Wipe reveal from left |
| `cut` | Instant switch |

---

## Going Live

### Live Control Panel

1. Navigate to **Live** from the sidebar
2. Select the active scene
3. Use the controls to:
   - Switch scenes
   - Toggle layer visibility
   - Update layer data
   - Trigger transitions

### Broadcast Output

Get your broadcast output URL:

1. Click **Get Output URL** in the Live Control Panel
2. Use the preview URL for OBS Browser Source
3. The output resolution is 1920x1080

### Real-Time Updates

All changes in the control panel are pushed to connected clients via WebSocket. The overlay updates instantly without page refresh.

---

## Export Options

### CSV Export

Export match scorecards as CSV:

1. Open the match details
2. Click **Export CSV**
3. Download includes:
   - Match metadata
   - Batting scorecards
   - Bowling figures
   - Fall of wickets

### Scene Export

Export scenes in various formats:

| Format | Description |
|--------|-------------|
| `html` | Standalone HTML file |
| `obs` | Optimized for OBS Browser Source |
| `ndi` | NDI-compatible output |
| `streaming` | Generic streaming output |
| `json` | Scene definition as JSON |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last action |
| `Ctrl+S` | Save current scene |
| `Space` | Toggle overlay visibility |
| `1-6` | Quick switch scenes |
| `Esc` | Close modals |

---

## Troubleshooting

### Overlay Not Showing

1. Check the browser source URL is correct
2. Verify the match has started (innings in progress)
3. Ensure WebSocket connection is established (check console)
4. Confirm CORS_ORIGINS includes your OBS source URL

### Score Not Updating

1. Verify you're connected to the match room
2. Check the control panel shows "Connected"
3. Try refreshing the control panel page

### WebSocket Connection Issues

1. Check server is running (`http://localhost:3001/api/health`)
2. Verify CORS_ORIGINS environment variable
3. Check firewall/proxy settings for WebSocket support

### Performance Issues

1. Reduce overlay complexity (fewer layers)
2. Use hardware acceleration in OBS
3. Close unnecessary browser tabs
4. Check network latency between server and client

---

## Tips for Broadcast Operators

1. **Pre-load scenes** — Create and test all scenes before going live
2. **Use keyboard shortcuts** — Faster than mouse clicks during live broadcast
3. **Test overlays** — Preview overlays before going live
4. **Monitor connection** — Keep an eye on WebSocket status
5. **Have backup** — Keep a backup scene ready for emergencies
6. **Communicate** — Coordinate with commentators and production team

---

## Using the Template Editor

### Accessing the Editor

1. Navigate to **Editor** from the sidebar
2. Click **New Template** or select an existing template
3. The visual editor opens with a 1920x1080 canvas

### Canvas Features

- **Grid** — Toggle grid overlay for precise alignment
- **Rulers** — Horizontal and vertical rulers for measurement
- **Smart Guides** — Automatic alignment guides when moving elements
- **Zoom** — Mouse wheel zoom (Ctrl + scroll)
- **Pan** — Hold Space + drag to pan the canvas

### Adding Elements

1. Click the **+** button in the toolbar
2. Select element type: Text, Shape, Image, Score, Timer, Ticker
3. Click on the canvas to place the element
4. Drag to reposition, resize handles to resize

### Element Properties

Select an element to edit its properties in the Inspector panel:

| Property Type | Description |
|--------------|-------------|
| Position | X, Y coordinates |
| Size | Width, Height |
| Typography | Font, Size, Weight, Color, Alignment |
| Colors | Fill, Stroke, Opacity |
| Effects | Shadow, Border, Border Radius |
| Data Binding | Connect to match state fields |

### Layer Management

The Layer panel shows all elements in the template:

- **Reorder** — Drag layers up/down
- **Visibility** — Eye icon to show/hide
- **Lock** — Lock icon to prevent editing
- **Opacity** — Slider for transparency
- **Group** — Select multiple elements to group

---

## Creating Custom Templates

### Step-by-Step Guide

1. **Plan Your Layout**
   - Determine canvas size (1920x1080 for full-screen, smaller for overlays)
   - Sketch element positions
   - Identify which data fields to bind

2. **Create Background**
   - Add shape elements for backgrounds
   - Use gradients or solid colors
   - Set appropriate opacity

3. **Add Text Elements**
   - Add static text for labels
   - Add dynamic text with data bindings
   - Style with appropriate fonts

4. **Add Dynamic Elements**
   - Score displays with binding to `innings.runs`
   - Team names with binding to `battingTeam.short`
   - Player stats with binding to `striker.runs`

5. **Apply Animations**
   - Select element, go to Animation panel
   - Choose enter animation (e.g., slide-in-bottom)
   - Choose exit animation (e.g., slide-out-bottom)
   - Set duration and stagger

6. **Test Your Template**
   - Use Preview panel to test with sample data
   - Adjust positioning and styling
   - Test with live match data

### Template Presets

Use presets to quickly create common broadcast elements:

| Preset | Description |
|--------|-------------|
| Scorebug | Bottom strip with scores |
| Player Card | Individual player stats |
| Lower Third | Name/title graphic |
| Full Screen | Complete match summary |

### Element Presets

Combine multiple elements into reusable combos:

- **Score Combo** — Background + Team Color + Score Text
- **Player Combo** — Image + Name + Stats
- **Ticker Combo** — Background + Scrolling Text

### Style Presets

Apply consistent styling across elements:

- **Broadcast** — Professional dark theme
- **Sport** — Bold colors, large text
- **Minimal** — Clean, modern look
- **Custom** — Create your own presets

---

## Managing Layers

### Layer Order

Elements are rendered from bottom to top. The top layer appears in front.

1. Select a layer in the Layer panel
2. Drag up to bring forward
3. Drag down to send backward

### Layer Operations

| Operation | Description |
|-----------|-------------|
| Duplicate | Copy element with all properties |
| Group | Combine multiple elements |
| Ungroup | Separate grouped elements |
| Align | Align selected elements |
| Distribute | Space elements evenly |

### Keyboard Shortcuts for Layers

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Duplicate selected element |
| `Ctrl+G` | Group selected elements |
| `Ctrl+Shift+G` | Ungroup selected elements |
| `Ctrl+[` | Send backward |
| `Ctrl+]` | Bring forward |
| `Ctrl+Shift+[` | Send to back |
| `Ctrl+Shift+]` | Bring to front |

---

## Adding Animations

### Animation Timeline

The Animation Timeline shows all animations in your template:

1. Select an element
2. Click **Add Animation** in the Timeline panel
3. Choose animation type (Enter, Exit, Effect)
4. Set timing and easing

### Animation Types

| Type | Description |
|------|-------------|
| Enter | When element appears |
| Exit | When element disappears |
| Effect | Continuous animation |

### Timing Controls

- **Duration** — How long the animation takes (0.1s - 5s)
- **Delay** — Time before animation starts
- **Easing** — Motion curve (linear, ease-in, ease-out, bounce)
- **Stagger** — Delay between multiple elements

### Previewing Animations

1. Click **Play** in the Timeline panel
2. Watch the animation in the Preview panel
3. Adjust timing as needed
4. Preview with live data using **Test** button

---

## Exporting Templates

### Export Manager

Access the Export Manager from the Editor toolbar:

1. Click **Export** button
2. Choose export format
3. Configure export settings
4. Click **Export** to start

### Export Formats

| Format | Use Case |
|--------|----------|
| HTML | Standalone web page |
| Image (PNG) | Static screenshot |
| Video (MP4) | Animated export |
| OBS | Optimized for OBS Browser Source |
| vMix | Optimized for vMix |
| Embed | iframe embed code |

### Export Presets

Quick export configurations for common use cases:

| Preset | Settings |
|--------|----------|
| OBS | HTML, 1920x1080, transparent background |
| YouTube | PNG, 1920x1080, 80% quality |
| Social Media | PNG, 1200x630, 80% quality |
| Thumbnail | PNG, 400x300, 90% quality |

### Batch Export

Export multiple templates at once:

1. Select templates in the Library
2. Click **Batch Export**
3. Choose formats for each template
4. Click **Export All**
5. Download as ZIP when complete

### Export Queue

Monitor export progress:

- **Pending** — Waiting to process
- **Processing** — Currently exporting
- **Completed** — Ready to download
- **Failed** — Export error (check details)

---

## Template Versioning

### Version History

Every save creates a new version:

1. Open Template Editor
2. Click **Version History** in the toolbar
3. View all saved versions
4. Compare versions side-by-side
5. Restore to any version

### Version Comparison

1. Select two versions to compare
2. View differences in the Diff panel
3. See what changed (elements, styles, bindings)

### Best Practices

- Save major changes as separate versions
- Add notes to important versions
- Compare before restoring
- Keep 5-10 recent versions

---

## Template Sharing

### Share Options

Share templates with your team:

1. Open Template Library
2. Click **Share** on any template
3. Choose sharing method:

| Method | Description |
|--------|-------------|
| Link | Direct URL to template |
| Embed | iframe code for websites |
| QR Code | Scan to open on mobile |
| Social | Share on Twitter, Facebook, etc. |

### Custom Domain

Use your own domain for sharing:

1. Enter custom domain in the Share dialog
2. All links will use your domain
3. Example: `https://templates.yourdomain.com/editor/tpl_abc123`

### Access Control

| Visibility | Who Can Access |
|------------|----------------|
| Public | Anyone with the link |
| Private | Only you and collaborators |
| Team | Members of your organization |
