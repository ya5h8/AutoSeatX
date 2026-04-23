const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = {
  // Base Colors
  '--bg-midnight': '--bg-charcoal',
  'rgba(26, 26, 46,': 'rgba(28, 28, 28,',
  'rgba(47, 47, 47,': 'rgba(42, 42, 42,',
  
  // Accents
  '--accent-coral': '--accent-terracotta',
  'rgba(255, 107, 107,': 'rgba(224, 122, 95,',
  
  '--accent-amber': '--accent-gold',
  'rgba(252, 163, 17,': 'rgba(242, 204, 143,',
  
  '--accent-sage': '--accent-moss',
  'rgba(78, 204, 163,': 'rgba(129, 178, 154,',

  // Text colors
  '--text-cream': '--text-ivory'
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  for (const [oldValue, newValue] of Object.entries(replacements)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newValue);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated colors in ${path.basename(filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Color replacement complete.');
