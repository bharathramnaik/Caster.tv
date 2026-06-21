# SportsCaster UX Review

**Reviewer:** UX Reviewer
**Date:** 2026-06-21
**Scope:** Full application flow - navigation, user journey, components, error handling, responsive design

---

## Table of Contents

1. [Current Flow Diagram](#1-current-flow-diagram)
2. [Identified Issues](#2-identified-issues)
3. [Recommended Improvements](#3-recommended-improvements)
4. [Priority Fixes](#4-priority-fixes)

---

## 1. Current Flow Diagram

### 1.1 Application Architecture

\\\
App.jsx (BrowserRouter + ThemeProvider)
+-- /                    -> Home (Landing page + Match Center)
+-- /match/new           -> CreateMatch (Match creation form)
+-- /control/:matchId    -> ControlPanel (Ball-by-ball scoring)
+-- /overlay/:matchId    -> Overlay (OBS transparent overlay)
+-- /score/:matchId      -> Scoreboard (Public scorecard view)
+-- /teams               -> Teams (Team registration)
+-- /points              -> PointsTable (Tournament standings)
+-- /editor              -> TemplateEditor (NEW - create template)
+-- /editor/:templateId  -> TemplateEditor (EDIT - existing template)
+-- /scenes              -> SceneManager (Scene composition)
+-- /scenes/:sceneId     -> SceneManager (Scene with ID)
+-- /live                -> LiveControlPanel (Broadcast control)
+-- /library             -> TemplateLibrary (Template browser)
\\\

### 1.2 Primary User Journey

\\\
New User Flow:
  Home -> [Register Teams] -> Create Match -> Control Panel -> Live Scoring
                                         \-> Overlay (OBS source)

Returning User Flow:
  Home -> [Select Match from grid] -> Resume Scoring -> Control Panel
       -> [View Score] -> Scoreboard
       -> [Stream Overlay] -> Overlay (new tab)

Template Editor Flow:
  Home -> [no direct link] -> Template Editor -> CanvasEditor + PropertyPanel + AnimationTimeline
                                          -> Save/Export

Scene Manager Flow:
  Home -> [no direct link] -> SceneManager -> Layer management + Transitions

Live Control Flow:
  Home -> [no direct link] -> LiveControlPanel -> Scene switching + Go Live
\\\

### 1.3 Data Flow

\\\
Client (React) <-> Server (Express + Socket.IO)
                   +-- /api/matches     -> CRUD + CSV export
                   +-- /api/teams       -> CRUD
                   +-- /api/points      -> GET
                   +-- /api/templates   -> CRUD (auth required)
                   +-- /api/scenes      -> CRUD (auth required)
                   +-- /api/playlists   -> CRUD (auth required)
                   +-- /api/live        -> Control (auth required)
                   +-- /api/projects    -> CRUD (auth required)
                   +-- /api/preview     -> Rendering + export
                   +-- Socket.IO        -> Real-time match state + overlay commands
\\\

---

## 2. Identified Issues

### 2.1 CRITICAL Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | **No global navigation bar** | App.jsx | Users have no persistent way to navigate between sections. Every page uses ad-hoc Home links. There is no way to discover /library, /editor, /scenes, or /live from the main UI. |
| C2 | **Template Editor, SceneManager, LiveControlPanel, TemplateLibrary are unreachable** | App.jsx routes vs Home.jsx | These 4 routes exist but have ZERO inbound links from the Home page or any other visible page. A new user would never find them. |
| C3 | **No login/registration UI** | Client-side | The server has full JWT auth (/api/users/register, /api/users/login), but the React client has NO login page, registration page, or auth state management. The auth system is server-only and invisible to users. |
| C4 | **No route protection** | App.jsx | All routes are publicly accessible. There is no auth guard, no redirect to login, no protected route wrapper. Template create/edit endpoints require requireAuth on the server, but the client never sends a JWT token. |
| C5 | **Template save will always fail** | TemplateEditor.jsx:140-158 | saveTemplate calls POST /api/templates or PUT /api/templates/:id, but the server requires requireAuth. The client sends no auth headers. Every save attempt will get a 401. |
| C6 | **SceneManager save will always fail** | SceneManager.jsx:170-184 | Same issue - POST /api/scenes requires auth but no token is sent. |
| C7 | **Teams page has no error feedback** | Teams.jsx:28-46 | catch(() => {}) silently swallows all errors. If the API is down, users see an empty list with no explanation. |
| C8 | **CreateMatch has no error feedback** | CreateMatch.jsx:58-73 | On API failure, console.error(err) is called but user sees nothing - the button stays disabled in Creating... state indefinitely. |

### 2.2 MAJOR Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| M1 | **No Getting Started guidance** | Home.jsx | New users land on a marketing-style page but there is no onboarding, no tooltip, no step-by-step guide for first-time use. The How It Works section is informational but not actionable. |
| M2 | **Template Library uses hardcoded DEMO_TEMPLATES** | TemplateLibrary.jsx:14-27 | When the API returns data, it is used. But the fallback is hardcoded demo data, meaning users might confuse demo templates with their own. The demo templates have no real preview data. |
| M3 | **LiveControlPanel uses hardcoded DEMO_SCENES** | LiveControlPanel.jsx:4-11 | The entire LiveControlPanel is disconnected from real data. It uses local state with demo scenes and never communicates with the server or SceneManager. It is essentially a mockup. |
| M4 | **SceneManager has no link to TemplateLibrary** | SceneManager.jsx | When adding a layer, the templateId is an empty string. There is no template picker, no browse library button, no way to actually select which template a layer should use. |
| M5 | **No unsaved changes warning** | TemplateEditor.jsx, SceneManager.jsx | If a user makes edits and navigates away, all changes are lost. No beforeunload handler, no Unsaved changes prompt. |
| M6 | **CanvasEditor resize handles do not work** | CanvasEditor.jsx:44-49 | Resize handles (NW, NE, SW, SE) are rendered but there is no drag handler attached. They are purely visual - users see handles but cannot resize elements. |
| M7 | **Pan (middle-click/scroll) does not work** | CanvasEditor.jsx | The pan state exists but there is no mouse handler to update it. The canvas viewport has onWheel for zoom but no pan mechanism. |
| M8 | **Keyboard shortcuts in CanvasEditor conflict** | CanvasEditor.jsx:148-156 | Delete/Backspace deletes elements globally - even when typing in the PropertyPanel textarea. The handler does not check if focus is in an input. |
| M9 | **AnimationTimeline playback does not actually animate** | AnimationTimeline.jsx | Play/Pause buttons update state but there is no actual animation loop (requestAnimationFrame) that interpolates element properties over time. |
| M10 | **PreviewPanel preview rendering is incomplete** | PreviewPanel.jsx | It tries to fetch /api/preview/template/:id but the iframe approach is fragile. The data editor only shows flat key-value pairs without any context. |
| M11 | **Match deletion has no confirmation for irreversible data** | ControlPanel.jsx, Home.jsx | Home page does not expose delete. But DELETE /api/matches/:id has no soft-delete or archive - data is gone permanently. |
| M12 | **No 404 page** | App.jsx | Navigating to a non-existent route shows a blank white screen. No fallback/catch-all route. |
| M13 | **Undo button appears twice** | ControlPanel.jsx:181, 237 | The undo button appears in both the Runs section and the Actions section, causing confusion about which one to use. |
| M14 | **Extra runs selector defaults to 0** | ControlPanel.jsx:210 | Default extraRuns is 0, so Wide and No Ball buttons show Wide and No Ball without run count. The UI does not make this clear. |
| M15 | **No mobile-first considerations for ControlPanel** | ControlPanel.jsx | The scoring buttons have min-width: 68px and min-height: 68px, but on a 320px phone, the 4-column grid results in very tight buttons. |

### 2.3 MINOR Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| m1 | **Theme toggle only on Home page** | Home.jsx:41 | The dark/light theme toggle is only accessible from the Home hero section. On other pages, users cannot switch themes. |
| m2 | **No favicon or page titles** | main.jsx, index.html | The app has no dynamic page titles and likely no favicon. |
| m3 | **Footer says 2026 statically** | Home.jsx:192 | Hardcoded year will become stale. Should use new Date().getFullYear(). |
| m4 | **Scoreboard tabs are redundant** | Scoreboard.jsx:166-171 | The Scorecard tab already shows both batting and bowling tables. The separate Batting and Bowling tabs show the exact same data. |
| m5 | **Team delete uses confirm()** | Teams.jsx:43 | Browser-native confirm() dialog is inconsistent with the app design system. Should use a custom modal. |
| m6 | **ControlPanel End Innings uses confirm()** | ControlPanel.jsx:231 | Same issue - should use a custom confirmation modal. |
| m7 | **Inconsistent card hover effects** | index.css:166-167 | .card:hover has a translateY(-2px) transform, but .card-static:hover disables it. Many cards are .card-static which is correct, but the intent is not clear. |
| m8 | **No loading state for CreateMatch teams fetch** | CreateMatch.jsx:28-29 | The registered teams list loads silently. If the fetch is slow, the team chips section is empty with no loading indicator. |
| m9 | **Template editor preview uses hard-coded 0.5 scale** | TemplateEditor.jsx:294-295 | The preview modal renders at 50% scale regardless of actual canvas size. |
| m10 | **SceneManager does not load saved scenes from API** | SceneManager.jsx:89 | Scenes are always initialized fresh from createEmptyScene(0). The sceneId param is read but never used to load existing scene data. |
| m11 | **Points table loads all matches unnecessarily** | PointsTable.jsx:12-13 | The component fetches both /api/points (which already computes standings) AND /api/matches separately. |
| m12 | **No keyboard shortcut hints** | CanvasEditor.jsx | Keyboard shortcuts (V for select, T for text, R for shape, G for grid) are documented in tooltips but discoverability is poor. |
| m13 | **PropertyPanel rotation slider range is -360 to 360** | PropertyPanel.jsx:181 | But the value is stored as a decimal (0.01 step). For a full rotation, users need to drag across a very long slider. |
| m14 | **Import error handling is silent** | TemplateLibrary.jsx:104 | catch {} on JSON parse means invalid imports are silently ignored. |
| m15 | **Overlay command show-over-summary only shows last 6 overs** | Overlay.jsx:457 | The OverSummary template hard-codes overs.slice(-6) with no way to configure. |

---

## 3. Recommended Improvements

### 3.1 Navigation and Information Architecture

**Add a persistent navigation bar** that appears on all pages (except Overlay):

\\\
+-------------------------------------------------------------------+
| SportsCaster    [Matches] [Teams] [Templates] [Scenes]       [moon] |
+-------------------------------------------------------------------+
\\\

- Include links to: Home/Matches, Teams, Template Library, Scene Manager
- Add the theme toggle to the nav bar (always accessible)
- Show connection status indicator
- Highlight the active page

**Add a 404 page** with helpful links back to the home page.

**Add breadcrumb navigation** for nested pages (e.g., Home > Templates > Edit: My Template).

### 3.2 Onboarding and First-Time Experience

**Add an onboarding flow:**

1. **Welcome screen** - Brief intro with Get Started CTA
2. **Step 1: Register Teams** - Pre-fill with example teams (CSK, MI, RCB, etc.)
3. **Step 2: Create Match** - Guided form with tooltips
4. **Step 3: Start Scoring** - Auto-redirect to Control Panel with a quick tutorial overlay
5. **Step 4: Set Up OBS** - Copy overlay URL + OBS setup instructions

**Add contextual help:**
- Tooltip icons (?) next to complex fields (match type, toss decision)
- What is this? links on less obvious features
- First-time user badges/highlights on key actions

### 3.3 Authentication and User Management

**Build the client-side auth system:**

1. **Login page** (/login) - Email + password form
2. **Register page** (/register) - Name + email + password + role selection
3. **Auth context** - Store JWT token in localStorage, provide via React context
4. **Protected route wrapper** - Redirect unauthenticated users to login
5. **User profile page** - Edit name, email, password, view role
6. **Logout functionality** - Clear token, redirect to home

**Add to the nav bar:**
\\\
[User Avatar/Name dropdown] -> Profile | Settings | Logout
\\\

### 3.4 Template Editor Improvements

**Fix critical bugs:**
1. Implement resize handles with actual drag-to-resize logic
2. Add pan support (middle-click drag or Space+drag)
3. Fix keyboard shortcuts to check input focus before acting
4. Implement actual animation playback with requestAnimationFrame

**Improve usability:**
1. Add element alignment guides (snap to center, edges, other elements)
2. Add multi-select with Shift+Click and bounding box selection
3. Add undo/redo for template editing (Ctrl+Z / Ctrl+Shift+Z)
4. Add Duplicate Element action (Ctrl+D)
5. Add element layers list in the sidebar (similar to Photoshop)
6. Show element dimensions and position in real-time during drag
7. Add zoom-to-fit and zoom-to-selection buttons
8. Add ruler guides on canvas edges

**Add missing features:**
1. Element grouping (select multiple, group/ungroup)
2. Copy/paste elements between templates
3. Template version history
4. Auto-save every 30 seconds
5. Unsaved changes browser warning

### 3.5 SceneManager Improvements

**Connect to real data:**
1. Load saved scenes from API on mount
2. Add a template picker when adding a layer (browse from TemplateLibrary)
3. Add drag-to-reorder scenes
4. Add scene preview thumbnails (rendered canvas preview)

**Improve layer management:**
1. Show template name instead of layer ID
2. Add layer opacity slider directly in the layer panel
3. Add layer grouping
4. Add Add from template library button that opens a modal picker

### 3.6 LiveControlPanel Improvements

**Connect to real data:**
1. Fetch scenes from SceneManager instead of using hardcoded demo scenes
2. Connect Go Live to the server live broadcast state
3. Implement actual scene switching with transition animations
4. Show real preview of each scene (rendered template)

**Add broadcast features:**
1. Audio level meters
2. Stream health indicator (bitrate, FPS, dropped frames)
3. Recording start/stop
4. Quick-replay buttons
5. Macro/shortcut buttons for common overlay actions

### 3.7 ControlPanel (Scoring) Improvements

**Fix usability issues:**
1. Remove duplicate undo button
2. Add swipe gestures for mobile (swipe right = undo, swipe left = next ball)
3. Add haptic feedback on button press (mobile)
4. Add confirmation before destructive actions (End Innings) using a custom modal
5. Add Match Summary view when match completes

**Add features:**
1. Auto-save match state periodically
2. Show run rate trend graph
3. Add Quick score mode for experienced scorers (keyboard shortcuts)
4. Add commentary box (simple text input for ball descriptions)
5. Show partnership stats
6. Add Powerplay indicator when applicable

### 3.8 Error Handling Improvements

**Global error handling:**
1. Add an error boundary component around the app
2. Add toast notifications for API errors (instead of silent failures)
3. Add retry logic for failed API calls
4. Show Connection lost banner when WebSocket disconnects
5. Add offline detection and queue actions for reconnection

**Form validation:**
1. Add real-time validation for team name (min length, max length, allowed characters)
2. Add validation for email format on registration
3. Show inline error messages (not just required attribute)
4. Add loading states for all form submissions
5. Disable submit buttons during API calls to prevent double-submission

**Empty states:**
1. Add illustrations/guidance for empty states (no teams, no matches, no templates)
2. Add Create your first [thing] CTAs in empty states
3. Add skeleton loading states instead of generic Loading... text

### 3.9 Responsive Design Improvements

**Mobile (320px - 767px):**
1. Stack ControlPanel scoring buttons in a 3-column grid (already done at 480px)
2. Make the ControlPanel header more compact
3. Add a bottom navigation bar on mobile
4. Make modal dialogs full-screen on mobile
5. Add pull-to-refresh on match list

**Tablet (768px - 1024px):**
1. Template Editor: Collapse sidebar into a slide-out drawer
2. SceneManager: Use a tabbed layout instead of side-by-side panels
3. LiveControlPanel: Use a 2-column layout with full-width preview

**Desktop (1024px+):**
1. Optimize for 1920x1080 (broadcast resolution) since this is a broadcast tool
2. Add keyboard shortcuts panel (Ctrl+/ to show all shortcuts)
3. Add multi-monitor support hints (drag overlay to second screen)

### 3.10 Accessibility

1. Add ARIA labels to all interactive elements
2. Ensure all color combinations meet WCAG AA contrast ratios
3. Add keyboard navigation support (Tab, Enter, Escape)
4. Add screen reader support for live score updates
5. Add aria-live=polite for score changes
6. Ensure all modals trap focus and can be closed with Escape

---

## 4. Priority Fixes

### Priority 1: CRITICAL (Must fix before any public use)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| P1.1 | **Add global navigation bar** with links to all sections | 2h | Users can actually find all features |
| P1.2 | **Add links to Template Editor, SceneManager, LiveControlPanel, TemplateLibrary** from Home page or nav | 1h | 40% of features become discoverable |
| P1.3 | **Build login/register pages** and auth context | 4h | Server auth system becomes functional |
| P1.4 | **Add auth headers to API calls** (templates, scenes) | 1h | Template/Scene save stops failing with 401 |
| P1.5 | **Add error feedback** to Teams and CreateMatch pages | 1h | Users understand when things go wrong |
| P1.6 | **Add 404 page** | 30min | Users are not left on a blank screen |

**Estimated total: ~9 hours**

### Priority 2: MAJOR (Should fix for beta launch)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| P2.1 | **Add unsaved changes warning** to TemplateEditor/SceneManager | 1h | Prevents data loss |
| P2.2 | **Fix CanvasEditor resize handles** | 3h | Template editing becomes functional |
| P2.3 | **Add template picker to SceneManager** layer creation | 2h | Scenes can reference actual templates |
| P2.4 | **Connect LiveControlPanel to real data** | 4h | Live control becomes functional |
| P2.5 | **Add onboarding flow** for first-time users | 4h | New users can self-serve |
| P2.6 | **Fix duplicate undo button** in ControlPanel | 15min | Reduces user confusion |
| P2.7 | **Add custom confirmation modals** instead of confirm() | 2h | Consistent design system |
| P2.8 | **Add theme toggle to all pages** (via nav bar) | 1h | Theme switching always accessible |
| P2.9 | **Add loading states/skeletons** | 2h | Better perceived performance |
| P2.10 | **Implement AnimationTimeline playback** | 3h | Template preview becomes useful |

**Estimated total: ~22 hours**

### Priority 3: MINOR (Nice to have for v1.0)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| P3.1 | Add keyboard shortcut hints panel | 1h | Power user productivity |
| P3.2 | Remove redundant Scoreboard tabs | 30min | Cleaner UI |
| P3.3 | Add dynamic page titles | 30min | Better browser UX |
| P3.4 | Add pan support to CanvasEditor | 2h | Better template editing |
| P3.5 | Add multi-select in CanvasEditor | 2h | Batch editing |
| P3.6 | Add auto-save to TemplateEditor | 1h | Data safety |
| P3.7 | Add offline detection + reconnect | 2h | Reliability |
| P3.8 | Add accessibility improvements | 4h | Inclusivity |
| P3.9 | Add mobile bottom navigation | 2h | Mobile UX |
| P3.10 | Add toast notification system | 2h | User feedback |

**Estimated total: ~15 hours**

---

## Summary

### What is Working Well

1. **Visual design** - The dark luxe theme is polished and professional. CSS design system is well-structured with tokens.
2. **Overlay rendering** - The WASP3D-style overlay is genuinely impressive. Multiple template types (scorebug, milestone, batter/bowler cards) are well-implemented.
3. **Real-time scoring** - WebSocket integration for live match updates is solid.
4. **Cricket engine** - Full cricket scoring logic with undo, strike rotation, maiden tracking.
5. **IPL-style scoreboard** - The public scoreboard view is beautiful with tabs, animations, and team colors.
6. **Theme system** - Dark/light theme with CSS variables is cleanly implemented.
7. **Property panel** - Comprehensive property editing for template elements with color palettes, font selection, and animation presets.

### What Needs Immediate Attention

The **biggest gap** is that the Template Editor, Scene Manager, Live Control Panel, and Template Library features are built but **completely unreachable** from the UI. The server has a full auth system but the client does not use it. These two issues alone mean that 4 major features are effectively dead code.

### Recommendation

Fix the **Priority 1 items first** (navigation, discoverability, auth integration). These are low-effort, high-impact fixes that will make the existing features usable. Then tackle the Priority 2 items to make the advanced features (Template Editor, Live Control) actually functional.

---

*Review completed 2026-06-21 by UX Reviewer*
