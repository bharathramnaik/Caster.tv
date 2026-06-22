import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cached = null;

function loadPresets() {
  if (cached) return cached;
  try {
    const raw = readFileSync(join(__dirname, 'presets.json'), 'utf-8');
    cached = JSON.parse(raw);
  } catch {
    cached = [];
  }
  return cached;
}

export function getAllPresets(filters = {}) {
  let presets = loadPresets();
  if (filters.sport) presets = presets.filter(p => p.sport === filters.sport);
  if (filters.type) presets = presets.filter(p => p.type === filters.type);
  return presets;
}

export function getPresetById(id) {
  return loadPresets().find(p => p.id === id) || null;
}

export function getPresetsBySport(sport) {
  return loadPresets().filter(p => p.sport === sport);
}

export function getPresetsByType(type) {
  return loadPresets().filter(p => p.type === type);
}
