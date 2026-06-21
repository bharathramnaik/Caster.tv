import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'spark-conversations';
const MAX_SUGGESTIONS = 3;

const defaultQuickActions = [
  { id: 'help', label: 'Help', icon: '?' },
  { id: 'templates', label: 'Templates', icon: '📄' },
  { id: 'scenes', label: 'Scenes', icon: '🎬' },
  { id: 'scoring', label: 'Scoring', icon: '🏏' },
];

function loadConversations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveConversations(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {}
}

function generateBotResponse(text, pathname) {
  const lower = text.toLowerCase();
  const context = pathname || '/';

  if (lower.includes('template') || lower.includes('graphic')) {
    return {
      type: 'card',
      title: 'Template Help',
      content: 'I can help you with broadcast templates. Here are some options:',
      actions: [
        { id: 'goto-library', label: 'Open Library' },
        { id: 'goto-editor', label: 'Create New' },
      ],
    };
  }

  if (lower.includes('scene') || lower.includes('overlay')) {
    return {
      type: 'card',
      title: 'Scene Management',
      content: 'Scenes let you organize your broadcast layouts. Switch between different views during your stream.',
      actions: [
        { id: 'goto-scenes', label: 'Open Scenes' },
      ],
    };
  }

  if (lower.includes('score') || lower.includes('match')) {
    return {
      type: 'steps',
      title: 'Quick Score Entry',
      steps: [
        { icon: '🏏', title: 'Select Match', description: 'Choose an active match from your dashboard' },
        { icon: '🔢', title: 'Enter Score', description: 'Use the scoring panel to log runs and wickets' },
        { icon: '📺', title: 'Go Live', description: 'The scoreboard overlay updates automatically' },
      ],
    };
  }

  if (lower.includes('help') || lower.includes('how') || lower.includes('what')) {
    return {
      type: 'card',
      title: 'Getting Started',
      content: 'Welcome to BroadcastStudio! I can help you navigate the app, manage templates, control scenes, and handle live scoring.',
      actions: [
        { id: 'goto-home', label: 'Go Home' },
        { id: 'show-tour', label: 'Take a Tour' },
      ],
    };
  }

  return {
    type: 'text',
    content: `I understand you're asking about "${text}". I'm here to help with BroadcastStudio features. Try asking about templates, scenes, scoring, or say "help" for a tour.`,
  };
}

export default function useSpark() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadConversations);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [quickActions, setQuickActions] = useState(defaultQuickActions);
  const [activeStepGuide, setActiveStepGuide] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [suggestionCount, setSuggestionCount] = useState(0);
  const messagesEndRef = useRef(null);
  const suggestionTimerRef = useRef(null);

  useEffect(() => {
    saveConversations(messages);
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen && suggestionCount < MAX_SUGGESTIONS) {
      suggestionTimerRef.current = setTimeout(() => {
        setSuggestions(prev => [
          ...prev,
          {
            id: Date.now(),
            text: 'Need help getting started?',
            context: 'proactive',
          },
        ]);
        setSuggestionCount(prev => prev + 1);
      }, 30000);
    }
    return () => {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    };
  }, [isOpen, suggestionCount]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const pathname = window.location.pathname;
      const response = generateBotResponse(text, pathname);

      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        type: response.type || 'text',
        content: response.content,
        title: response.title,
        steps: response.steps,
        actions: response.actions,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (response.actions) {
        setQuickActions(
          response.actions.map(a => ({
            id: a.id,
            label: a.label,
            icon: '⚡',
          }))
        );
      }
    }, 800 + Math.random() * 700);
  }, []);

  const executeAction = useCallback((actionId) => {
    const actionMessages = {
      'goto-library': { text: 'Opening Template Library...', path: '/library' },
      'goto-editor': { text: 'Opening Template Editor...', path: '/editor' },
      'goto-scenes': { text: 'Opening Scene Manager...', path: '/scenes' },
      'goto-home': { text: 'Going to Home...', path: '/' },
      'goto-live': { text: 'Opening Live Control...', path: '/live' },
      'goto-teams': { text: 'Opening Teams...', path: '/teams' },
      'goto-points': { text: 'Opening Points Table...', path: '/points' },
      'goto-integrations': { text: 'Opening Integrations...', path: '/integrations' },
      'goto-streaming': { text: 'Opening Streaming Dashboard...', path: '/streaming' },
    };

    const action = actionMessages[actionId];
    if (action) {
      sendMessage(action.text);
      setTimeout(() => {
        window.location.href = action.path;
      }, 600);
    } else if (actionId === 'show-tour') {
      setActiveOverlay({
        steps: [
          { target: '.nav-brand', title: 'Navigation', description: 'Use the top bar to navigate between features.' },
          { target: '.nav-links', title: 'Quick Links', description: 'Jump to any section with one click.' },
        ],
      });
      sendMessage('Starting tour...');
    } else {
      sendMessage(`Executing action: ${actionId}`);
    }
  }, [sendMessage]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSuggestions([]);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setSuggestions([]);
    if (messages.length === 0) {
      const welcome = {
        id: Date.now(),
        role: 'bot',
        type: 'card',
        title: 'Welcome to Spark!',
        content: "I'm your AI co-pilot for BroadcastStudio. Ask me anything about templates, scenes, scoring, or say 'help' for a tour.",
        actions: [
          { id: 'show-tour', label: 'Take a Tour' },
          { id: 'goto-library', label: 'Browse Templates' },
        ],
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, [messages.length]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isOpen,
    messages,
    isTyping,
    suggestions,
    quickActions,
    activeStepGuide,
    activeOverlay,
    scrollToBottom,
    sendMessage,
    executeAction,
    close,
    open,
    clearHistory,
    setActiveStepGuide,
    setActiveOverlay,
  };
}
