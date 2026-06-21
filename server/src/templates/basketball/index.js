import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basketballTemplates = {};

const baseDir = __dirname;

const templateFiles = [
  'scorebug.json',
  'shot-clock.json',
  'player-stats.json'
];

templateFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const template = JSON.parse(data);
    basketballTemplates[template.id] = template;
  } catch (err) {
    console.error(`Failed to load basketball template: ${file}`, err.message);
  }
});

export function getTemplate(id) {
  return basketballTemplates[id] || null;
}

export function getAllTemplates() {
  return Object.values(basketballTemplates);
}

export function getTemplatesByCategory(category) {
  return Object.values(basketballTemplates).filter(t => t.category === category);
}

export { basketballTemplates };
export default basketballTemplates;
