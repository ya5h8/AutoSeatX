const fs = require('fs');
const path = require('path');

const files = [
  './src/index.css',
  './src/pages/Login.jsx',
  './src/pages/StudentPage.jsx',
  './src/pages/Dashboard.jsx'
];

const replacements = [
  { from: /rgba\(224, 122, 95/g, to: 'rgba(255, 107, 107' },
  { from: /rgba\(129, 178, 154/g, to: 'rgba(78, 204, 163' },
  { from: /rgba\(242, 204, 143/g, to: 'rgba(252, 163, 17' },
  { from: /rgba\(11, 28, 24/g, to: 'rgba(26, 26, 46' },
  { from: /#0B1C10/gi, to: '#1A1A2E' },
  { from: /#111A14/gi, to: '#2F2F2F' },
  { from: /#ADBCA4/gi, to: '#A0AAB2' },
  { from: /#E07A5F/gi, to: '#FF6B6B' },
  { from: /#F2CC8F/gi, to: '#FCA311' },
  { from: /#81B29A/gi, to: '#4ECCA3' },
  { from: /rgba\(20, 30, 22, 0\.45\)/g, to: 'rgba(26, 26, 46, 0.55)' },
  { from: /rgba\(30, 45, 33, 0\.6\)/g, to: 'rgba(47, 47, 47, 0.65)' },
  { from: /#2d453b/gi, to: '#2F2F2F' },
  { from: /bg-deep-forest/g, to: 'bg-midnight' },
  { from: /forest green/gi, to: 'deep indigo' }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
