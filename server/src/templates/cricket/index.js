const fs = require('fs');
const path = require('path');

const cricketTemplates = {};

const baseDir = __dirname;

const templateFiles = [
  'scoreboard.json',
  'player-card.json',
  'match-summary.json',
  'ball-by-ball.json',
  'partnership.json'
];

templateFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const template = JSON.parse(data);
    cricketTemplates[template.id] = template;
  } catch (err) {
    console.error(`Failed to load cricket template: ${file}`, err.message);
  }
});

function getTemplate(id) {
  return cricketTemplates[id] || null;
}

function getAllTemplates() {
  return Object.values(cricketTemplates);
}

function getTemplatesByCategory(category) {
  return Object.values(cricketTemplates).filter(t => t.category === category);
}

module.exports = {
  cricketTemplates,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory
};
