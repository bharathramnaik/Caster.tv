/**
 * Spark Bot Knowledge Base
 * Comprehensive app knowledge: pages, features, workflows, tips.
 */

export const PAGES = {
  dashboard: {
    name: 'Dashboard',
    description: 'Overview of matches, recent activity, and quick stats.',
    tips: ['View all active matches at a glance', 'Quickly start a new match from here']
  },
  matches: {
    name: 'Matches',
    description: 'Create, manage, and view cricket matches.',
    tips: ['Create matches with team details and match settings', 'Track live scores in real-time']
  },
  switcher: {
    name: 'Live Switcher',
    description: 'Switch between camera inputs and scenes during a live broadcast.',
    tips: ['Use keyboard shortcuts for fast switching', 'Preview transitions before going live']
  },
  scenes: {
    name: 'Scenes',
    description: 'Design and manage broadcast scenes with layers and animations.',
    tips: ['Use layers to composite graphics', 'Duplicate scenes for quick variations']
  },
  templates: {
    name: 'Templates',
    description: 'Pre-built graphics templates for overlays, lower thirds, and scoreboards.',
    tips: ['Browse by category for quick access', 'Create your own templates from scratch']
  },
  streaming: {
    name: 'Streaming',
    description: 'Configure and manage live streaming outputs (RTMP, WebRTC).',
    tips: ['Monitor stream health in real-time', 'Set up multiple outputs for redundancy']
  },
  recording: {
    name: 'Recording',
    description: 'Record your broadcast for later editing and playback.',
    tips: ['Schedule recordings in advance', 'Choose quality presets for best results']
  },
  audio: {
    name: 'Audio Mixer',
    description: 'Control audio levels, mute, and solo individual tracks.',
    tips: ['Use solo to isolate a single channel', 'Set levels before going live']
  },
  data: {
    name: 'Data Feeds',
    description: 'Connect to live data feeds for scores and stats.',
    tips: ['Subscribe to multiple feeds simultaneously', 'Filter feeds by sport type']
  },
  collaboration: {
    name: 'Collaboration',
    description: 'Work together with your team in real-time.',
    tips: ['Invite team members with specific roles', 'See who is working on what in real-time']
  },
  exports: {
    name: 'Exports',
    description: 'Export scenes and recordings in various formats.',
    tips: ['Export for OBS, NDI, or streaming', 'Download recordings as MP4']
  },
  projects: {
    name: 'Projects',
    description: 'Organize your work into projects.',
    tips: ['Keep related scenes and templates together', 'Share projects with collaborators']
  }
};

export const GUIDES = {
  create_match: {
    title: 'How to Create a Match',
    steps: [
      { step: 1, title: 'Navigate to Matches', description: 'Go to the Matches page from the sidebar.' },
      { step: 2, title: 'Click "New Match"', description: 'Click the New Match button to open the creation form.' },
      { step: 3, title: 'Enter Team Details', description: 'Fill in team names, abbreviations, and colors for both teams.' },
      { step: 4, title: 'Set Match Settings', description: 'Choose match type (T20/ODI/Test), max overs, venue, and tournament name.' },
      { step: 5, title: 'Create', description: 'Click Create to start the match. You can now begin scoring!'}
    ]
  },
  start_streaming: {
    title: 'How to Start Streaming',
    steps: [
      { step: 1, title: 'Go to Streaming', description: 'Navigate to the Streaming page from the sidebar.' },
      { step: 2, title: 'Add Output', description: 'Click Add Output and select the type (RTMP, WebRTC, etc.).' },
      { step: 3, title: 'Configure Settings', description: 'Enter your stream URL, key, and quality settings.' },
      { step: 4, title: 'Start Stream', description: 'Click Start on the output to begin streaming. Monitor health on the dashboard.' }
    ]
  },
  create_template: {
    title: 'How to Create a Template',
    steps: [
      { step: 1, title: 'Go to Templates', description: 'Navigate to the Templates page from the sidebar.' },
      { step: 2, title: 'Click "New Template"', description: 'Start a new template from scratch or choose a category.' },
      { step: 3, title: 'Add Elements', description: 'Drag and drop text, shapes, images, and data bindings onto the canvas.' },
      { step: 4, title: 'Style Elements', description: 'Customize colors, fonts, sizes, and positions.' },
      { step: 5, title: 'Add Animations', description: 'Set entrance and exit animations for elements.' },
      { step: 6, title: 'Save', description: 'Name your template and save it. You can now use it in scenes.' }
    ]
  },
  use_switcher: {
    title: 'How to Use the Switcher',
    steps: [
      { step: 1, title: 'Open Switcher', description: 'Navigate to the Live Switcher page.' },
      { step: 2, title: 'Add Inputs', description: 'Connect your camera feeds and scene sources.' },
      { step: 3, title: 'Preview', description: 'Select an input on the preview bus to prepare your next shot.' },
      { step: 4, title: 'Transition', description: 'Use Cut or Fade to switch the preview input to program (live).' },
      { step: 5, title: 'Record Macro', description: 'Record a macro sequence for automated switching patterns.' }
    ]
  },
  start_recording: {
    title: 'How to Record',
    steps: [
      { step: 1, title: 'Go to Recording', description: 'Navigate to the Recording page from the sidebar.' },
      { step: 2, title: 'Choose Quality', description: 'Select a quality preset or create a custom one.' },
      { step: 3, title: 'Start Recording', description: 'Click Start Recording. You can pause and resume at any time.' }
    ]
  },
  collaborate: {
    title: 'How to Collaborate',
    steps: [
      { step: 1, title: 'Open a Project', description: 'Navigate to Projects and open one.' },
      { step: 2, title: 'Invite Users', description: 'Click Invite and enter their email or username.' },
      { step: 3, title: 'Set Roles', description: 'Assign roles: Admin, Editor, or Viewer.' },
      { step: 4, title: 'Work Together', description: 'See real-time cursors and edits from your team members.' }
    ]
  }
};

export const FAQ = [
  { q: 'How do I create a match?', a: 'Go to Matches and click New Match. Fill in the team details and match settings.' },
  { q: 'How do I start streaming?', a: 'Go to Streaming, add an RTMP output with your stream key, and click Start.' },
  { q: 'How do I create a template?', a: 'Go to Templates, click New Template, add elements, style them, and save.' },
  { q: 'How do I switch scenes?', a: 'Use the Live Switcher page. Select a preview input and transition to program.' },
  { q: 'How do I record?', a: 'Go to Recording, choose quality, and click Start Recording.' },
  { q: 'How do I invite collaborators?', a: 'Open a project, click Invite, and enter their details with a role.' },
  { q: 'Can I use keyboard shortcuts?', a: 'Yes! Use number keys 1-9 for quick scene switching in the Switcher.' },
  { q: 'How do I export a scene?', a: 'Go to Scenes, select a scene, and choose Export. Pick format (HTML, OBS, NDI, JSON).' }
];

export const PAGE_ACTIONS = {
  dashboard: [
    { id: 'create_match', label: 'Create Match', icon: '🏏' },
    { id: 'view_matches', label: 'View Matches', icon: '📋' },
    { id: 'start_stream', label: 'Start Streaming', icon: '📡' }
  ],
  matches: [
    { id: 'create_match', label: 'New Match', icon: '➕' },
    { id: 'view_scores', label: 'View Scores', icon: '📊' },
    { id: 'export_csv', label: 'Export CSV', icon: '📥' }
  ],
  switcher: [
    { id: 'switch_scene', label: 'Switch Scene', icon: '🎬' },
    { id: 'start_recording', label: 'Record', icon: '⏺️' },
    { id: 'show_health', label: 'Stream Health', icon: '💓' }
  ],
  scenes: [
    { id: 'add_scene', label: 'New Scene', icon: '🎨' },
    { id: 'list_scenes', label: 'All Scenes', icon: '📋' },
    { id: 'export_overlay', label: 'Export', icon: '📤' }
  ],
  templates: [
    { id: 'create_template', label: 'New Template', icon: '📐' },
    { id: 'list_templates', label: 'All Templates', icon: '📋' },
    { id: 'show_categories', label: 'Categories', icon: '📂' }
  ],
  streaming: [
    { id: 'start_rtmp', label: 'Start Stream', icon: '📡' },
    { id: 'show_health', label: 'Health', icon: '💓' },
    { id: 'change_bitrate', label: 'Bitrate', icon: '⚡' }
  ],
  recording: [
    { id: 'start_record', label: 'Record', icon: '⏺️' },
    { id: 'stop_record', label: 'Stop', icon: '⏹️' },
    { id: 'schedule_record', label: 'Schedule', icon: '📅' }
  ],
  audio: [
    { id: 'toggle_mute', label: 'Mute', icon: '🔇' },
    { id: 'set_volume', label: 'Volume', icon: '🔊' }
  ],
  collaboration: [
    { id: 'invite_user', label: 'Invite', icon: '👤' },
    { id: 'show_activity', label: 'Activity', icon: '📝' }
  ],
  data: [
    { id: 'get_scores', label: 'Live Scores', icon: '📊' },
    { id: 'get_matches', label: 'Matches', icon: '🏏' }
  ],
  templates: [
    { id: 'create_template', label: 'New Template', icon: '📐' },
    { id: 'show_categories', label: 'Categories', icon: '📂' }
  ],
  projects: [
    { id: 'create_match', label: 'New Match', icon: '➕' },
    { id: 'show_activity', label: 'Activity', icon: '📝' }
  ],
  exports: [
    { id: 'export_overlay', label: 'Export Overlay', icon: '📤' },
    { id: 'list_templates', label: 'Templates', icon: '📋' }
  ]
};
