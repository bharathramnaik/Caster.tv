let idCounter = 0;

export function announceToScreenReader(message, priority = 'polite') {
  const el = document.createElement('div');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('role', 'status');
  el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
  document.body.appendChild(el);
  el.textContent = message;
  setTimeout(() => el.remove(), 1000);
}

export function trapFocus(element) {
  if (!element) return () => {};

  const focusable = getFocusableElements(element);
  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKey(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  element.addEventListener('keydown', handleKey);
  first.focus();

  return () => element.removeEventListener('keydown', handleKey);
}

export function getFocusableElements(container) {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector));
}

export function handleKeyboardNavigation(event, options = {}) {
  const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = options;

  switch (event.key) {
    case 'Enter':
    case ' ':
      if (onEnter) { event.preventDefault(); onEnter(event); }
      break;
    case 'Escape':
      if (onEscape) { event.preventDefault(); onEscape(event); }
      break;
    case 'ArrowUp':
      if (onArrowUp) { event.preventDefault(); onArrowUp(event); }
      break;
    case 'ArrowDown':
      if (onArrowDown) { event.preventDefault(); onArrowDown(event); }
      break;
    case 'ArrowLeft':
      if (onArrowLeft) { event.preventDefault(); onArrowLeft(event); }
      break;
    case 'ArrowRight':
      if (onArrowRight) { event.preventDefault(); onArrowRight(event); }
      break;
    default:
      break;
  }
}

export function generateId(prefix = 'a11y') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function highContrastMode(enabled) {
  if (enabled === undefined) {
    return window.matchMedia('(prefers-contrast: more)').matches ||
           document.documentElement.classList.contains('high-contrast');
  }
  document.documentElement.classList.toggle('high-contrast', !!enabled);
}
