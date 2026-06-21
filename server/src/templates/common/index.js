import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commonTemplates = {};

const baseDir = __dirname;

const templateFiles = [
  'name-band.json',
  'breaking-news.json',
  'social-media.json',
  'sponsor-band.json',
  'ticker.json',
  'countdown.json',
  'quote.json'
];

templateFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const template = JSON.parse(data);
    commonTemplates[template.id] = template;
  } catch (err) {
    console.error(`Failed to load common template: ${file}`, err.message);
  }
});

export function getTemplate(id) {
  return commonTemplates[id] || null;
}

export function getAllTemplates() {
  return Object.values(commonTemplates);
}

export function getTemplatesByCategory(category) {
  return Object.values(commonTemplates).filter(t => t.category === category);
}

export { commonTemplates };
export default commonTemplates;
