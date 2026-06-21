import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tennisTemplates = {};

const baseDir = __dirname;

const templateFiles = [
  'scoreboard.json',
  'serve-indicator.json',
  'set-score.json'
];

templateFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const template = JSON.parse(data);
    tennisTemplates[template.id] = template;
  } catch (err) {
    console.error(`Failed to load tennis template: ${file}`, err.message);
  }
});

export function getTemplate(id) {
  return tennisTemplates[id] || null;
}

export function getAllTemplates() {
  return Object.values(tennisTemplates);
}

export function getTemplatesByCategory(category) {
  return Object.values(tennisTemplates).filter(t => t.category === category);
}

export { tennisTemplates };
export default tennisTemplates;
